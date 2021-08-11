import { MongoMemoryServer } from 'mongodb-memory-server'

export default async() => {
  const mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  return {
    mongo: {
      instance: mongod,
      uri,
    },
  }
}
