/**
 * The only place the server sends e-mail from. Every message goes through `sendMail`.
 *
 * In no-contact mode nothing is sent: the transport is never constructed, the mail
 * libraries are not even loaded and MAIL_KEY is not read. In normal mode the SendGrid
 * transport is built once at startup, as it always was.
 */
const { NO_CONTACT } = require('./noContact')

const transport = NO_CONTACT ? null : require('nodemailer').createTransport(require('nodemailer-sendgrid-transport')({
    auth: {
        api_key: process.env.MAIL_KEY
    }
}))

/** Sends one message. In no-contact mode it sends nothing and resolves with null. */
function sendMail(message) {
    if (NO_CONTACT) return Promise.resolve(null)
    return transport.sendMail(message)
}

module.exports = { sendMail }
