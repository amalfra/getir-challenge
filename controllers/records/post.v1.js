import Joi from '../../lib/joi.js'
import RecordModel from '../../models/record.js'

const postSchema = Joi.object().keys({
  startDate: Joi.date()
    .format('YYYY-MM-DD')
    .less(Joi.ref('endDate'))
    .required(),
  endDate: Joi.date().format('YYYY-MM-DD').required(),
  minCount: Joi.number().less(Joi.ref('maxCount')).required(),
  maxCount: Joi.number().required(),
})

const fetchRecords = ({ startDate, endDate, minCount, maxCount }) =>
  RecordModel.aggregate([
    {
      $project: {
        _id: false,
        key: true,
        createdAt: true,
        totalCount: { $sum: '$counts' },
      },
    },
    {
      $match: {
        $and: [
          {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
          {
            totalCount: {
              $gte: minCount,
              $lte: maxCount,
            },
          },
        ],
      },
    },
  ])

export default async(req, res) => {
  const { error, value } = postSchema.validate(req.body)
  if (error) {
    return res.status(422).json({
      code: 422,
      msg: error.message,
    })
  }

  const records = await fetchRecords(value)

  return res.json({
    code: 0,
    msg: 'Success',
    records,
  })
}
