// The server half of `npm run check:no-contact`. It starts the real app (app.js, with its
// routes, middleware and startup hook) in-process, with three things replaced so that it
// needs no database and can send nothing:
//   - mongoose.connect does nothing, and the User model reads and writes an array
//   - nodemailer and its SendGrid transport are stubs that count what they are asked to do
//   - MONGO_URI and MAIL_KEY are empty
// It runs twice: once with NO_CONTACT=true, asserting the guarantees, and once without it
// as a control, to prove that the same stubs do see mail when the normal app sends it.
// What it cannot cover is listed in README "No-contact mode".
const { spawnSync } = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const http = require('http')
const net = require('net')
const path = require('path')

const root = path.join(__dirname, '..')
const ROBOTS_HEADER = 'noindex, nofollow'
const VISITOR = { name: 'Visitor', email: 'visitor@example.org', password: 'visitor-password' }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function until(condition, timeout = 15000) {
    const end = Date.now() + timeout
    while (Date.now() < end) {
        if (condition()) return true
        await sleep(25)
    }
    return condition()
}

function freePort() {
    return new Promise((resolve, reject) => {
        const probe = net.createServer()
        probe.on('error', reject)
        probe.listen(0, '127.0.0.1', () => {
            const { port } = probe.address()
            probe.close(() => resolve(port))
        })
    })
}

/** Replaces a dependency before anything loads it, so the real one never runs. */
function stubModule(name, exports) {
    const id = require.resolve(name, { paths: [root] })
    require.cache[id] = { id, filename: id, loaded: true, exports, children: [], paths: [] }
}

