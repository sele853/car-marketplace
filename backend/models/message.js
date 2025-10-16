import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref:'User', required:true },
    content: { type: String, required: true },
    chatRoom: { type: String, required: true }
}, {timestamps:true});

messageSchema.index({ chatRoom: 1, createdAt: -1 });

const Message = mongoose.models.Message || mongoose.model('Message',messageSchema);

export default Message;