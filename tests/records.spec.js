import { expect } from 'chai'
import mongoose from 'mongoose'
import request from 'supertest'

import createApp from '../src/app.js'

describe('Records route', function() {
  let app, server

  before(async function() {
    ;({ app, server } = await createApp())
  })

  after(function() {
    mongoose.connection.close()
    server.close()
  })

  it('should have 422 for requests without any params', async function() {
    const payload = {}
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.statusCode).to.equal(422)
  })

  it('should have 422 for requests without startDate', async function() {
    const payload = {
      endDate: '2029-02-02',
      minCount: 100,
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.body.msg).to.eq('"startDate" is required')
    expect(res.statusCode).to.equal(422)
  })

  it('should have 422 for requests without endDate', async function() {
    const payload = {
      startDate: '2016-01-26',
      minCount: 100,
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.body.msg).to.eq('"endDate" is required')
    expect(res.statusCode).to.equal(422)
  })

  it('should have 422 for requests without minCount', async function() {
    const payload = {
      startDate: '2016-01-26',
      endDate: '2029-02-02',
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.body.msg).to.eq('"minCount" is required')
    expect(res.statusCode).to.equal(422)
  })

  it('should have 422 for requests without maxCount', async function() {
    const payload = {
      startDate: '2016-01-26',
      endDate: '2029-02-02',
      minCount: 100,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.body.msg).to.eq('"maxCount" is required')
    expect(res.statusCode).to.equal(422)
  })

  it('should have 422 for requests with startDate > endDate', async function() {
    const payload = {
      startDate: '2029-01-26',
      endDate: '2019-02-02',
      minCount: 100,
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(422)
    expect(res.body.msg).to.eq('"startDate" must be less than "ref:endDate"')
    expect(res.statusCode).to.equal(422)
  })
})
