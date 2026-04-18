const Booking = require('../models/Booking');
const Captain = require('../models/Captain');

// @desc    Create a new booking and match with captain
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, date, lat, lng, address, price } = req.body;
    
    // 1. Find an available captain that matches the serviceType
    // For simplicity, we just find any available captain with matching service
    // In a real app, we would calculate distance using geospatial queries
    const availableCaptains = await Captain.find({
      serviceType: serviceName,
      isAvailable: true,
      isApproved: true
    });

    let assignedCaptain = null;
    if (availableCaptains.length > 0) {
      assignedCaptain = availableCaptains[0]._id; // Just pick the first one for MVP
    }

    const booking = new Booking({
      user: req.user._id,
      service: serviceId,
      captain: assignedCaptain,
      date,
      location: { lat, lng, address },
      price,
      status: 'requested' // Status remains requested until captain accepts
    });

    const createdBooking = await booking.save();

    // Emit Socket.io event to captains
    const io = req.app.get('io');
    if (assignedCaptain) {
      // Notify specific captain
      io.to(assignedCaptain.toString()).emit('new-booking-request', createdBooking);
    } else {
      // Broadcast to all captains with matching service type (fallback)
      io.emit('new-booking-broadcast', createdBooking);
    }

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate('service', 'name')
    .populate('captain', 'name');
  res.json(bookings);
};

// @desc    Get captain bookings
// @route   GET /api/bookings/captain
// @access  Private (Captain)
const getCaptainBookings = async (req, res) => {
  const Service = require('../models/Service');
  const service = await Service.findOne({ name: req.user.serviceType });
  const serviceId = service ? service._id : null;

  const query = {
    $or: [
      { captain: req.user._id },
      { service: serviceId, status: 'requested', captain: null }
    ]
  };

  const bookings = await Booking.find(query)
    .populate('service', 'name')
    .populate('user', 'name')
    .sort('-createdAt');
    
  res.json(bookings);
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Captain)
const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    booking.status = status;
    
    if (status === 'accepted') {
      // Captain accepts it
      booking.captain = req.user._id;
    }
    
    const updatedBooking = await booking.save();

    // Notify user via Socket.io
    const io = req.app.get('io');
    io.to(booking.user.toString()).emit('booking-status-updated', updatedBooking);

    res.json(updatedBooking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
};

// @desc    Process mock payment
// @route   POST /api/bookings/:id/pay
// @access  Private
const processMockPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    booking.paymentStatus = 'paid';
    const updatedBooking = await booking.save();

    res.json({ message: 'Payment successful', booking: updatedBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getCaptainBookings,
  updateBookingStatus,
  processMockPayment
};
