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
  // New fields for enhanced features
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  profileImage: {
    type: String
  },
  phone: {
    type: String
  },
  experience: {
    type: Number, // years of experience
    default: 0
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

captainSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

captainSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Captain', captainSchema);
