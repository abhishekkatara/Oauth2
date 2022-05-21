import express from 'express'

import auth from './auth.js'

const router = express.Router()

router.use('/auth', auth)
router.use('/check', (req, res) => {
    res.json('Working like charm')
  })

export default router
