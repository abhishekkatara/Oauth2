import express from 'express'

import auth from './auth.js'

const router = express.Router()

router.use('/', auth)

export default router
