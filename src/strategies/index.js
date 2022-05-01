import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as MagicLinkStrategy } from './MagicLink.js'
import { send as sendEmail } from '../utils/email.js'
import { send as sendSMS } from '../utils/sms.js'
import { createShortLink } from '../utils/shorturl.js'
import logger from '../winston.js'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MAGIC_LINK_SECRET, BASE_URL } = process.env

const strategyUserIdentification = (accessToken, refreshToken, profile, cb) => {
  logger.info(accessToken, refreshToken, profile)
  cb(null, profile)
}

const googleOptions = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/google/callback`,
  scope: ['profile', 'email'],
  state: false
}

export const googleStrategy = new GoogleStrategy(googleOptions, strategyUserIdentification)

const magicVerify = async (payload, cb) => {
  cb(null, payload)
}

const sendMagicLinkEmail = async (email, href) => {
  const link = await createShortLink(href)
  const subject = 'TLYNT - Login'

  const html = `
    <p>
      <a href="${link}">Login</a>
      <p>Or copy / paste this link into a browser: ${link}</p>
    </p>
  `
  const text = `
    Copy / paste this link into a browser: ${link}
  `
  try {
    await sendEmail(email, subject, html, text)
  } catch (err) {
    logger.error({ error: err, stack: err.stack })
  }
}

const sendMagicLinkSMS = async (phone, href) => {
  const link = await createShortLink(href)
  const message = `Open this link to login: ${link}`

  try {
    await sendSMS(phone, message)
  } catch (err) {
    logger.error({ error: err, stack: err.stack })
  }
}

const magicLinkOptions = {
  secret: MAGIC_LINK_SECRET,
  callbackURL: `${BASE_URL}/magic/callback`,
  sendEmail: sendMagicLinkEmail,
  sendPhone: sendMagicLinkSMS,
  verify: magicVerify
}

export const magicLinkStrategy = new MagicLinkStrategy(magicLinkOptions)

passport.use(googleStrategy)
passport.use(magicLinkStrategy)
