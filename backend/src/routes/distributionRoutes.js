const express = require('express');
const router = express.Router();
const distributionController = require('../controllers/distributionController');
const auth = require('../middleware/auth');

router.post('/', auth, distributionController.create);
router.get('/', auth, distributionController.findAll);
router.get('/stats', auth, distributionController.getStats);
router.get('/:id', auth, distributionController.findOne);
router.put('/:id', auth, distributionController.update);
router.delete('/:id', auth, distributionController.delete);

module.exports = router;