async function run(mode) {
    const noContact = mode === 'no-contact'
    const log = console.log.bind(console)
    const failures = []
    const check = (label, ok, detail) => {
        log(`  ${ok ? 'ok  ' : 'FAIL'} ${label}${!ok && detail !== undefined ? ` (got ${JSON.stringify(detail)})` : ''}`)
        if (!ok) failures.push(label)
    }
    process.on('unhandledRejection', (err) => {
        log('  FAIL unhandled rejection', err)
        process.exit(1)
    })

    const port = Number(process.env.CHECK_NO_CONTACT_PORT) || (await freePort())
    process.chdir(root)
    // Set, even when empty, so that a local .env cannot supply real values (dotenv never overrides).
    Object.assign(process.env, {
        NO_CONTACT: noContact ? 'true' : '',
        NODE_ENV: 'production',
        PORT: String(port),
        MONGO_URI: '',
        MAIL_KEY: '',
        JWT_SECRET: crypto.randomBytes(24).toString('hex')
    })

    const mail = { transports: 0, sent: [] }
    stubModule('nodemailer', {
        createTransport: () => {
            mail.transports += 1
            return {
                sendMail: (message) => {
                    mail.sent.push(message)
                    return Promise.resolve({ stub: true })
                }
            }
        }
    })
    stubModule('nodemailer-sendgrid-transport', () => ({}))

    const mongoose = require(require.resolve('mongoose', { paths: [root] }))
    mongoose.connect = () => Promise.resolve(mongoose)

    console.log = () => {} // the app logs every request body; keep the report readable
    require(path.join(root, 'app.js'))

    const users = []
    const User = mongoose.model('User')
    User.findOne = (query) =>
        Promise.resolve(users.find((user) => Object.entries(query).every(([key, value]) => String(user[key]) === String(value))) || null)
    User.prototype.save = function () {
        const invalid = this.validateSync()
        if (invalid) return Promise.reject(invalid)
        if (!users.includes(this)) users.push(this)
        return Promise.resolve(this)
    }

    const request = (method, urlPath, body) =>
        new Promise((resolve, reject) => {
            const data = body === undefined ? null : JSON.stringify(body)
            const headers = data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}
            const req = http.request({ host: '127.0.0.1', port, path: urlPath, method, headers }, (res) => {
                let text = ''
                res.setEncoding('utf8')
                res.on('data', (chunk) => (text += chunk))
                res.on('end', () => {
                    let json = null
                    try {
                        json = JSON.parse(text)
                    } catch (err) {}
                    resolve({ status: res.statusCode, headers: res.headers, text, json })
                })
            })
            req.on('error', reject)
            if (data) req.write(data)
            req.end()
        })

    let up = false
    for (let attempt = 0; attempt < 100 && !up; attempt += 1) {
        up = await request('GET', '/robots.txt').then(() => true, () => sleep(50).then(() => false))
    }
    if (!up) throw new Error(`the app did not start listening on port ${port}`)

    if (noContact) {
        const { findForbidden } = require('./check-no-contact')
        const { GUEST, seedGuest } = require(path.join(root, 'noContact.js'))
        const bcrypt = require(require.resolve('bcryptjs', { paths: [root] }))

        log('\ncheck:no-contact server, NO_CONTACT=true (no database, mail stubbed)')
        check('startup needs no MAIL_KEY and constructs no mail transport', mail.transports === 0, mail.transports)

        // X-Robots-Tag on every kind of response, and nothing forbidden in what the server says.
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'client', 'build', 'asset-manifest.json'), 'utf8'))
        const probes = [
            ['GET', '/'],
            ['GET', '/signin'],
            ['GET', '/reset'],
            ['GET', '/robots.txt'],
            ['GET', '/manifest.json'],
            ['GET', manifest.files['main.js']],
            ['GET', '/allpost'],
            ['POST', '/signin', {}],
            ['POST', '/signup', {}],
            ['POST', '/reset-password', {}]
        ]
        for (const [method, urlPath, body] of probes) {
            const res = await request(method, urlPath, body)
            check(`${method} ${urlPath} -> ${res.status} carries X-Robots-Tag: ${ROBOTS_HEADER}`, res.headers['x-robots-tag'] === ROBOTS_HEADER, res.headers['x-robots-tag'])
            const findings = findForbidden(JSON.stringify(res.headers) + '\n' + res.text)
            check(`${method} ${urlPath} response has nothing forbidden`, findings.length === 0, findings)
        }
        const page = await request('GET', '/')
        check('GET / serves the noindex page', page.status === 200 && /<meta name="robots" content="noindex, nofollow">/.test(page.text))

        // The guest account: created by the startup hook, once, the way signup would create it.
        check('the database starts with no accounts', users.length === 0, users.length)
        mongoose.connection.emit('connected')
        await until(() => users.length > 0)
        check('connecting to the database creates exactly one account', users.length === 1, users.length)
        const guest = users[0] || {}
        check(`it is ${GUEST.email}, named "${GUEST.name}"`, guest.email === GUEST.email && guest.name === GUEST.name, [guest.email, guest.name])
        check('with the default picture', guest.pic === User.schema.path('pic').defaultValue, guest.pic)
        check(
            'and the demo password, hashed with bcrypt cost 12 like signup',
            /^\$2[aby]\$12\$/.test(guest.password || '') && (await bcrypt.compare(GUEST.password, guest.password || '')),
            String(guest.password).slice(0, 7)
        )
        mongoose.connection.emit('connected')
        await seedGuest()
        await sleep(200)
        check('seeding again (restart, reconnect) creates nothing', users.length === 1, users.length)

        const signin = await request('POST', '/signin', { email: GUEST.email, password: GUEST.password })
        check('the guest login shown on the sign-in page works', signin.status === 200 && Boolean(signin.json.token) && signin.json.user.email === GUEST.email, signin.text)

        // Password reset is refused before it touches the account or the mailer.
        const reset = await request('POST', '/reset-password', { email: GUEST.email })
        check(`POST /reset-password is refused (${reset.status}: ${reset.json && reset.json.error})`, reset.status >= 400 && reset.status < 500 && Boolean(reset.json && reset.json.error), reset.text)
        check('and leaves no reset token on the account', guest.resetToken === undefined && guest.expireToken === undefined)
        const newPassword = await request('POST', '/new-password', { password: 'changed', token: 'anything' })
        check(`POST /new-password is refused (${newPassword.status})`, newPassword.status >= 400 && newPassword.status < 500 && Boolean(newPassword.json && newPassword.json.error), newPassword.text)
        check('and the guest password is unchanged', await bcrypt.compare(GUEST.password, guest.password || ''))

        // Signup works and sends nothing.
        const signup = await request('POST', '/signup', VISITOR)
        check('POST /signup succeeds', signup.status === 200 && signup.json.message === 'Saved Successfully', signup.text)
        await sleep(300)
        check('the visitor account exists', users.length === 2 && users[1].email === VISITOR.email, users.map((user) => user.email))
        check('signup sent no welcome mail', mail.sent.length === 0, mail.sent.length)

        const direct = await require(path.join(root, 'mailer.js')).sendMail({ to: VISITOR.email, subject: 'check', html: 'check' })
        check('mailer.sendMail() sends nothing and resolves with null', direct === null && mail.sent.length === 0, direct)
        check('no mail transport was ever constructed', mail.transports === 0, mail.transports)
    } else {
        log('\ncheck:no-contact server, control without NO_CONTACT (same stubs, normal behaviour)')
        check('startup constructs the mail transport', mail.transports === 1, mail.transports)
        const page = await request('GET', '/')
        check('GET / carries no X-Robots-Tag', page.headers['x-robots-tag'] === undefined, page.headers['x-robots-tag'])
        mongoose.connection.emit('connected')
        await sleep(500)
        check('connecting to the database creates no account', users.length === 0, users.length)
        const signup = await request('POST', '/signup', VISITOR)
        await until(() => mail.sent.length > 0, 3000)
        check('POST /signup succeeds and the stub sees the welcome mail', signup.status === 200 && mail.sent.length === 1 && mail.sent[0].to === VISITOR.email, mail.sent.length)
        const reset = await request('POST', '/reset-password', { email: VISITOR.email })
        check('POST /reset-password is accepted and the stub sees the reset mail', reset.status === 200 && mail.sent.length === 2 && Boolean(users[0].resetToken), [reset.status, mail.sent.length])
        const newPassword = await request('POST', '/new-password', { password: 'changed', token: 'not-a-token' })
        check('POST /new-password reaches its own handler', newPassword.status === 422 && /session expired/.test(newPassword.text), newPassword.text)
    }

    if (failures.length > 0) {
        console.error(`\ncheck:no-contact server FAILED (${mode}): ${failures.length} failure(s)`)
        process.exit(1)
    }
    process.exit(0) // the app is still listening
}

function main() {
    const mode = process.argv[2]
    if (mode) {
        run(mode).catch((err) => {
            console.error(err)
            process.exit(1)
        })
        return
    }
    if (!fs.existsSync(path.join(root, 'client', 'build', 'index.html'))) {
        console.error('check:no-contact server: client/build is missing. Run `npm run check:no-contact`, which builds it first.')
        process.exit(1)
    }
    for (const each of ['no-contact', 'normal']) {
        const result = spawnSync(process.execPath, [__filename, each], { cwd: root, stdio: 'inherit' })
        if (result.status !== 0) process.exit(result.status === null ? 1 : result.status)
    }
    console.log('\ncheck:no-contact server passed')
}

main()
