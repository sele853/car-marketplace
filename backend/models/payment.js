import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  car: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Car', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0 
  },
  transactionRef: { 
    type: String, 
    required: true,
    unique: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  gateway: {
    type: String,
    default: 'chapa'
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ transactionRef: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;