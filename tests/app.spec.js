import { expect } from 'chai'
import mockedEnv from 'mocked-env'
import mongoose from 'mongoose'
import request from 'supertest'

import createApp from '../src/app.js'

describe('App', function() {
  let app, server

  describe('Setup', function() {
    // to restore old env values
    let restore;
    let consoleErrorOutput = '';
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
})
