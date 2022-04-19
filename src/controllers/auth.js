import { URL } from 'url'
import jwt from 'jsonwebtoken'
import logger from '../winston.js'

const { JWT_SECRET, ISSUER, AUDIENCE, ENV, BASE_URL, COOKIE_DURATION = '3600' } = process.env

export const saveRedirectURI = async (req, res, next) => {
  const { redirect_uri: redirectURI } = req.query
  if (redirectURI) {
    res.cookie('redirectURI', redirectURI, {
      maxAge: parseInt(COOKIE_DURATION) * 1000,
      httpOnly: true,
      secure: ENV !== 'local',
      sameSite: 'Lax'
    })
  }
  next()
}

export const getRedirectURI = async (req, res, next) => {
  logger.debug({ cookies: req.cookies, secureCookies: req.secureCookies })
  const { redirectURI = BASE_URL } = req.cookies
  req.redirectURI = redirectURI
  next()
}

export const generateToken = async (req, res) => {
  const user = {
    name: {
      first: req.user.name.givenName,
      last: req.user.name.familyName
    },
    email: {
      value: req.user.emails[0]?.value,
      verified: req.user.emails[0]?.verified
    },
    picture: req.user.photos[0]?.value
  }

  const tokenOpts = {
    subject: req.user.id,
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: 'HS256',
    expiresIn: '1h'
  }

  logger.debug({ user, tokenOpts })

  const accessToken = jwt.sign({}, JWT_SECRET, tokenOpts)
  const idToken = jwt.sign(user, JWT_SECRET, tokenOpts)

  logger.debug({ accessToken, idToken })

  const redirectURL = new URL(req.redirectURI)

  redirectURL.searchParams.set('access_token', accessToken)
  redirectURL.searchParams.set('id_token', idToken)

  logger.debug({ redirectURI: req.redirectURI })

  res.redirect(redirectURL)
}

export default {
  generateToken,
  saveRedirectURI,
  getRedirectURI
}
