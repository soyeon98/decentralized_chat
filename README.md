# Decentralized Chat Application

P2P 네트워크를 활용한 탈중앙화된 채팅 애플리케이션입니다. 중앙 서버 없이 직접적인 P2P 통신을 통해 메시지를 전송합니다.

## 주요 기능

- 🌐 P2P 네트워크 기반 통신
- 💬 실시간 메시지 전송
- 🔄 분산형 메시지 처리


### 프론트엔드
- React.js
- Socket.io-client
- Material-UI

### 백엔드
- Node.js
- Express.js
- Socket.io

## 프로젝트 구조

```
decentralized_chat/
├── front/           # React 프론트엔드 애플리케이션
├── node1/           # P2P 네트워크 노드 1
├── node2/           # P2P 네트워크 노드 2
```

## 시작하기

### 사전 요구사항
- Node.js (v14 이상)
- npm 또는 yarn

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/soyeon98/decentralized_chat.git
cd decentralized_chat
```

2. 프론트엔드 설치 및 실행
```bash
cd front
npm install
npm start
```

3. P2P 노드 실행
```bash
# 노드 1 실행
cd node1
npm install
node socket

# 노드 2 실행 (새 터미널에서)
cd node2
npm install
node socket
```

