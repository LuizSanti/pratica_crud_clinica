const express = require('express')
const router = express.Router()
const controller = require('../controllers/pacienteController')
const authMiddleware = require('../middlewares/authMiddleware')
const adminMiddleware = require('../middlewares/adminMiddleware')

router.get('/', authMiddleware, controller.list)
router.get('/:id', authMiddleware, controller.findById)
router.post('/', authMiddleware, adminMiddleware, controller.create)
router.put('/:id', authMiddleware, adminMiddleware, controller.update)
router.delete('/:id', authMiddleware, adminMiddleware, controller.remove)

module.exports = router
