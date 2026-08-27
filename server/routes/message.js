const express = require("express");
const { protect } = require("../middleware/auth");
const { sendMessage, getMessages } = require("../controllers/message");

const router = express.Router();
router.use(protect);
router.get("/:chatId", getMessages);
router.post("/", sendMessage);

module.exports = router;