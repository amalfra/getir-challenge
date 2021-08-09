import cors from 'cors'
import express from 'express'

import config from './core/config.js'
import routerV1 from './router.v1.js'

const app = express()

// parse body params and attach them to req.body
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)
app.use(cors())

app.use('/v1', routerV1)

// catch 404
app.use((_, res) => {
  res.status(404).json({
    message: 'Route not found',
  })
})

app.listen(config.port, () => {
  console.info(`Server listening on ${config.host}:${config.port}`)
})
