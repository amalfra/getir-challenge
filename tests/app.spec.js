import { expect } from 'chai'
import mockedEnv from 'mocked-env'
import mongoose from 'mongoose'
import request from 'supertest'

import createApp from '../src/app.js'
import doSetup from './setup.js'

describe('App', function() {
  let app, server, db

  before(async function() {
    const { mongo } = await doSetup()
    mockedEnv({
      MONGO_URL: mongo.uri,
    })
    db = mongo.instance
  })

  after(async function() {
    mongoose.connection.close()
    if (server) {
      server.close()
    }
    if (db) {
      await db.stop()
    }
  })

  describe('Setup', function() {
    // to restore old env values
    let restore
    let consoleErrorOutput = ''
    let originalConsoleError

    before(function() {
      originalConsoleError = console.error
      console.error = (msg) => {
        consoleErrorOutput += msg + '\n'
      }
    })

    afterEach(function() {
      if (restore) {
        restore()
      }
      consoleErrorOutput = ''
    })
    after(function() {
      console.error = originalConsoleError
    })

    it('should error for missing MONGO_URL', async function() {
      restore = mockedEnv({
        MONGO_URL: '',
      })
      await createApp()
      expect(consoleErrorOutput).to.contain('Config error')
    })

    it('should error for database connection error', async function() {
      restore = mockedEnv({
        MONGO_URL: 'blah',
      })
      await createApp()
      expect(consoleErrorOutput).to.contain('Database connection error')
    })
  })

  describe('Routing', function() {
    before(async function() {
      ;({ app, server } = await createApp())
    })

    it('should have 400 for requests with invalid Content-Type header', async function() {
      const payload = 'hello'
      const res = await request(app)
        .post('/test-route')
        .set({ 'Content-Type': 'application/json; charset=utf' })
        .send(payload)

      expect(res.body.code).to.eq(400)
      expect(res.statusCode).to.equal(400)
    })

    it('should have 400 for requests with invalid JSON', async function() {
      const payload = '{"invalid"}'
      const res = await request(app)
        .post('/test-route')
        .set({ 'Content-Type': 'application/json; charset=utf-8' })
        .send(payload)

      expect(res.body.code).to.eq(400)
      expect(res.statusCode).to.equal(400)
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
})
