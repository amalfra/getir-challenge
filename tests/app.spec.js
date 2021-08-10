import { expect } from 'chai'
import mongoose from 'mongoose'
import request from 'supertest'

import createApp from '../src/app.js'

describe('App', function() {
  let app, server

  before(async function() {
    ;({ app, server } = await createApp())
  })

  after(function() {
    mongoose.connection.close()
    server.close()
  })

  it('should have 404 for not existing routes', async function() {
    const res = await request(app).get('/test-route')

    expect(res.body).to.deep.eq({
      code: 404,
      msg: 'Route not found',
    })
    expect(res.statusCode).to.equal(404)
  })
})
