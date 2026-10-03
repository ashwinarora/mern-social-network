/**
 * No-contact mode: the one place the client learns about it.
 *
 * `NO_CONTACT=true` in the build environment produces a deployment with no way to reach
 * the developer: no footer credit, no portfolio link, no password reset (it works by
 * e-mail) and a guest login that is not on his domain. Unset, or any other value, is the
 * normal app. `scripts/cra.js` maps `NO_CONTACT` to `REACT_APP_NO_CONTACT`, which webpack
 * replaces with a literal, so everything gated on `NO_CONTACT` is removed from the
 * production bundle rather than hidden.
 *
 * Gate contact UI on `NO_CONTACT` directly (`NO_CONTACT ? null : <a>…</a>`), never
 * through a function or an object property: only the bare constant is folded away.
 * See README "No-contact mode".
 */
export const NO_CONTACT = process.env.REACT_APP_NO_CONTACT === 'true'

/** The demo login shown next to the auth forms. The server seeds it in no-contact mode. */
export const GUEST_EMAIL = NO_CONTACT ? 'guest@example.com' : 'guest@ashwinarora.com'

/**
 * Images that exist only to credit the developer. They are loaded here, behind the
 * literal comparison, because that is what lets webpack leave the file out of a
 * no-contact build altogether; an `import` gated on `NO_CONTACT` would still emit it.
 */
export const developerLogo =
    process.env.REACT_APP_NO_CONTACT === 'true' ? null : require('./assets/myLogo.png')
