import v1Router from './v1.js'

export default (app) => {
  app.use('/v1', v1Router)

  // catch 404
  app.use((_, res) => {
    return res.status(404).json({
      message: 'Route not found',
    })
  })
}
