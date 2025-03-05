const db = require('../models');
const peers = db.Peers;
const nick = db.Nick;

const getNode = async(req,res)=>{
    try {
        const result = await peers.findAll();
        console.log(result);
        res.send(result);
    } catch (error) {
        console.error('getNode error : ',error)
    }

}
//연결된 peer 
const peerConnected = async (req, res) => {
    try {
        const result = await peers.findAll({
            where: {
                status: 'connected'
            }
        });

        res.send(result); 

    } catch (error) {
        console.error('peerConnected error:', error);
        res.status(500).send({ error: 'An error occurred while fetching peers' }); // 에러 발생 시 응답을 보냅니다.
    }
};

const postNick = async(req,res)=>{
    try {
        const {nickname,nodeid} = req.body;
        const nickChecked = await nickCheck(nickname); 

        if(nickChecked === '-1'){
            res.send('-1');
        }
        else if(nickChecked === '0'){
            await nick.update({
                nodeid:nodeid,
                status:'online'
            },{
                where:{nickname:nickname}
            });
            res.send('0');
        }
        else if(nickChecked === '1'){
            await nick.create({
                nickname:nickname,
                nodeid:nodeid,
                status:'online'
            });
            res.send('1');
        }

    } catch (error) {
        console.error('postNick error:', error);
        res.status(500).send({ error: 'An error occurred while creating nickname' });
    }
}

const getOnNick = async(req,res)=>{
    try {
        const result = await nick.findAll({
            where:{
                status:'online'
            }
        });
        res.send(result);
    } catch (error) {
        console.error('getNick error:', error);
        res.status(500).send({ error: 'An error occurred while fetching nickname' });
    }
}

const nickOffline = async(req,res)=>{
    try {
        const {nickname} = req.body;
        const result = await nick.update({
            status:'offline'
        },{
            where:{nickname:nickname}
        });
        res.send(result);
    } catch (error) {
        console.error('nickOffline error:', error);
        res.status(500).send({ error: 'An error occurred while updating nickname' });
    }
}

const nickCheck = async (nickname) => {
    try {
        const result = await nick.findOne({
            where: { nickname: nickname }
        });
        if (result) {
            if (result.dataValues.status === 'online') {
                return '-1';  // 이미 사용 중인 닉네임
            } else {
                return '0';   // 상태 변화할 닉네임
            }
        } else {
            return '1';       // 추가 할 닉네임
        }
    } catch (error) {
        console.error('nickCheck error:', error);
        throw error;  // 에러를 throw해서 호출한 곳에서 처리하도록 합니다.
    }
};


module.exports = {
    getNode,
    peerConnected,
    postNick,
    getOnNick,
    nickOffline,
    nickCheck
}