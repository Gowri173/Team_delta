const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const captainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify the service you provide']
  },
  isAvailable: {
    type: Boolean,
    default: false
  },
  location: {
    // Basic coordinates for Leaflet map mock
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
    address: { type: String }
  },
  isApproved: {
    type: Boolean,
    default: false // Admin needs to approve
  },
  earnings: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

captainSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

captainSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Captain', captainSchema);
