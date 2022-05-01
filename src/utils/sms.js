import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import logger from '../winston.js'

const snsClient = new SNSClient()

export const send = async (phone, message) => {
  const params = {
    Message: message,
    PhoneNumber: phone
  }

  logger.debug(params)

  const command = new PublishCommand(params)

  const data = await snsClient.send(command)

  logger.debug(data)
}
