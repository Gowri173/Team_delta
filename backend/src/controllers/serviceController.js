const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { name, description, basePrice, imageUrl } = req.body;

    const service = new Service({
      name,
      description,
      basePrice,
      imageUrl
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(400).json({ message: 'Invalid service data' });
  }
};

module.exports = {
  getServices,
  createService
};
