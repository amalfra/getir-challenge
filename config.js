import Joi from './lib/joi.js'

// define validations for ENV
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow('development', 'production', 'test')
    .default('development'),
  PROTOCOL: Joi.string().default('http://'),
  HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(8080),
  MONGOOSE_DEBUG: Joi.boolean().when('NODE_ENV', {
    is: Joi.string().equal('development'),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  MONGO_URL: Joi.string().required(),
})
  .unknown()
  .required()

export default () => {
  const { error, value } = envSchema.validate(process.env)
  if (error) {
    throw new Error(`Validation failed: ${error.message}`)
  }

  return {
    env: value.NODE_ENV,
    protocol: value.PROTOCOL,
    host: value.HOST,
    port: value.PORT,
    mongooseDebug: value.MONGOOSE_DEBUG,
    mongoUrl: value.MONGO_URL,
  }
}
