const express = require('express');
const router = express.Router();
const kitController = require('../controllers/kitController');
const auth = require('../middleware/auth');

router.post('/', auth, kitController.create);
router.get('/', auth, kitController.findAll);
router.get('/:id', auth, kitController.findOne);
router.put('/:id', auth, kitController.update);
router.delete('/:id', auth, kitController.delete);

module.exports = router;