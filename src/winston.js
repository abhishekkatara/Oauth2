import winston from 'winston'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const { name: service } = require('../package.json')

const localFormat = winston.format.combine(winston.format.colorize(), winston.format.printf(({ level, message }) => {
  return `[${level}]\n${JSON.stringify(message, null, 2)}\n`
}))

const opts = {
  console: {
    defaultMeta: { service },
    exitOnError: false,
    format: process.env.ENV === 'local' ? localFormat : winston.format.combine(winston.format.timestamp(), winston.format.json()),
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
