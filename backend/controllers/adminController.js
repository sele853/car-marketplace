import User from '../models/user.js';
import Car from '../models/car.js';
import Payment from '../models/payment.js';

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isBlocked } = req.query;
    const query = isBlocked ? { isBlocked: isBlocked === 'true' } : {};
    
    const users = await User.find(query)
      .select('name email role isBlocked createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    const total = await User.countDocuments(query);

    res.json({
      message: 'Users retrieved',
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ message: 'Failed to get users', error: err.message });
  }
};

export const toggleUserBlock = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block another admin' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`, user });
  } catch (err) {
    console.error('Toggle user block error:', err.message);
    res.status(500).json({ message: 'Failed to toggle user block', error: err.message });
  }
};

export const getCars = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    const cars = await Car.find(query)
      .populate('seller', 'name email')
      .select('make model year price mileage location status')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    const total = await Car.countDocuments(query);

    res.json({
      message: 'Cars retrieved',
      cars,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get cars error:', err.message);
    res.status(500).json({ message: 'Failed to get cars', error: err.message });
  }
};

export const updateCarStatus = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    car.status = status;
    await car.save();
    res.json({ message: `Car status updated to ${status}`, car });
  } catch (err) {
    console.error('Update car status error:', err.message);
    res.status(500).json({ message: 'Failed to update car status', error: err.message });
  }
};

export const deleteCar = async (req, res, next) => {
  try {
    const { carId } = req.params;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    await Car.deleteOne({ _id: carId });
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error('Delete car error:', err.message);
    res.status(500).json({ message: 'Failed to delete car', error: err.message });
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = status ? { status } : {};
    
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('car', 'make model')
      .select('amount transactionRef status createdAt')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    
    const total = await Payment.countDocuments(query);

    res.json({
      message: 'Payments retrieved',
      payments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    console.error('Get payments error:', err.message);
    res.status(500).json({ message: 'Failed to get payments', error: err.message });
  }
};


export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCars = await Car.countDocuments({ status: 'approved' });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const recentPayments = await Payment.find({ status: 'completed' })
      .populate('car', 'make model')
      .select('amount createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      message: 'Analytics retrieved',
      analytics: {
        totalUsers,
        totalCars,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentPayments
      }
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Failed to get analytics', error: err.message });
  }
};