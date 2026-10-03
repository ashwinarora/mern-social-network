/**
 * No-contact mode: the one place the server learns about it.
 *
 * `NO_CONTACT=true` in the environment runs a deployment that gives a visitor no way to
 * reach the developer: the server sends no e-mail at all (every message comes from his
 * domain), password reset is refused because it cannot work without e-mail, every
 * response is marked noindex, and the demo login is seeded into what starts as an empty
 * database. Unset, or any other value, is the normal app. See README "No-contact mode".
 *
 * Require this after `dotenv` has loaded, and take the flag from here, never from
 * `process.env` directly.
 */
const NO_CONTACT = process.env.NO_CONTACT === 'true'

/** The demo login shown next to the auth forms of a no-contact build (client/src/noContact.js). */
const GUEST = {
    name: 'Guest User',
    email: 'guest@example.com',
    password: 'guest@123'
}

/**
 * Creates the guest account if it does not exist. Safe to call on every start and every
 * reconnect. The password is hashed the way the signup route hashes it, and `pic` is left
 * to the schema default, as it is for a signup without a picture.
 */
async function seedGuest() {
    const User = require('mongoose').model('User')
    const existing = await User.findOne({ email: GUEST.email })
    if (existing) return existing
    const password = await require('bcryptjs').hash(GUEST.password, 12)
    const guest = await new User({ name: GUEST.name, email: GUEST.email, password }).save()
    console.log(`Guest account created: ${GUEST.email}`)
    return guest
}

module.exports = { NO_CONTACT, GUEST, seedGuest }
