import { expect } from 'chai'
import mockedEnv from 'mocked-env'
import mongoose from 'mongoose'
import request from 'supertest'

import createApp from '../src/app.js'
import RecordModel from '../src/models/record.js'
import doSetup from './setup.js'

describe('Records route', function() {
  let app, server, db

  before(async function() {
    const { mongo } = await doSetup()
    mockedEnv({
      MONGO_URL: mongo.uri,
    })
    db = mongo.instance
    ;({ app, server } = await createApp())
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

  afterEach(async function() {
    await RecordModel.deleteMany({})
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

  it('should return correct results when there are matches', async function() {
    const records = [
      {
        key: 'TAKwGc6Jr4i8Z487',
        createdAt: '2017-01-28T01:22:14.398Z',
        counts: [150, 160],
        value: 'Getir Task',
      },
      {
        key: 'TAKwGc6Jr4i8Z487',
        createdAt: '2017-01-28T01:22:14.398Z',
        counts: [170],
        value: 'Getir Task',
      },
      {
        key: 'TAKwGdfgdgJr4i8Z487',
        createdAt: '2021-01-28T01:22:14.398Z',
        counts: [200, 300, 500],
        value: 'Getir Task',
      },
    ]
    await RecordModel.insertMany(records)
    const expectedRecords = [
      {
        createdAt: '2017-01-28T01:22:14.398Z',
        key: 'TAKwGc6Jr4i8Z487',
        totalCount: 310,
      },
      {
        createdAt: '2017-01-28T01:22:14.398Z',
        key: 'TAKwGc6Jr4i8Z487',
        totalCount: 170,
      },
    ]

    const payload = {
      startDate: '2016-01-26',
      endDate: '2019-02-02',
      minCount: 100,
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(0)
    expect(res.body.msg).to.eq('Success')
    expect(res.body.records).to.deep.equal(expectedRecords)
    expect(res.statusCode).to.equal(200)
  })

  it('should return correct results when there are no matches', async function() {
    const records = [
      {
        key: 'TAKwGc6Jr4i8Z487',
        createdAt: '2017-01-28T01:22:14.398Z',
        counts: [150, 160],
        value: 'Getir Task',
      },
      {
        key: 'TAKwGc6Jr4i8Z487',
        createdAt: '2017-01-28T01:22:14.398Z',
        counts: [170],
        value: 'Getir Task',
      },
      {
        key: 'TAKwGdfgdgJr4i8Z487',
        createdAt: '2021-01-28T01:22:14.398Z',
        counts: [200, 300, 500],
        value: 'Getir Task',
      },
    ]
    await RecordModel.insertMany(records)
    const expectedRecords = []

    const payload = {
      startDate: '2026-01-26',
      endDate: '2039-02-02',
      minCount: 100,
      maxCount: 2300,
    }
    const res = await request(app)
      .post('/v1/records')
      .set({ 'Content-Type': 'application/json' })
      .send(payload)

    expect(res.body.code).to.eq(0)
    expect(res.body.msg).to.eq('Success')
    expect(res.body.records).to.deep.equal(expectedRecords)
    expect(res.statusCode).to.equal(200)
  })
})
