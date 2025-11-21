const express = require('express');
const router = express.Router();
const exampleController = require('../controllers/exampleController');

// GET /api/examples - Get all examples
router.get('/', exampleController.getAllExamples);

// GET /api/examples/:id - Get single example
router.get('/:id', exampleController.getExampleById);

// POST /api/examples - Create new example
router.post('/', exampleController.createExample);

// PUT /api/examples/:id - Update example
router.put('/:id', exampleController.updateExample);

// DELETE /api/examples/:id - Delete example
router.delete('/:id', exampleController.deleteExample);

module.exports = router;

