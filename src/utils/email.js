import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import logger from '../winston.js'

const { SES_FROM } = process.env

const client = new SESv2Client()

export const send = async (email, subject, html, text) => {
  const params = {
    Content: {
      Simple: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: html
          },
          Text: {
            Charset: 'UTF-8',
            Data: text
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      }
    },
    Destination: {
      BccAddresses: [],
      CcAddresses: [],
      ToAddresses: [email]
    },
    FromEmailAddress: `GMAIL <${SES_FROM}>`
  }

  logger.debug(params)

  const command = new SendEmailCommand(params)

  const data = await client.send(command)

  logger.debug(data)
}
