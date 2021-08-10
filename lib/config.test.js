import { expect } from 'chai'
import mockedEnv from 'mocked-env'

import loadconfig from './config.js'

const defaultValues = {
  env: 'development',
  protocol: 'http://',
  host: 'localhost',
  port: 8080,
  mongooseDebug: true,
}

describe('lib/config.js', function() {
  // to restore old values
  let restore

  afterEach(function() {
    if (restore) {
      restore()
    }
  })

  it('should return error for no envs', function() {
    expect(() => loadconfig()).to.throw(Error)
  })

  it('should return error when only unrelated envs set', function() {
    restore = mockedEnv({
      MY_CUSTOM_ENV: 'hello',
    })
    expect(() => loadconfig()).to.throw(Error)
  })

  it('should not return error when required envs set', function() {
    restore = mockedEnv({
      MONGO_URL: 'mongodb://localhost:27017/myapp',
    })
    expect(() => loadconfig()).to.not.throw(Error)
  })

  it('should return default correctly', function() {
    const MONGO_URL = 'mongodb://localhost:27017/myapp'
    restore = mockedEnv({
      MONGO_URL,
    })

    expect(loadconfig()).to.deep.equal({
      ...defaultValues,
      mongoUrl: MONGO_URL,
    })
  })

  it('should set MONGOOSE_DEBUG depending on NODE_ENV', function() {
    const MONGO_URL = 'mongodb://localhost:27017/myapp'
    restore = mockedEnv({
      MONGO_URL,
    })
    expect(loadconfig()).to.have.property('mongooseDebug', true)

    restore()
    let NODE_ENV = 'test'
    restore = mockedEnv({
      MONGO_URL,
      NODE_ENV,
    })
    expect(loadconfig()).to.have.property('mongooseDebug', false)

    restore()
    NODE_ENV = 'production'
    restore = mockedEnv({
      MONGO_URL,
      NODE_ENV,
    })
    expect(loadconfig()).to.have.property('mongooseDebug', false)
  })

  it('should return correctly when some envs set', function() {
    const MONGO_URL = 'mongodb://localhost:27017/myapp'
    const PROTOCOL = 'https://'
    const HOST = 'localhost'
    restore = mockedEnv({
      MONGO_URL,
      PROTOCOL,
      HOST,
    })

    expect(loadconfig()).to.deep.equal({
      ...defaultValues,
      protocol: PROTOCOL,
      host: HOST,
      mongoUrl: MONGO_URL,
    })
  })

  it('should return correctly when all envs set', function() {
    const MONGO_URL = 'mongodb://localhost:27017/myapp'
    const NODE_ENV = 'test'
    const PROTOCOL = 'https://'
    const HOST = 'www.test.com'
    const PORT = '9000'
    const MONGOOSE_DEBUG = 'true'
    restore = mockedEnv({
      NODE_ENV,
      PROTOCOL,
      HOST,
      PORT,
      MONGOOSE_DEBUG,
      MONGO_URL,
    })

    expect(loadconfig()).to.deep.equal({
      env: NODE_ENV,
      protocol: PROTOCOL,
      host: HOST,
      port: Number(PORT),
      mongooseDebug: Boolean(MONGOOSE_DEBUG),
      mongoUrl: MONGO_URL,
    })
  })
})
