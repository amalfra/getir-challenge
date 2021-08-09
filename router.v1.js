import { Router } from 'express'

import recordsController from './controllers/records.js'

const router = Router()

router.post('/records', recordsController.post)

export default router
