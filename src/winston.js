import winston from 'winston'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const { name: service } = require('../package.json')

const localFormat = winston.format.combine(winston.format.colorize(), winston.format.simple())

const opts = {
  console: {
    defaultMeta: { service },
    exitOnError: false,
    format: process.env.ENV === 'local' ? localFormat : winston.format.simple(),
    handleExceptions: true,
    level: process.env.LOG_LEVEL || 'info'
  }
}

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(opts.console)
  ],
  exitOnError: false
})

logger.stream = {
  write: (message, encoding) => {
    logger.info(message)
  }
}

export default logger
