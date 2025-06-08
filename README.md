# Decentralized Chat Application
> 실시간 P2P 채팅과 분산 메시지 저장 기능을 갖춘 블록체인 구조 기반 채팅 애플리케이션입니다.

P2P 네트워크 기반 분산형 채팅 애플리케이션입니다.  
각 노드는 메시지를 자체적으로 저장하며, 중앙 서버 없이 실시간으로 메시지를 주고받습니다.  
초기 접속 및 재접속 시에는 주소 등록 및 연결을 위한 부트스트랩 서버가 사용됩니다.
> 메시지 전송 및 저장은 중앙 서버에 의존하지 않지만, 새로운 노드 접속 시 주소 정보를 제공하는 초기 연결 서버는 존재합니다.

## 주요 기능

- 🌐 P2P 네트워크 기반 통신
- 💬 실시간 메시지 전송
- 🔄 분산형 메시지 처리


| 구분       | 사용 기술                     |
|------------|-------------------------------|
| 프론트엔드 | React.js, Socket.io-client    |
| 백엔드     | Node.js, Express.js, Socket.io|
| 데이터베이스 | LevelDB,MYSQL                |


## 프로젝트 구조

```
decentralized_chat/
├── crypto_blockchain/ # 각 노드 서버의 주소 관리 (노드 주소 관리 및 배포 시 초기 연결 담당)
├── front/             # React 기반 사용자 인터페이스
├── node1/             # 채팅 노드 서버 1 (메시지 처리 및 저장 담당)
├── node2/             # 채팅 노드 서버 2
├── node3/             # 채팅 노드 서버 3
```

## 링크

- 🔗 배포: [http://qkrthdus98.cafe24.com/](http://qkrthdus98.cafe24.com/)  
- 📂 GitHub: [https://github.com/soyeon98/decentralized_chat](https://github.com/soyeon98/decentralized_chat)


