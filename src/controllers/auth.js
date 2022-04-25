import { URL } from 'url'
import cuid from 'cuid'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import logger from '../winston.js'

import Credential from '../models/credential.js'

const { JWT_SECRET, ISSUER, AUDIENCE, ENV, COOKIE_DURATION = '3600', JWT_DURATION = '3600', REFRESH_DURATION = '2592000' } = process.env

export const saveContext = async (req, res, next) => {
  const {
    redirect_uri: redirectURI,
    source,
    type
  } = req.query

  res.cookie('context', JSON.stringify({ source, type, redirectURI }), {
    maxAge: parseInt(COOKIE_DURATION) * 1000,
    httpOnly: true,
    secure: ENV !== 'local',
    sameSite: 'Lax'
  })

  next()
}

export const getContext = async (req, res, next) => {
  logger.debug({ cookies: req.cookies })
  const { context } = req.cookies
  req.context = JSON.parse(context)
  next()
}

export const login = async (req, res, next) => {
  req.login(req.user, async (err) => {
    if (err) throw err
    next()
  })
}

export const generateTokens = async (req, res) => {
  logger.debug(req.context)

  const jti = cuid()
  const id = uuidv4()

  try {
    const creds = await Credential.query()
      .insert({
        id,
        source_id: req.user.id,
        source: req.context.source,
        type: req.context.type,
        jti
      })
      .onConflict(['source_id', 'source', 'type'])
      .merge(['jti'])

    logger.debug(creds)

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
      subject: creds.id,
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithm: 'HS256',
      expiresIn: parseInt(JWT_DURATION) * 1000
    }

    const refreshTokenOpts = {
      ...tokenOpts,
      jwtid: jti,
      expiresIn: parseInt(REFRESH_DURATION) * 1000
    }

    logger.debug({ user, tokenOpts })

    const accessToken = jwt.sign({}, JWT_SECRET, tokenOpts)
    const idToken = jwt.sign(user, JWT_SECRET, tokenOpts)
    const refreshToken = jwt.sign({}, JWT_SECRET, refreshTokenOpts)

    logger.debug({ accessToken, idToken, refreshToken })

    const redirectURL = new URL(req.context.redirectURI)

    redirectURL.searchParams.set('access_token', accessToken)
    redirectURL.searchParams.set('id_token', idToken)
    redirectURL.searchParams.set('refresh_token', refreshToken)

    logger.debug({ redirectURI: req.context.redirectURI })
    res.redirect(redirectURL)
  } catch (err) {
    logger.error({ error: err, stack: err.stack })
    res.status(500).send({ error: err.message })
  }
}

export default {
  generateTokens,
  saveContext,
  getContext,
  login
}
