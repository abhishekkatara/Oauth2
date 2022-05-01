import jwt from 'jsonwebtoken'
import logger from '../winston.js'

const decodeToken = (secret, token) => {
  if (typeof token !== 'string') {
    return false
  }
  try {
    return jwt.verify(token, secret)
  } catch (err) {
    return false
  }
}

const generateToken = (secret, payload) => jwt.sign(payload, secret, { expiresIn: '60min' })

export class Strategy {
  constructor (options = {}) {
    this.name = 'magicLink'
    this.options = options
  }
}

Strategy.prototype.send = async function (req) {
  const payload = req.method === 'GET' ? req.query : req.body

  if (!payload.destination) {
    return this.error('Missing destination.')
  }
  if (!payload.redirect_uri) {
    return this.error('Missing redirectURI.')
  }

  payload.redirectURI = payload.redirect_uri
  delete payload.redirect_uri

  const code = Math.floor(Math.random() * 90000) + 10000 + ''
  const token = generateToken(this.options.secret, {
    ...payload,
    code
  })

  const send = payload.source === 'email' ? this.options.sendEmail : this.options.sendPhone

  return send(payload.destination, `${this.options.callbackURL}?token=${token}`, code, req)
    .then(this.pass)
    .catch((error) => {
      logger.error({ error: error, stack: error.stack })
      this.error(error)
    })
}

Strategy.prototype.confirm = async function (req) {
  const payload = req.method === 'GET' ? req.query : req.body

  if (!payload.token) {
    return this.error('Missing token.')
  }

  const token = decodeToken(this.options.secret, payload.token)
  token.id = token.destination

  const cb = (err, user, info) => {
    if (err) {
      return this.error(err)
    } else if (!user) {
      return this.fail(info)
    } else {
      logger.debug({ func: 'MagicLink.confirm', ...user })
      req.context = { ...req.context, ...user }
      return this.success(user, info)
    }
  }

  this.options.verify(token, cb, req)
}

Strategy.prototype.authenticate = async function (req, opts) {
  const payload = req.method === 'GET' ? req.query : req.body

  if (payload.destination && payload.source && payload.redirect_uri) {
    logger.debug(payload)
    return this.send(req)
  } else if (payload.token) {
    logger.debug(payload)
    return this.confirm(req)
  } else {
    logger.error(payload)
    return this.error('Missing required parameters.')
  }
}

export default Strategy
