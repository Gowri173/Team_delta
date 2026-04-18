require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const connectDB = require('./src/config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@serveease.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = new User({
      name: 'Super Admin',
      email: 'admin@serveease.com',
      password: 'password123',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (error) {
    console.error('Error with data import', error);
    process.exit(1);
  }
};

seedAdmin();
