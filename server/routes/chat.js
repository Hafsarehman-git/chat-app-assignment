const express = require("express");
const { protect } = require("../middleware/auth");
const { listChatUsers, getUnreadCounts } = require("../controllers/chatbar");

const router = express.Router();
router.use(protect);
router.get("/unread-counts", getUnreadCounts);
router.get("/users", listChatUsers);

module.exports = router;
