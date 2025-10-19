import axios from 'axios';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Car from '../models/Car.js';

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL || 'https://api.chapa.co/v1';

export const createChapaPayment = async (req, res, next) => {
  try {
    const { carId, amount, phone } = req.body;

    // Validate inputs
    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      return res.status(400).json({ message: 'Valid car ID is required' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Valid positive amount is required (in ETB)' });
    }
    if (amount > 1000000) {
      return res.status(400).json({ message: 'Amount must not exceed 1,000,000 ETB' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Debug user data
    console.log('User data:', { id: req.user.id, email: req.user.email, name: req.user.name });

    // Verify car exists
    const car = await Car.findById(carId).populate('seller');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Warn if amount doesn't match car price
    if (Math.abs(amount - car.price) > 100) {
      console.warn(`Payment amount ${amount} ETB doesn't match car price ${car.price} ETB`);
    }

    // Generate unique, short transaction reference (<50 chars)
    const shortUserId = req.user.id.slice(-8);
    const shortRandom = Math.random().toString(36).substr(2, 6);
    const transactionRef = `CAR_${shortUserId}_${Date.now()}_${shortRandom}`.slice(0, 50);

    // Create payment record
    const payment = new Payment({
      user: req.user.id,
      car: carId,
      amount,
      transactionRef,
      gateway: 'chapa',
      metadata: {
        carMake: car.make,
        carModel: car.model,
        sellerId: car.seller._id.toString()
      }
    });
    await payment.save();

    // Prepare user data safely
    const name = req.user.name || 'Test User';
    const firstName = name.split(' ')[0] || 'Test';
    const lastName = name.split(' ').slice(1).join(' ') || 'User';
    const userEmail = req.user.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.user.email)
      ? req.user.email
      : `test${Date.now()}@mailinator.com`; // Dynamic test email

    // Debug Chapa request payload
    const chapaPayload = {
      amount,
      currency: 'ETB',
      email: userEmail,
      first_name: firstName,
      last_name: lastName,
      phone_number: phone || '',
      tx_ref: transactionRef,
      callback_url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/payment/callback`,
      return_url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/cars/${carId}`,
      description: `Payment for ${car.make} ${car.model} (ID: ${carId})`
    };
    console.log('Chapa request payload:', chapaPayload);

    // Initialize Chapa transaction
    let chapaResponse;
    try {
      chapaResponse = await axios.post(
        `${CHAPA_BASE_URL}/transaction/initialize`,
        chapaPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (axiosError) {
      console.error('Chapa API error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      throw axiosError;
    }

    if (chapaResponse.data.status !== 'success') {
      payment.status = 'failed';
      await payment.save();
      return res.status(400).json({ 
        message: 'Chapa payment initialization failed', 
        error: chapaResponse.data.message || 'Unknown error'
      });
    }

    // Store checkout URL
    payment.metadata.checkoutUrl = chapaResponse.data.data.checkout_url;
    await payment.save();

    console.log(`Chapa payment initialized: ${transactionRef} for ${amount} ETB`);

    res.status(201).json({
      checkoutUrl: chapaResponse.data.data.checkout_url,
      transactionRef,
      paymentId: payment._id,
      amount
    });
  } catch (err) {
    console.error('Chapa payment error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Failed to initialize payment',
      error: err.response?.data || err.message
    });
  }
};

export const verifyChapaPayment = async (req, res, next) => {
  try {
    const { tx_ref } = req.query;
    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference (tx_ref) is required' });
    }
    const payment = await Payment.findOne({ transactionRef: tx_ref });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const verifyResponse = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
        }
      }
    );
    const { status, data } = verifyResponse.data;
    if (status === 'success') {
      payment.status = 'completed';
      payment.metadata.set('chapaResponse', JSON.stringify(data));
      await payment.save();
      console.log(`Payment ${tx_ref} verified as completed`);
      res.json({ message: 'Payment verified and completed', payment });
    } else {
      payment.status = 'failed';
      payment.metadata.set('chapaResponse', JSON.stringify(data));
      await payment.save();
      console.log(`Payment ${tx_ref} verification failed: ${data.message}`);
      res.status(400).json({ message: 'Payment verification failed', data });
    }
  } catch (err) {
    console.error('Chapa verification error:', err.response?.data || err.message);
    next(err);
  }
};

export const getChapaPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user.id, gateway: 'chapa' })
      .populate('car', 'make model year price images')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(payments);
  } catch (err) {
    console.error('Get payments error:', err.message);
    next(err);
  }
};