import Message from "../models/message.js";

export const getChatHistory = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;
    const chatRoom = [req.user.id, otherUserId].sort().join("_");

    const messages = await Message.find({ chatRoom })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 })
      .limit(50);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { receiver, content } = req.body;
    const chatRoom = [req.user.id, receiver].sort().join("_");

    const message = new Message({
      sender: req.user.id,
      receiver,
      content,
      chatRoom,
    });
    await message.save();

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};
