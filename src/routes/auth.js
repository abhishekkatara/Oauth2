import express from 'express'
import passport from 'passport'
import '../strategies/index.js'
import controllers from '../controllers/index.js'
import { getShortLink } from '../utils/shorturl.js'
import logger from '../winston.js'

const router = express.Router()

router.get('/login/google', controllers.auth.saveContext, passport.authenticate('google'))
router.get('/google/callback', controllers.auth.getContext, passport.authenticate('google', { failureRedirect: '/error' }), controllers.auth.login, controllers.auth.redirectAuth)

router.get('/login/magic', passport.authenticate('magicLink'), (req, res) => { res.status(204).send() })
router.get('/magic/callback', passport.authenticate('magicLink'), controllers.auth.login, controllers.auth.redirectAuth)

router.get('/token', controllers.auth.refreshToken)
router.post('/token', controllers.auth.refreshToken)

router.post('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.get('/:key', async (req, res) => {
  try {
    logger.debug(req.params)

    const href = await getShortLink(req.params.key)

    logger.debug(href)

    res.redirect(href)
  } catch (err) {
    logger.warn({ error: err, stack: err.stack })
    res.status(404).send()
  }
})

export default router
