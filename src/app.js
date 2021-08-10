import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'

import loadconfig from './lib/config.js'
import createRouter from './routes/index.js'

const handleBodyParseError = (err, _, res, next) => {
  if (err) {
    return res.status(400).send({
      code: 400,
      msg: err.message,
    })
  }
  next()
}

// promisify listen to work with async/await
const listen = (app, port, host) =>
  new Promise((resolve, reject) => {
    const listener = app.listen(port, host)
    listener.once('listening', () => resolve(listener)).once('error', reject)
  })

const createApp = async() => {
  let config
  try {
    config = loadconfig()
  } catch (e) {
    return console.error('Config error:', e.message)
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (e) {
    return console.error('Database connection error:', e.message)
  }
  mongoose.set('debug', config.mongooseDebug)

  const app = express()

  // parse body params and attach them to req.body
  app.use(express.json())
  // JSON response for body parsing errors
  app.use(handleBodyParseError)
  app.use(
    express.urlencoded({
      extended: true,
    }),
  )
  app.use(cors())

  createRouter(app)

  let server
  try {
    server = await listen(app, config.port, config.host)
    console.info(
      'Server listening on',
      `${config.protocol}${config.host}:${config.port}`,
    )
  } catch (e) {
    return console.error('Error starting the server', e.message)
  }

  return { app, server }
}

// don't start app automatically in test mode
if (process.env.NODE_ENV !== 'test') {
  ;(async() => {
    await createApp()
  })()
}

export default createApp
