const Booking = require('../models/Booking');
const Captain = require('../models/Captain');
const Notification = require('../models/Notification');

// @desc    Create a new booking and match with captain
// @route   POST /api/bookings
// @access  Private (User)
const createBooking = async (req, res) => {
  try {
    const { serviceId, serviceName, date, timeSlot, lat, lng, address, price } = req.body;

    // Smart captain assignment: Find available captains with matching service type
    // Sort by rating (highest first) and availability
    const availableCaptains = await Captain.find({
      serviceType: serviceName,
      isAvailable: true,
      isApproved: true,
      isOnline: true
    }).sort({ rating: -1, completedJobs: -1 });

    let assignedCaptain = null;
    if (availableCaptains.length > 0) {
      assignedCaptain = availableCaptains[0]._id;
    }

    const booking = new Booking({
      user: req.user._id,
      service: serviceId,
      captain: assignedCaptain,
      date,
      timeSlot: timeSlot || 'Now',
      location: { lat, lng, address },
      price,
      status: 'requested'
    });

    if (assignedCaptain) {
      const captainData = await Captain.findById(assignedCaptain);
      if (captainData?.currentLocation?.lat && captainData?.currentLocation?.lng) {
        booking.captainLocation = {
          lat: captainData.currentLocation.lat,
          lng: captainData.currentLocation.lng
        };
      }
    }

    const createdBooking = await booking.save();

    // Create notification for user
    await Notification.create({
      user: req.user._id,
      title: 'Booking Created',
      message: `Your ${serviceName} booking has been created and is being processed.`,
      type: 'booking',
      booking: createdBooking._id
    });

    // Emit Socket.io event to captains
    const io = req.app.get('io');
    if (assignedCaptain) {
      // Notify specific captain
      io.to(assignedCaptain.toString()).emit('new-booking-request', createdBooking);
    } else {
      // Broadcast to all captains with matching service type (fallback)
      io.emit('new-booking-broadcast', createdBooking);
    }

    // Notify user via socket
    io.to(req.user._id.toString()).emit('booking-created', createdBooking);

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private (User)
const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id },)
    .populate('service', 'name')
    .populate('captain', 'name')
    .sort('-createdAt');
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
  const { status, captainLat, captainLng } = req.body;
  const booking = await Booking.findById(req.params.id).populate('user', 'name').populate('captain', 'name');

  if (booking) {
    const previousStatus = booking.status;
    booking.status = status;

    if (status === 'accepted') {
      booking.captain = req.user._id;
      booking.estimatedArrival = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

      if (!booking.captainLocation && req.user.currentLocation?.lat && req.user.currentLocation?.lng) {
        booking.captainLocation = {
          lat: req.user.currentLocation.lat,
          lng: req.user.currentLocation.lng
        };
      }

      // Create notification for user
      if (booking.user) {
        await Notification.create({
          user: booking.user._id,
          title: 'Booking Accepted',
          message: `Your booking has been accepted by ${req.user.name}. Estimated arrival: ${booking.estimatedArrival.toLocaleTimeString()}`,
          type: 'booking',
          booking: booking._id
        });
      }
    }

    if (status === 'in_progress') {
      booking.startedAt = new Date();
      booking.actualArrival = new Date();
      if (!booking.captainLocation && req.user.currentLocation?.lat && req.user.currentLocation?.lng) {
        booking.captainLocation = {
          lat: req.user.currentLocation.lat,
          lng: req.user.currentLocation.lng
        };
      }

      // Create notification for user
      if (booking.user) {
        await Notification.create({
          user: booking.user._id,
          title: 'Service Started',
          message: `${req.user.name} has arrived and started the service.`,
          type: 'booking',
          booking: booking._id
        });
      }
    }

    if (status === 'completed') {
      booking.completedAt = new Date();

      // Update captain stats
      const captain = await Captain.findById(req.user._id);
      if (captain) {
        captain.completedJobs = (captain.completedJobs || 0) + 1;
        await captain.save();
      }

      // Create notification for user
      if (booking.user) {
        await Notification.create({
          user: booking.user._id,
          title: 'Service Completed',
          message: `Your service has been completed successfully. Please rate your experience.`,
          type: 'booking',
          booking: booking._id
        });
      }
    }

    // Update captain location if provided
    if (captainLat && captainLng) {
      booking.captainLocation = { lat: captainLat, lng: captainLng };
    }

    const updatedBooking = await booking.save();

    // Notify user via Socket.io
    const io = req.app.get('io');
    if (io && booking.user) {
      io.to(booking.user.toString()).emit('booking-status-updated', updatedBooking);
    }

    // Notify captain if status changed
    if (io && booking.captain && booking.captain.toString() !== req.user._id.toString()) {
      io.to(booking.captain.toString()).emit('booking-status-updated', updatedBooking);
    }

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
    const { paymentMethod, cardNumber, expiryDate, cvv, upiId } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Already paid' });
    }

    // Simulate payment processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    booking.paymentStatus = 'paid';
    booking.paymentIntentId = transactionId;
    const updatedBooking = await booking.save();

    // Credit captain, cutting 20% platform charge
    if (booking.captain) {
      const captain = await Captain.findById(booking.captain);
      if (captain) {
        const platformFeePercentage = 0.20; // 20% cut
        const captainCut = booking.price * (1 - platformFeePercentage);

        captain.earnings = (captain.earnings || 0) + captainCut;
        await captain.save();
      }
    }

    // Create payment notification
    if (booking.user) {
      await Notification.create({
        user: booking.user,
        title: 'Payment Successful',
        message: `Payment of ₹${booking.price} has been processed successfully. Transaction ID: ${transactionId}`,
        type: 'payment',
        booking: booking._id
      });
    }

    // Notify user via socket
    const io = req.app.get('io');
    if (io && booking.user) {
      io.to(booking.user.toString()).emit('payment-successful', {
        booking: updatedBooking,
        transactionId,
        amount: booking.price
      });
    }

    res.json({
      message: 'Payment successful',
      booking: updatedBooking,
      transactionId,
      amount: booking.price,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Payment Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit rating and review
// @route   POST /api/bookings/:id/rate
// @access  Private (User)
const submitRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id).populate('captain');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (!booking.user || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only rate completed bookings' });
    }

    if (booking.rating) {
      return res.status(400).json({ message: 'Already rated' });
    }

    booking.rating = rating;
    booking.review = review;
    booking.reviewDate = new Date();
    await booking.save();

    // Update captain's rating
    if (booking.captain) {
      const captain = await Captain.findById(booking.captain._id);
      if (captain) {
        const newTotalRatings = captain.totalRatings + 1;
        const newRating = ((captain.rating * captain.totalRatings) + rating) / newTotalRatings;

        captain.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
        captain.totalRatings = newTotalRatings;
        await captain.save();
      }
    }

    // Create notification for captain
    await Notification.create({
      user: booking.captain._id,
      title: 'New Rating Received',
      message: `You received a ${rating}-star rating from a customer.`,
      type: 'rating',
      booking: booking._id
    });

    res.json({ message: 'Rating submitted successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking tracking info
// @route   GET /api/bookings/:id/tracking
// @access  Private
const getBookingTracking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('captain', 'name rating currentLocation')
      .populate('service', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user && booking.user.toString() !== req.user._id.toString() && (!booking.captain || booking.captain._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const captainLocation = booking.captainLocation?.lat && booking.captainLocation?.lng
      ? booking.captainLocation
      : booking.captain?.currentLocation;

    const trackingInfo = {
      bookingId: booking._id,
      status: booking.status,
      service: booking.service?.name,
      captain: booking.captain ? {
        name: booking.captain.name,
        rating: booking.captain.rating,
        location: booking.captain.currentLocation
      } : null,
      location: booking.location,
      captainLocation,
      estimatedArrival: booking.estimatedArrival,
      actualArrival: booking.actualArrival,
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      price: booking.price,
      paymentStatus: booking.paymentStatus
    };

    res.json(trackingInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update captain location
// @route   PUT /api/bookings/:id/location
// @access  Private (Captain)
const updateCaptainLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.captain?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.captainLocation = { lat, lng };
    await booking.save();

    // Update captain's current location
    await Captain.findByIdAndUpdate(req.user._id, {
      currentLocation: { lat, lng },
      lastActive: new Date()
    });

    // Notify user of location update
    const io = req.app.get('io');
    if (io && booking.user) {
      io.to(booking.user.toString()).emit('captain-location-updated', {
        bookingId: booking._id,
        location: { lat, lng }
      });
    }

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getCaptainBookings,
  updateBookingStatus,
  processMockPayment,
  submitRating,
  getBookingTracking,
  updateCaptainLocation
};
