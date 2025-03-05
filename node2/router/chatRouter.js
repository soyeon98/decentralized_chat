const chatController = require('../controller/chatController');
const router = require("express").Router();

router.get('/getChat',chatController.getChat);
router.get('/getChatAfter/:timestamp',chatController.getChatAfter);

module.exports = router;