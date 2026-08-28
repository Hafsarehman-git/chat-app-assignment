const Message = require("../models/Message");
const mongoose = require("mongoose");
const User = require("../models/User");

async function listChatUsers(req, res) {
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select("name email")
    .sort({ name: 1 });

  res.json({ success: true, users });
}
async function getUnreadCounts(req, res) {
  const unread = await Message.aggregate([
    { $match: { recipient: req.user.id, read: false } },
    { $group: { _id: "$sender", count: { $sum: 1 } } },
  ]);

  const counts = {};
  unread.forEach((item) => {
    counts[item._id.toString()] = item.count;
  });

  res.json({ success: true, unread: counts });
}

module.exports = { listChatUsers,getUnreadCounts };
