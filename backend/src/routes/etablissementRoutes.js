const express = require('express');
const router = express.Router();
const etablissementController = require('../controllers/etablissementController');
const auth = require('../middleware/auth');

router.post('/', auth, etablissementController.create);
router.get('/', auth, etablissementController.findAll);
router.get('/:code', auth, etablissementController.findOne);
router.put('/:code', auth, etablissementController.update);
router.delete('/:code', auth, etablissementController.delete);

module.exports = router;