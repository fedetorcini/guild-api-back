const Example = require('../models/Example');

// Get all examples
exports.getAllExamples = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = status ? { status } : {};

    const examples = await Example.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Example.countDocuments(query);

    res.json({
      success: true,
      data: examples,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching examples',
      error: error.message
    });
  }
};

// Get single example by ID
exports.getExampleById = async (req, res) => {
  try {
    const example = await Example.findById(req.params.id);

    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Example not found'
      });
    }

    res.json({
      success: true,
      data: example
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching example',
      error: error.message
    });
  }
};

// Create new example
exports.createExample = async (req, res) => {
  try {
    const example = new Example(req.body);
    const savedExample = await example.save();

    res.status(201).json({
      success: true,
      message: 'Example created successfully',
      data: savedExample
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating example',
      error: error.message
    });
  }
};

// Update example
exports.updateExample = async (req, res) => {
  try {
    const example = await Example.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Example not found'
      });
    }

    res.json({
      success: true,
      message: 'Example updated successfully',
      data: example
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating example',
      error: error.message
    });
  }
};

// Delete example
exports.deleteExample = async (req, res) => {
  try {
    const example = await Example.findByIdAndDelete(req.params.id);

    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Example not found'
      });
    }

    res.json({
      success: true,
      message: 'Example deleted successfully',
      data: example
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting example',
      error: error.message
    });
  }
};

