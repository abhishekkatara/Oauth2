import jwt from 'jsonwebtoken'
import qs from 'qs'
import logger from '../winston.js'

const { JWT_SECRET, ISSUER, AUDIENCE } = process.env

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

  const query = qs.stringify({
    access_token: accessToken,
    id_token: idToken
  })

  res.redirect(`/auth/callback?${query}`)
}

export default {
  generateToken
}
