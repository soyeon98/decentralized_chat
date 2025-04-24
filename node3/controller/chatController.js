const chatDB = require('../models/db')(require('../node_info.json').node_id);

const getChat = async(req,res) => {
    try {
        // DB가 열려있는지 확인
        if (!chatDB.db.status === 'open') {
            throw new Error('데이터베이스가 열려있지 않습니다');
        }
        const messages = await chatDB.getChats();
        res.json(messages);
    } catch (error) {
        console.error('getChat 에러:', error);
        res.status(500).json({ 
            error: '데이터베이스 연결 오류가 발생했습니다',
            details: error.message 
        });
    }
}

const getChatAfter = async(req,res) => {
    try {
        const timestamp = parseInt(req.params.timestamp);
        const messages = await chatDB.getChatsAfter(timestamp);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}




module.exports = {
    getChat,
    getChatAfter
}