const os = require('os');
const express = require('express');
const cors = require('cors');
const http = require("http");
const socketIo = require('socket.io');
const socketClient = require("socket.io-client");
const fs = require('fs');
const generateCustomId = require('./nodeId');
const app = express();
const axios=require('axios');

// HTTP 서버 생성
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const nodeInfoFilePath = './node_info.json';

let nodeConfig;
let port;
let node_id = '';

const start = async () => {
  try {
    // 데이터베이스 초기화 옵션
    const shouldResetDB = process.argv.includes('--reset-db');
    
    if (fs.existsSync(nodeInfoFilePath)) {
      // 파일이 존재하면 읽기
      console.log("파일이 존재합니다. 읽어옵니다.");
      const content = fs.readFileSync(nodeInfoFilePath, 'utf8');
      nodeConfig = JSON.parse(content);
      port = nodeConfig.port;
      node_id = nodeConfig.node_id;
    } else {
      // 파일이 없을 경우 무작위로 포트 번호 생성
      console.log("파일이 존재하지 않습니다.");
      const minPort = 4001;
      const maxPort = 65535;
      port = Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
      node_id = generateCustomId();
      nodeConfig = {
        node_id: node_id,
        port: port,
      };

      fs.writeFileSync(nodeInfoFilePath, JSON.stringify(nodeConfig, null, 2), 'utf8');
    }
    const createChatDB = require('./models/db');
    const chatDB = createChatDB(node_id);

    // 데이터베이스 초기화 옵션이 있으면 실행
    if (shouldResetDB) {
      console.log('데이터베이스 초기화를 시작합니다...');
      await chatDB.resetDB();
      console.log('데이터베이스 초기화가 완료되었습니다.');
    }

    server.listen(port, () => {
      console.log(`웹소켓 서버가 ${port}번 포트에서 실행 중`);
    });

    // 현재 노드의 주소
    let currentAddress = ``;
    const networkInterfaces = os.networkInterfaces();
    let ipAddress;

    for (const interfaceName of Object.keys(networkInterfaces)) {
      for (const interfaceInfo of networkInterfaces[interfaceName]) {
        if (!interfaceInfo.internal && interfaceInfo.family === 'IPv4') {
          ipAddress = interfaceInfo.address;
          break;
        }
      }
      if (ipAddress) {
        currentAddress = `ws://${ipAddress}:${port}`;
        break;
      }
    }
    // 부트스트랩 노드의 주소
    // const bootstrapNodeAddress = 'ws://211.45.163.208:3000';
    const bootstrapNodeAddress = 'ws://localhost:3000';

    // 부트스트랩 노드와 연결 시도
    const socket = socketClient(bootstrapNodeAddress, {
      reconnectionAttempts: 5, // 재시도 횟수
      reconnectionDelay: 2000, // 재시도 간격 (밀리초)
      timeout: 10000, // 연결 시도 타임아웃 (밀리초)
      transports: ['websocket', 'polling'] // 사용 가능한 트랜스포트 설정
    });

    // 연결된 서버들을 저장할 배열
    let connectedServers = [];

    // 연결이 성공했을 때의 이벤트 핸들러
    socket.on('connect', () => {
      console.log('부트스트랩 노드에 연결됨');
      // 자신의 주소를 부트스트랩 노드에게 전달

      socket.emit('first connect', JSON.stringify({ peer: currentAddress }));
      socket.emit('address', JSON.stringify({ peer: currentAddress }));//노드 id도 보내주기
    });

    // 웹소켓 클라이언트로부터 메시지를 받았을 때의 이벤트 핸들러
    socket.on('peers', message => {
      console.log('부트스트랩 노드로부터 주소를 받음:', message);
      if (message !== '') {
        connectToPeers(message);
        getBlock(message)
      }
    });

    // 연결이 종료되었을 때의 이벤트 핸들러
    socket.on('disconnect', () => {
      console.log('부트스트랩 노드와 연결 종료');
    });

    socket.on('connect_error', (err) => {
      console.error('부트스트랩 노드 연결 에러:', err);
    });

    //서버재시작 시 블록동기화 함수
    async function getBlock(peersData) {
      if (!peersData || !peersData.peers) {
        console.error("Invalid peers data");
        return;
      }
      const peers = peersData.peers;
      const peer = peers[0];
      if (peer && peer.address !== currentAddress) {
        const peerSocket = socketClient(peer.address);
        // 마지막 메시지의 타임스탬프와 해시 가져오기
        const messages = await chatDB.getChatsLastWeek();
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage) {
          peerSocket.emit('blockSync', { 
            data: lastMessage.timestamp,
            messageHash: lastMessage.messageHash,
            'address': currentAddress 
          });
        }
        else{
          peerSocket.emit('blockSync', { 
            data: 0,
            messageHash: null,
            address: currentAddress 
          });
        }
      }
    }

    // 웹소켓 연결 시도 함수
    async function connectToPeers(peersData, attempt = 1) {

      if (attempt > 3) {
        console.log(`연결 시도를 ${attempt - 1}번 시도했지만 실패했습니다.`);
        return;
      }
      if (!peersData || !peersData.peers) {
        console.error("Invalid peers data");
        return;
      }
      const peers = peersData.peers;

      for (const peer of peers) {
        if (peer.address !== currentAddress) {
          const alreadyConnected = connectedServers.some(s => s.address === peer.address);
          if (!alreadyConnected) {
            const peerSocket = socketClient(peer.address, { reconnection: false });
            // eslint-disable-next-line no-loop-func
            peerSocket.on('connect', () => {
              console.log(`다른 노드에 연결됨: ${peer.address}`);
              connectedServers.push(peerSocket); // 연결된 서버 배열에 추가

              console.log('연결 추가', connectedServers.length)
            });
            peerSocket.on('connect_error', () => {
              console.log(`연결 실패: ${peer.address}`);

              setTimeout(() => {
                connectToPeers({ peers: [peer] }, attempt + 1);
              }, 0.1);
            });
            // eslint-disable-next-line no-loop-func
            peerSocket.on('disconnect', () => {
              console.log(`노드 연결 종료: ${peer.address}`);
              connectedServers = connectedServers.filter(s => s !== peerSocket);

              console.log('연결 종료', connectedServers.length)
            });
          }
          else {
            console.log(`이미 연결된 노드: ${peer.address}`);
          }
        }
      }
    }

    const userTimeouts = {};
    // 새로운 클라이언트가 연결될 때마다 호출되는 콜백
    io.on("connection", (socket) => {
      let nickname;

      socket.on("message", message => {
        console.log(`받은 메시지: ${message}`);
        // 받은 메시지를 모든 클라이언트에게 전송
        io.emit("message", message);
      });

      socket.on('newUser', async ({ nickname: userNick }) => {
        nickname = userNick;
        console.log(`${nickname} 접속`);
    
        await setUserOnline(nickname);
    
        // 이전에 설정된 타임아웃이 있다면 취소
        if (userTimeouts[nickname]) {
          clearTimeout(userTimeouts[nickname]);
          delete userTimeouts[nickname];
        }
      });

      socket.on("miner", message => {
        console.log(`받은 메시지: ${message}`);
        // 받은 메시지를 모든 클라이언트에게 전송
        io.emit("miner", message);
      });

      socket.on("genesis block", async message => {

        await chatDB.saveChat({
          node: message.node,
          nick: message.nick,
          message: message.message,
          timestamp: message.timestamp
        });

        io.emit("transaction")
      });

      // api
      socket.on("apiRequest", async (message) => {
        const requestData = JSON.parse(message);

        //2채팅 데이터 저장 및 브로드캐스팅
        if (requestData.type === 'chat') {
          await chatDB.saveChat({
            node: node_id,
            nick: requestData.nick,
            message: requestData.message,
            timestamp: requestData.timestamp
          });
          io.emit('transaction')
          // 모든 트랜잭션 처리가 끝난 후 서버에 알림 전송
          connectedServers.forEach(serverSocket => {
            serverSocket.emit("genesis block", {
              node: node_id,
              nick: requestData.nick,
              message: requestData.message,
              timestamp: requestData.timestamp
            });
          });
         
        }

      });

      socket.on('blockSync', async (message) => {
        const res = await chatDB.getLastMessage();
        if (res !== null) {
          let getBlockLength = parseInt(message.data);
          let myBlockLength = parseInt(res.timestamp);

          if (getBlockLength < myBlockLength) {
            const postData = await chatDB.getChatsAfter(getBlockLength);
            const peerData = socketClient(message.address);
            peerData.emit('giveBlock', { 
              data1: postData,
              lastMessageHash: res.messageHash 
            });
          }
        }
      });

      socket.on('giveBlock', async (message) => {
        try {
          // 메시지 해시를 기반으로 중복 체크 후 저장
          await chatDB.saveBulkChats(message.data1);
          io.emit('transaction');
        } catch (error) {
          console.error('블록 동기화 중 오류:', error);
        }
      });

      // 클라이언트 연결이 종료됐을 때의 이벤트 핸들러
      socket.on("disconnect", () => {
        console.log('클라이언트 연결 종료');
        // 클라이언트가 연결이 종면 배열에서 제거
        const index = connectedServers.indexOf(socket);
        if (index !== -1) {
          connectedServers.splice(index, 1);
        }
        console.log('연결 종료', connectedServers.length);

        if (!nickname) return;  // nickname이 없는 경우(예: 아직 설정 안 된 경우) 처리하지 않음
  
        // 일정 시간 후 진짜로 offline 처리
        userTimeouts[nickname] = setTimeout(async () => {
          console.log(`${nickname} offline 처리`);
          await setUserOffline(nickname);  // DB에서 상태 offline으로 설정
          delete userTimeouts[nickname];   // 타임아웃 제거
        }, 60000);  // 예: 15초 뒤
      });

      async function setUserOnline(nick) {
        try {
          await axios.post('http://localhost:3000/api/node/nick', { nickname: nick, nodeid: 'node3' });
        } catch (error) {
          console.error(`Error setting ${nick} online:`, error);
        }      }
      
      async function setUserOffline(nick) {
        try {
          await axios.post('http://localhost:3000/api/node/nickOffline', { nickname: nick });
        } catch (error) {
          console.error(`Error setting ${nick} offline:`, error);
        }      }
    });

  
    const chatRouter = require('./router/chatRouter');

    app.use('/api', chatRouter)

    // 서버 종료 시 사용한 포트 번호를 저장함
    process.on('SIGINT', async () => {
      try {
        // 데이터베이스 연결 종료
        await chatDB.close();
        console.log('데이터베이스 연결이 정상적으로 종료되었습니다.');
      } catch (error) {
        console.error('데이터베이스 종료 중 오류:', error);
      }
      process.exit();
    });
  } catch (error) {
    console.error('socket.js error', error);
  }
};
start()
