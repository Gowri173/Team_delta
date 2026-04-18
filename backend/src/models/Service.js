const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a service name']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  basePrice: {
    type: Number,
    required: [true, 'Please add a base price']
  },
  imageUrl: {
    type: String,
    default: 'no-photo.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Service', serviceSchema);
