// Builds the client with NO_CONTACT=true and fails if anything that leads to the developer
// is in client/build, then runs check-no-contact-server.js for the server-side guarantees.
// Run it with `npm run check:no-contact`. See README "No-contact mode".
//
// It scans every text file in client/build (HTML, JS, CSS, JSON, TXT, SVG, source maps) and
// the names of all files, so a contact detail hidden with CSS or left behind a runtime
// check still fails. To scan the existing build without rebuilding: `--no-build`. To scan
// some other build directory, and nothing else: `--no-build <dir>`.
const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const defaultBuildDir = path.join(root, 'client', 'build')

// The normal domains of the developer's sites. "showcase.<domain>" is that site's own
// no-contact deployment, so the match excludes that prefix.
const NORMAL_DOMAINS = [
    'ashwinarora.com',
    'ashdex.app',
    'lizardpoisonspock.com',
    'hltools.tech',
    'ethtactoe.com',
    'socialnetwrk.in',
    'ethhousie.com'
]

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const FORBIDDEN = [
    { name: 'email address', pattern: /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi, except: /^guest@example\.com$/ },
    { name: 'mailto:', pattern: /mailto:/gi },
    { name: 'tel:', pattern: /\btel:\+?\d/gi },
    { name: 'calendly', pattern: /calendly/gi },
    { name: 't.me link', pattern: /(?<![a-z0-9.-])t\.me\//gi },
    { name: 'wa.me link', pattern: /(?<![a-z0-9.-])wa\.me\//gi },
    { name: 'telegram', pattern: /telegram/gi },
    { name: 'whatsapp', pattern: /whatsapp/gi },
    { name: 'linkedin', pattern: /linkedin/gi },
    { name: 'x.com / twitter.com', pattern: /(?<![a-z0-9.-])(?:x|twitter)\.com/gi },
    { name: 'github.com/ashwinarora', pattern: /github\.com\/ashwinarora/gi },
    { name: 'developer handles', pattern: /@ashwin|ashwin-arora|ashwinarora_/gi },
    { name: 'flickr', pattern: /flickr/gi },
    { name: 'drive.google.com', pattern: /drive\.google\.com/gi },
    { name: 'Google Form', pattern: /docs\.google\.com/gi },
    { name: 'herokuapp', pattern: /herokuapp/gi },
    { name: 'discord', pattern: /discord/gi },
    { name: 'footer credit', pattern: /Developed By/g },
    { name: 'portfolio link', pattern: /Developer Portfolio/g },
    { name: 'hire', pattern: /hire/gi },
    { name: 'developer logo', pattern: /myLogo/gi },
    { name: 'password reset UI', pattern: /Forgot Password|\/reset-password|\/new-password/gi },
    ...NORMAL_DOMAINS.map((domain) => ({
        name: `normal domain ${domain}`,
        pattern: new RegExp(`(?<!showcase\\.)(?<![a-z0-9-])${escape(domain)}`, 'gi')
    }))
]

// Third-party strings that match a pattern above and are known not to be contact details.
// Keep this list short and specific: every entry is a hole in the check. `context` must
// match the 60 characters either side of the hit.
// Each entry: { name: <the FORBIDDEN name it excuses>, context: /…/ } and one line saying why.
const ALLOWED = [
    // (none: React, react-router and Materialize ship nothing that matches)
]

/** Every forbidden match in `text`, each with the text around it. */
function findForbidden(text) {
    const findings = []
    for (const { name, pattern, except } of FORBIDDEN) {
        for (const hit of text.matchAll(pattern)) {
            if (except && except.test(hit[0])) continue
            const context = text.slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60).replace(/\s+/g, ' ')
            if (ALLOWED.some((allowed) => allowed.name === name && allowed.context.test(context))) continue
            findings.push({ what: name, match: hit[0], context })
        }
    }
    return findings
}

const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.xml', '.txt', '.svg', '.map', '.webmanifest', '.md'])
/** Files that must not be in a no-contact build at all, whatever they contain. */
const FORBIDDEN_FILES = [
    { pattern: /\.map$/i, why: 'source maps contain the original source, including removed branches' },
    { pattern: /myLogo/i, why: 'the developer logo' },
    { pattern: /sitemap/i, why: 'a sitemap advertises the normal domain' }
]

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]
    )
}

function checkBuild(buildDir) {
    const findings = []
    const files = walk(buildDir)
    const notScanned = []
    let scanned = 0

    for (const file of files) {
        const name = path.relative(buildDir, file)
        for (const { pattern, why } of FORBIDDEN_FILES) {
            if (pattern.test(name)) findings.push({ file: name, what: `file must not be in the build (${why})`, match: name })
        }
        if (!TEXT.has(path.extname(file).toLowerCase())) {
            notScanned.push(name)
            continue
        }
        scanned += 1
        for (const finding of findForbidden(fs.readFileSync(file, 'utf8'))) findings.push({ file: name, ...finding })
    }

    const html = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8')
    if (!/<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)) {
        findings.push({ file: 'index.html', what: 'missing noindex', match: '<meta name="robots" content="noindex, nofollow">' })
    }
    if (/og:image|twitter:image/i.test(html)) {
        findings.push({ file: 'index.html', what: 'social preview image', match: 'og:image' })
    }
    if (/<!--/.test(html)) {
        findings.push({ file: 'index.html', what: 'HTML comment', match: '<!--' })
    }
    const robots = path.join(buildDir, 'robots.txt')
    if (fs.existsSync(robots) && /^\s*(?:sitemap|host)\s*:/im.test(fs.readFileSync(robots, 'utf8'))) {
        findings.push({ file: 'robots.txt', what: 'advertises a URL', match: 'Sitemap: / Host:' })
    }

    if (findings.length > 0) {
        console.error(`\ncheck:no-contact FAILED: ${findings.length} finding(s) in ${buildDir}\n`)
        for (const finding of findings) {
            console.error(`  ${finding.file}: ${finding.what}: ${JSON.stringify(finding.match)}`)
            if (finding.context) console.error(`      …${finding.context}…`)
        }
        console.error('\nGate the UI on NO_CONTACT (client/src/noContact.js). See README "No-contact mode".')
        process.exit(1)
    }

    console.log(`check:no-contact client passed: ${scanned} text files and ${files.length} file names scanned in ${buildDir}`)
    if (notScanned.length > 0) console.log(`  binary files, not scanned for text (look at them when they change): ${notScanned.join(', ')}`)
}

function main() {
    const args = process.argv.slice(2)

    if (!args.includes('--no-build')) {
        if (!fs.existsSync(path.join(root, 'client', 'node_modules'))) {
            console.error('check:no-contact: client dependencies are missing. Run `npm install --prefix client` first.')
            process.exit(1)
        }
        // The same build command Railway runs (see "railway-build"), with the flag set.
        execSync('npm run build --prefix client', { cwd: root, stdio: 'inherit', env: { ...process.env, NO_CONTACT: 'true', CI: 'false' } })
    }

    const dir = args.find((arg) => !arg.startsWith('--'))
    checkBuild(dir ? path.resolve(dir) : defaultBuildDir)
    if (dir) return

    const server = spawnSync(process.execPath, [path.join(__dirname, 'check-no-contact-server.js')], { cwd: root, stdio: 'inherit' })
    if (server.status !== 0) process.exit(server.status === null ? 1 : server.status)

    console.log('\ncheck:no-contact passed')
}

module.exports = { findForbidden }

if (require.main === module) main()
