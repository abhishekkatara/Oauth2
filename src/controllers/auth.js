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
  logger.debug({ func: 'auth.login', ...req.user })

  req.login(req.user, async (err) => {
    if (err) throw err
    next()
  })
}

export const refreshToken = async (req, res) => {
  const { refresh_token: refreshToken } = req.query

  const token = jwt.verify(refreshToken, JWT_SECRET)
  logger.debug(token)

  const creds = await Credential.query()
    .select('id', 'source_id', 'source', 'type', 'jti')
    .where({ id: token.sub, jti: token.jti })
    .limit(1)

  logger.debug(creds)

  if (creds.length === 0) {
    res.status(401).json({
      message: 'Invalid refresh token'
    })
    return
  }

  const { accessToken, refreshToken: newRefreshToken } = await generateTokens(creds[0])

  res.json({
    accessToken,
    refreshToken: newRefreshToken
  })
}

const generateTokens = async ({ sourceId, source, type }) => {
  const ids = {
    jti: cuid(),
    user: uuidv4()
  }

  const creds = await Credential.query()
    .select('*')
    .where({ source_id: sourceId, source, type })
    .limit(1)

  logger.debug(creds)

  if (creds.length) {
    const updatedCreds = await Credential.query()
      .update({
        jti: ids.jti
      })
      .where({ source_id: sourceId, source, type })

    ids.user = creds[0].id

    logger.debug(updatedCreds)
  } else {
    const newCreds = await Credential.query()
      .insert({
        id: ids.user,
        sourceId,
        source,
        type,
        jti: ids.jti
      })

    logger.debug(newCreds)
  }

  logger.debug(ids)

  const tokenOpts = {
    subject: ids.user,
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: 'HS256',
    expiresIn: parseInt(JWT_DURATION) * 1000
  }

  const refreshTokenOpts = {
    ...tokenOpts,
    jwtid: ids.jti,
    expiresIn: parseInt(REFRESH_DURATION) * 1000
  }

  const accessToken = jwt.sign({}, JWT_SECRET, tokenOpts)
  const refreshToken = jwt.sign({}, JWT_SECRET, refreshTokenOpts)

  logger.debug({ accessToken, refreshToken })

  return { subject: ids.user, accessToken, refreshToken }
}

const userFromGoogle = user => {
  return {
    name: {
      first: user.name?.givenName,
      last: user.name?.familyName
    },
    email: {
      value: user.emails[0]?.value,
      verified: user.emails[0]?.verified
    },
    picture: user.photos[0]?.value
  }
}

const userFromEmail = user => {
  return {
    email: {
      value: user.destination,
      verified: true
    }
  }
}

const userFromPhone = user => {
  return {
    phone: {
      value: user.destination,
      verified: true
    }
  }
}

const getUserBySource = (source, user) => {
  switch (source) {
    case 'google':
      return userFromGoogle(user)
    case 'email':
      return userFromEmail(user)
    case 'phone':
      return userFromPhone(user)
    default:
      return {}
  }
}

export const redirectAuth = async (req, res) => {
  logger.debug({ func: 'auth.redirectAuth', ...req.context })

  try {
    const { subject, accessToken, refreshToken } = await generateTokens({ sourceId: req.user.id, source: req.context.source, type: req.context.type })

    const user = getUserBySource(req.context.source, req.user)

    logger.debug({ user })

    const tokenOpts = {
      subject,
      issuer: ISSUER,
      audience: AUDIENCE,
      algorithm: 'HS256',
      expiresIn: parseInt(JWT_DURATION) * 1000
    }

    const idToken = jwt.sign(user, JWT_SECRET, tokenOpts)

    logger.debug({ idToken })

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
  redirectAuth,
  refreshToken,
  saveContext,
  getContext,
  login
}
