const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllCaptains,
  getAllBookings,
  toggleCaptainApproval
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/captains', getAllCaptains);
router.get('/bookings', getAllBookings);
router.put('/captains/:id/approve', toggleCaptainApproval);

module.exports = router;
