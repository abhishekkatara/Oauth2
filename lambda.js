import awsServerlessExpress from 'aws-serverless-express'

import app from './src/app.js'

const server = awsServerlessExpress.createServer(app, null)

export const handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
