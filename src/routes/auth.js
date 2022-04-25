import express from 'express'
import passport from 'passport'
import controllers from '../controllers/index.js'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, BASE_URL } = process.env

const stategyOptions = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${BASE_URL}/google/callback`,
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

router.get('/login/google', controllers.auth.saveContext, passport.authenticate('google'))
router.get('/google/callback', controllers.auth.getContext, passport.authenticate('google', { failureRedirect: '/error' }), controllers.auth.login, controllers.auth.generateTokens)

router.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

export default router
