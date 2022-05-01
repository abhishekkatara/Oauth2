import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { nanoid } from 'nanoid/async'
import logger from '../winston.js'

const { SHORTURL_BUCKET, BASE_URL } = process.env

const s3 = new S3Client()

export const createShortLink = async href => {
  const params = {
    Bucket: SHORTURL_BUCKET,
    Key: await nanoid(),
    ContentType: 'text/plain',
    Body: href
  }

  logger.debug(params)

  const command = new PutObjectCommand(params)

  const data = await s3.send(command)

  logger.debug(data)

  return `${BASE_URL}/${params.Key}`
}

const getObjectBody = async (command) => {
  const res = await s3.send(command)

  return new Promise((resolve, reject) => {
    const chunks = []

    try {
      res.Body.once('error', err => reject(err))
      res.Body.on('data', chunk => chunks.push(chunk))
      res.Body.once('end', () => resolve(chunks.join('')))
    } catch (err) {
      return reject(err)
    }
  })
}

export const getShortLink = async key => {
  const params = {
    Bucket: SHORTURL_BUCKET,
    Key: key
  }

  logger.debug(params)

  const command = new GetObjectCommand(params)

  const data = await getObjectBody(command)

  logger.debug(data)

  return data
}
