const chatController = require('../controller/chatController');
const router = require("express").Router();

router.get('/getChat',chatController.getChat);
router.get('/getChatAfter/:timestamp',chatController.getChatAfter);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const createChatDB = require('../models/db');
// const fs = require('fs');

// // 노드 ID 가져오기
// const nodeInfoFilePath = './node_info.json';
// const nodeConfig = JSON.parse(fs.readFileSync(nodeInfoFilePath, 'utf8'));
// const chatDB = createChatDB(nodeConfig.node_id);

// // 전체 채팅 메시지 조회
// router.get('/getChat', async (req, res) => {
//     try {
//         const messages = await chatDB.getChats();
//         res.json(messages);
//     } catch (error) {
//         console.error('채팅 조회 오류:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// // 특정 시점 이후의 메시지 조회
// router.get('/getChatAfter/:timestamp', async (req, res) => {
//     try {
//         const timestamp = parseInt(req.params.timestamp);
//         const messages = await chatDB.getChatsAfter(timestamp);
//         res.json(messages);
//     } catch (error) {
//         console.error('채팅 조회 오류:', error);
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;