# Social Network

A full-stack social networking app: an Express and MongoDB (mongoose) API with JWT authentication, and a React client (Create React App, MaterializeCSS). Sign up, post with pictures, like, comment, follow people and search users.

| Path | What it is |
| --- | --- |
| `app.js`, `routes/`, `models/`, `middleware/` | The API. In production it also serves the built client |
| `mailer.js` | The only place the server sends e-mail from |
| `noContact.js` | The server's no-contact flag and guest account (see below) |
| `client/` | The React app. `client/src/noContact.js` is its no-contact flag |
| `scripts/` | `npm run check:no-contact` |

## Running it

You need Node, npm and a MongoDB database.

```sh
npm install
npm install --prefix client
```

The server reads its configuration from the environment (a `.env` file in the root is loaded if present, and is git-ignored):

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string. Required |
| `JWT_SECRET` | Secret for signing login tokens. Required |
| `MAIL_KEY` | SendGrid API key for the welcome and password-reset mails. Not used in no-contact mode |
| `PORT` | Port to listen on. Default `5000` |
| `NODE_ENV` | `production` makes the server serve `client/build` |
| `NO_CONTACT` | `true` for no-contact mode (see below). Leave unset otherwise |

Development, with hot reload (the client dev server proxies API calls to port 5000):

```sh
npm run serverstart            # API on http://localhost:5000
npm start --prefix client      # client on http://localhost:3000
```

Production, which is what the deployment runs:

```sh
npm run railway-build          # installs the client's dependencies and builds client/build
NODE_ENV=production npm start  # serves the API and the built client on PORT
```

Picture uploads go from the browser straight to Cloudinary; the server stores only the URL.

## No-contact mode

This repo builds two deployments from the same branch. The only difference between them is one environment variable:

| `NO_CONTACT` | Result |
| --- | --- |
| unset, or anything but `true` | The normal app |
| `true` | Identical, except a visitor has no way to contact me or find my contact details |

Set it on the service, for both the build and the running server, and deploy the default branch. Nothing else is needed: the client build derives `REACT_APP_NO_CONTACT` from it, and the server reads it directly.

In no-contact mode:

- **The client** has no footer credit (text, logo, LinkedIn and GitHub links) and no "Developer Portfolio" link in the navbar. The logo file is not emitted. The guest login shown beside the auth forms is `guest@example.com`. "Forgot Password?" and the `/reset` pages are gone. No source maps are built, because they contain the original source. All of this is decided at build time, so it is absent from the bundle rather than hidden.
- **The page** has no social preview image, carries `<meta name="robots" content="noindex, nofollow">`, and `robots.txt` has no `Sitemap` or `Host` line.
- **The server sends no e-mail of any kind.** Every message it can send comes from my domain and invites a reply. Signup works without the welcome mail. The mail transport is never constructed and `MAIL_KEY` is not needed.
- **Password reset is refused.** It cannot work without e-mail, so `POST /reset-password` and `POST /new-password` answer `403`.
- **Every response** carries `X-Robots-Tag: noindex, nofollow`.
- **The guest account is created at startup** if it is missing, once the database is connected. The no-contact deployment has its own database, which starts empty, so that account is the only one until visitors sign up. Never point it at the normal deployment's database: the accounts and posts there are not part of the demo.

My name on its own (page title, description, author tag) stays: a name with no link or address is not a way to reach me.

### Where it lives

| File | Role |
| --- | --- |
| `client/src/noContact.js` | **The client flag.** Exports `NO_CONTACT`, `GUEST_EMAIL` and `developerLogo`. The only place the client reads the variable |
| `client/scripts/cra.js` | Runs `react-scripts` with `REACT_APP_NO_CONTACT` set from `NO_CONTACT`, and with source maps off in no-contact mode. `npm start` and `npm run build` in `client/` go through it |
| `client/scripts/no-contact-postbuild.js` | After a no-contact build: removes the preview image tag and any comment from `build/index.html`, adds the robots tag, and cleans `build/robots.txt` |
| `noContact.js` | **The server flag.** Exports `NO_CONTACT`, the `GUEST` account and `seedGuest()`. The only place the server reads the variable |
| `mailer.js` | `sendMail()`, the only way to send e-mail. Sends nothing in no-contact mode |
| `routes/auth.js` | Refuses the reset endpoints and skips the welcome mail in no-contact mode |
| `app.js` | Adds the `X-Robots-Tag` header and seeds the guest account in no-contact mode |
| `scripts/check-no-contact.js`, `scripts/check-no-contact-server.js` | `npm run check:no-contact` |

### Rules for future changes

1. **Gate contact UI on `NO_CONTACT`, in the JSX**: `{NO_CONTACT ? null : <a href="…">…</a>}`. Import the constant from `client/src/noContact.js` and test it directly. A function call, an object property or a CSS class would leave the markup in the bundle.
2. **A file that exists only to credit me is loaded in `client/src/noContact.js`**, the way `developerLogo` is: `require()` behind the literal `process.env.REACT_APP_NO_CONTACT === 'true'` comparison. An `import` at the top of a component is emitted into the build even if nothing uses it.
3. **Anything in `client/public/` ships as it is.** Do not put an address, a profile link or a link to one of my sites there. If `index.html` needs one for the normal site, remove it in `client/scripts/no-contact-postbuild.js`.
4. **Send e-mail only through `sendMail()` in `mailer.js`**, and never construct another transport. A feature that depends on e-mail cannot exist in no-contact mode: refuse its endpoints and remove its UI, as password reset does.
5. **Read the flag only from the two flag modules**, never from `process.env` elsewhere.
6. **Never link to the normal domain of this or any other site of mine** from code that runs in no-contact mode. If a link to another project is ever needed there, it must point at that project's own no-contact deployment.
7. **Copy that invites contact needs a second wording** that reads complete without it: `NO_CONTACT ? '…' : '…'`.
8. **Images are yours to check.** The check reads text, not pixels. An image that shows a link, an address or a social icon must not reach a no-contact build.
9. **Run `npm run check:no-contact` before pushing.** There is no CI in this repo, so this is the check.

### The check

```sh
npm run check:no-contact
```

It builds the client with `NO_CONTACT=true`, exactly as the deployment does, and fails if `client/build` contains an e-mail address other than `guest@example.com`, `mailto:`, `tel:`, Calendly, Telegram, WhatsApp, LinkedIn, X/Twitter, Discord, Flickr, Google Drive or Forms, Heroku, my GitHub or handles, the footer credit, the portfolio link, the reset UI, a source map, the logo file, or the normal domain of any of my sites (a `showcase.` prefix is allowed); or if the page lacks the noindex tag.

It then starts the real server in-process with the database and the mail libraries replaced by stubs, and checks that with `NO_CONTACT=true` no mail transport is constructed and nothing is sent (by signup or by `sendMail()` itself), the reset endpoints refuse, every response carries `X-Robots-Tag`, no response contains anything forbidden, the guest account is created exactly once with the right password hash, and the guest can sign in. A second run without the flag is a control: the same stubs must see the transport and both mails, which proves the first run would have noticed them.

`node scripts/check-no-contact.js --no-build` checks the existing `client/build` without rebuilding.

What it does not cover: a real MongoDB (the `User` model is a stub, so the guest account is not written to an actual collection), how the pages look in a browser, the pixels of images, and anything hosted elsewhere (the Materialize and Google Fonts CDNs, Cloudinary).
