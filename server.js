import 'dotenv/config'

import logger from './src/winston.js'
import app from './src/app.js'

const { PORT = 3000 } = process.env

app.listen(PORT, () => {
  logger.info(`Listening on port ${PORT}`)
})
