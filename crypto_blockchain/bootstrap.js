const { sequelize } = require('./models');
const express = require('express');
const app = express();
const db = require('./models');
const peers = db.Peers;
const nick = db.Nick;
const http = require("http").createServer(app);
const cors = require('cors')
const socketIo = require('socket.io');

const io = socketIo(http, {
    cors: {
        origin: '*', // 모든 출처 허용
        methods: ['GET', 'POST'] // 허용할 HTTP 메서드
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 연결된 모든 클라이언트를 저장할 배열
const clients = [];

sequelize.sync({ force: false })
    .then(() => {
        console.log('데이터베이스 연결됨.');
    }).catch((err) => {
        console.error(err);
    });

const socketAddressMap = new Map();
// 새로운 클라이언트가 연결될 때마다 호출되는 콜백
io.on("connection", async (socket) => {
    console.log('새로운 클라이언트 연결');
    clients.push(socket);

    // 최신 주소 목록을 가져와서 전송
    socket.on('first connect',async()=>{
        try {
            const allPeers = await peers.findAll({});
            const connectedPeers = await peers.findAll({
                where:{status:'connected'}
            });
            const onlineNick = await nick.findAll({
                where:{status:'online'}
            });
            const peerData = allPeers.map(node => ({
                address: node.address,
                status: node.status
            }));
            const nickData = onlineNick.map(nick => ({
                nickname: nick.nickname,
                nodeid: nick.nodeid
            }));
            socket.emit('pageUpdate', { peers: peerData,nicks:nickData });
            if(connectedPeers){
                const connectedPeerData = connectedPeers.map(node => ({
                    address: node.address,
                    status: node.status
                }));
                socket.emit('peers', { peers: connectedPeerData,nicks:nickData });
            }
        } catch (err) {
            console.error('주소 목록을 가져오는 중 에러 발생:', err);
        }
    })
    // 클라이언트로부터 메시지를 받았을 때의 이벤트 핸들러
    socket.on("address", async (data) => {
        const parsedData = JSON.parse(data);
        const address = parsedData.peer;
        socketAddressMap.set(socket.id, address);
        try {
            // 주소를 데이터베이스에 추가
            const existingPeer = await peers.findOne({ where: { address: address } })
            if (!existingPeer) {
                await peers.create({ address, status: 'connected' });
                console.log('주소가 데이터베이스에 추가되었습니다.');
            } else {
                await peers.update({ status: 'connected' }, { where: { address: address } });
                console.log('주소의 상태가 업데이트되었습니다.');
            }
            const allPeers = await peers.findAll({});
            const onlineNick = await nick.findAll({
                where:{status:'online'}
            });
            const peerData = allPeers.map(node => ({
                address: node.address,
                status: node.status
            }));
            const nickData = onlineNick.map(nick => ({
                nickname: nick.nickname,
                nodeid: nick.nodeid
            }));
            const onePeerData = {
                address:address,
                status:'connected'
            }
            io.emit('peers', { peers: [onePeerData], nicks: nickData });
            io.emit('pageUpdate', { peers: peerData, nicks: nickData });
        } catch (err) {
            console.error('주소를 데이터베이스에 추가하는 중 에러 발생:', err);
        }
    });

    // 새로운 사용자 접속 이벤트 처리
    socket.on("newUser", async (data) => {
        try {
            const onlineNick = await nick.findAll({
                where:{status:'online'}
            });
            const nickData = onlineNick.map(nick => ({
                nickname: nick.nickname,
                nodeid: nick.nodeid
            }));
            io.emit('pageUpdate', { nicks: nickData });
        } catch (err) {
            console.error('새 사용자 정보 업데이트 중 에러 발생:', err);
        }
    });

    // 클라이언트 연결이 종료됐을 때의 이벤트 핸들러
    socket.on("disconnect", async () => {
        console.log('클라이언트 연결 종료');
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        const address = socketAddressMap.get(socket.id);
        if (address) {
            socketAddressMap.delete(socket.id);
            try {
                await peers.update({ status: 'disconnected' }, { where: { address: address } });
                const allPeers = await peers.findAll({});
                const onlineNick = await nick.findAll({
                    where:{status:'online'}
                });
                const peerInfos = allPeers.map(node => ({
                    address: node.address,
                    status: node.status
                }));
                const nickData = onlineNick.map(nick => ({
                    nickname: nick.nickname,
                    nodeid: nick.nodeid
                }));
                io.emit('pageUpdate',{ peers: peerInfos, nicks: nickData });
            } catch (err) {
                console.error('피어 상태를 업데이트하는 중 에러 발생:', err);
            }
        }
    });
});

const nodeRouter = require('./router/nodeRouter');
const serverRouter = require('./router/serverRouter');

// 사용자 상태 업데이트 API
app.post('/api/node/updateStatus', async (req, res) => {
    try {
        const { nickname, status } = req.body;
        await nick.update(
            { status: status },
            { where: { nickname: nickname } }
        );
        res.json({ success: true });
    } catch (error) {
        console.error('사용자 상태 업데이트 중 에러 발생:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.use('/api/node',nodeRouter);
app.use('/api/server',serverRouter);

// HTTP 서버를 3000번 포트로 실행
http.listen(3000, () => {
    console.log('부트스트랩 노드가 3000번 포트에서 실행 중');
});
