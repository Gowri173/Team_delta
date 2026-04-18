const User = require('../models/User');
const Captain = require('../models/Captain');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register/user
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password
  });

  if (user) {
    generateToken(res, user._id, user.role);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Register a new captain
// @route   POST /api/auth/register/captain
// @access  Public
const registerCaptain = async (req, res) => {
  const { name, email, password, serviceType } = req.body;

  const captainExists = await Captain.findOne({ email });

  if (captainExists) {
    return res.status(400).json({ message: 'Captain already exists' });
  }

  const captain = await Captain.create({
    name,
    email,
    password,
    serviceType
  });

  if (captain) {
    generateToken(res, captain._id, 'captain');
    res.status(201).json({
      _id: captain._id,
      name: captain.name,
      email: captain.email,
      role: 'captain',
      serviceType: captain.serviceType,
      isApproved: captain.isApproved
    });
  } else {
    res.status(400).json({ message: 'Invalid captain data' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password, role } = req.body;

  let account;
  if (role === 'captain') {
    account = await Captain.findOne({ email }).select('+password');
  }
  else if (role === 'admin') {
    account = await User.findOne({ email }).select('+password');
  }
  else {
    account = await User.findOne({ email }).select('+password');
  }

  if (account && (await account.matchPassword(password))) {
    // If it's a captain check approval (optional, depends on policy)
    // if (role === 'captain' && !account.isApproved) {
    //   return res.status(403).json({ message: 'Account pending admin approval' });
    // }

    generateToken(res, account._id, role || account.role);
    res.json({
      _id: account._id,
      name: account.name,
      email: account.email,
      role: role || account.role
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const account = req.user;

  if (account) {
    res.json({
      _id: account._id,
      name: account.name,
      email: account.email,
      role: account.role,
      ...(account.role === 'captain' && { serviceType: account.serviceType, isApproved: account.isApproved, isAvailable: account.isAvailable })
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

module.exports = {
  registerUser,
  registerCaptain,
  login,
  logout,
  getProfile
};
