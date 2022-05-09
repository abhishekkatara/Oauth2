import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'

import logger from './winston.js'
import routes from './routes/index.js'

const app = express()

app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(helmet())
app.use(morgan('combined', { stream: logger.stream }))

app.use(passport.initialize())

passport.serializeUser((user = {}, cb) => cb(null, user))
passport.deserializeUser((user = {}, cb) => cb(null, user))

app.use(routes)

export default app
