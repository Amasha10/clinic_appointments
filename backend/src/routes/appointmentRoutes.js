const express = require('express');
const authenticate = require('../middleware/auth');
const controller = require('../controllers/appointmentController');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.listMine);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id/status', controller.cancel);
router.delete('/:id', controller.remove);

module.exports = router;