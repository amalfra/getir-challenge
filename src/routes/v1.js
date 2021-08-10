import { Router } from 'express'

import recordsController from '../controllers/records/post.v1.js'

const router = Router()

router.post('/records', recordsController)

export default router
