const Message = require("../models/Message");
const Chat = require("../models/Chat");

// Create Message
async function sendMessage(req, res) {
  try {
    const { chatId, message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({ msg: "chatId and message content are required" });
    }

    let newMessage = await Message.create({
      sender: req.user.id,
      message,
      chat: chatId,
    });

    newMessage = await newMessage.populate("sender", "name email");
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage._id });
    res.status(201).json({ success: true, message: newMessage });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
}

// GET Messages
async function getMessages(req, res) {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 }); 

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
}

module.exports = { sendMessage, getMessages };