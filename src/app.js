import bodyParser from 'body-parser'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import logger from './winston.js'
import routes from './routes/index.js'

const app = express()

app.use(bodyParser.json())
app.use(helmet())
app.use(morgan('combined', { stream: logger.stream }))

app.use(routes)

export default app
