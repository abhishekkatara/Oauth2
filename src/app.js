import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'
import sessions from 'express-session'

import logger from './winston.js'
import routes from './routes/index.js'

const { ENV, SESSION_SECRET } = process.env

const sessionConfig = {
  secret: SESSION_SECRET,
  cookieName: 'session',
  resave: false,
  saveUninitialized: false,
  cookie: {
    ephemeral: true,
    httpOnly: true,
    secure: ENV !== 'local'
  }
}

const app = express()

app.use(cookieParser())
app.use(sessions(sessionConfig))
app.use(bodyParser.json())
app.use(helmet())
app.use(morgan('combined', { stream: logger.stream }))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user = {}, cb) => cb(null, user))
passport.deserializeUser((user = {}, cb) => cb(null, user))

app.use(routes)

export default app
