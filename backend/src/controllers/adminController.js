const User = require('../models/User');
const Captain = require('../models/Captain');
const Booking = require('../models/Booking');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalCaptains = await Captain.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const bookings = await Booking.find({ paymentStatus: 'paid' });
    const totalRevenue = bookings.reduce((acc, curr) => acc + curr.price, 0);

    res.json({
      totalUsers,
      totalCaptains,
      totalBookings,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all captains
// @route   GET /api/admin/captains
// @access  Private/Admin
const getAllCaptains = async (req, res) => {
  try {
    const captains = await Captain.find().select('-password');
    res.json(captains);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email')
      .populate('captain', 'name email')
      .populate('service', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Captain Approval Status
// @route   PUT /api/admin/captains/:id/approve
// @access  Private/Admin
const toggleCaptainApproval = async (req, res) => {
  try {
    console.log(req.params.id);
    const captain = await Captain.findById(req.params.id);
    if (!captain) return res.status(404).json({ message: 'Captain not found' });

    captain.isApproved = !captain.isApproved;
    await captain.save();

    res.json({ message: `Captain approval set to ${captain.isApproved}`, captain });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllCaptains,
  getAllBookings,
  toggleCaptainApproval
};