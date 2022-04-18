import express from 'express'
import passport from 'passport'
import controllers from '../controllers/index.js'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env

passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, user)
    // cb(null, { id: user.id, email: user.email, name: user.name })
  })
})

passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user)
  })
})

const stategyOptions = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/oauth/google/callback',
  userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
  scope: ['profile', 'email'],
  state: false
}

const strategyUserIdentification = (accessToken, refreshToken, profile, cb) => {
  console.info(accessToken, refreshToken, profile)
  cb(null, profile)
}

passport.use(new GoogleStrategy(stategyOptions, strategyUserIdentification))

const router = express.Router()

router.get('/login/federated/google', controllers.auth.saveRedirectURI, passport.authenticate('google'))
router.get('/oauth/google/callback', controllers.auth.getRedirectURI, passport.authenticate('google', { failureRedirect: '/login' }), controllers.auth.generateToken)

router.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

export default router
