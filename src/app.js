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

;(async() => {
  let config
  try {
    config = loadconfig()
  } catch (e) {
    console.error(`Config error: ${e.message}`)
    return process.exit(1)
  }

  try {
    await mongoose.connect(config.mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (e) {
    console.error(`Database connection error: ${e.message}`)
    return process.exit(1)
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

  app.listen(config.port, config.host, () => {
    console.info(
      `Server listening on ${config.protocol}${config.host}:${config.port}`,
    )
  })
})()
