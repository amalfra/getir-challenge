import Joi from 'joi'

// define validations for ENV
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test')
    .default('development'),
  HOST: Joi.string().default('http://localhost'),
  PORT: Joi.number().default(8080),
  MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  MONGO_HOST: Joi.string().required(),
  MONGO_PORT: Joi.number().default(27017),
})
  .unknown()
  .required()

const { error, value } = envSchema.validate(process.env)
if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

export default {
  env: value.NODE_ENV,
  host: value.HOST,
  port: value.PORT,
  mongooseDebug: value.MONGOOSE_DEBUG,
  mongo: {
    host: value.MONGO_HOST,
    port: value.MONGO_PORT,
  },
}
