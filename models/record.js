import mongoose from 'mongoose'

const RecordSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: new Date().toISOString(),
  },
  counts: {
    type: [Number],
    required: true,
    default: [],
  },
  value: String,
})

export default mongoose.model('Record', RecordSchema)
