import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

conversationSchema.index({ user: 1 });

const Conversation= mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

 export default Conversation;