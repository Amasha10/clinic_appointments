const express = require('express');
const authenticate = require('../middleware/auth');
const upload = require('../middleware/upload');
const controller = require('../controllers/doctorController');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.list);
router.get('/:id', controller.getOne);
router.post('/', upload.single('image'), controller.create);
router.put('/:id', upload.single('image'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;