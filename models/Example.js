const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Index for better query performance
exampleSchema.index({ name: 1 });
exampleSchema.index({ status: 1 });

module.exports = mongoose.model('Example', exampleSchema);

