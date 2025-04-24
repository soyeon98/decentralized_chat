# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

//////////////////////////////////////////////////////////////////
🚀 프로젝트 주요 특징 (포트폴리오에서 강조할 포인트)
✔ Node.js + MySQL + React 기반의 풀스택 프로젝트
✔ P2P 네트워크 + WebSocket을 활용한 분산형 채팅 시스템
✔ 주소관리 노드를 통한 동적 노드 연동 (중앙 서버 X)
✔ 노드마다 독립적인 데이터 저장 (암호화 + 분산 저장)
✔ 노드가 꺼졌다 켜질 때 자동 동기화 기능
✔ 다중 사용자 지원 (실시간 동기화 + 접속 관리)

🎨 프로젝트 아키텍처
📌 구성 요소

주소관리 노드 → 모든 노드(서버) 상태 관리 & 노드 리스트 제공
각 노드 (서버) → 독립적인 WebSocket 서버 & 채팅 데이터 저장 (암호화)
React 프론트엔드 → 노드 리스트에서 선택 후 접속 → 채팅
📌 동작 흐름 1️⃣ 사용자가 메인 프론트엔드에서 노드 리스트 확인
2️⃣ 접속 중인 노드는 비활성화(선택 불가), 사용 가능한 노드만 선택 가능
3️⃣ 클릭하면 해당 노드의 WebSocket 서버로 접속 → 채팅방 입장
4️⃣ 채팅 내역은 각 노드의 DB에 암호화 저장 & 분산 저장
5️⃣ 특정 노드가 꺼졌다 켜지면 다른 노드에서 데이터 동기화

🔥 이 프로젝트가 포트폴리오로 좋은 이유
🚀 기술 요소	💡 포트폴리오에서 강조할 점
P2P 네트워크	중앙 서버 없이 분산 네트워크 구축
WebSocket 실시간 통신	다중 사용자 동시 채팅 가능
MySQL + 암호화 저장	데이터 보안 강화 & 분산 저장
React 기반 프론트엔드	노드 리스트 UI + 실시간 채팅 UI 구현
Failover 기능	특정 노드가 다운돼도 데이터 복구 가능
✅ 즉, 백엔드, 프론트엔드, 네트워크, 보안까지 전반적인 기술 스택을 다룰 수 있는 프로젝트!
✅ 실제 서비스로 배포할 필요는 없지만, 핵심 기술력과 문제 해결 능력을 보여줄 수 있음!

🎯 배포 전략
노드는 3~4개 정도만 배포하면 충분 (ex. node1.com, node2.com, node3.com)
주소관리 노드 1개 배포 (main-node.com)
프론트엔드는 Vercel, Netlify 등에서 배포 가능
백엔드 & DB는 AWS EC2, Render, Railway 같은 무료 서버 사용 가능
✅ 최종 결론
✔ 네트워크, 보안, 실시간 통신, 풀스택 개발 경험을 강조할 수 있는 포트폴리오
✔ 단순한 CRUD 프로젝트가 아니라, 아키텍처 설계와 시스템 동작을 이해하고 있다는 점을 어필 가능
✔ 3~4개 노드로 배포해서 실제 동작하는 모습을 데모로 보여주면 강한 인상을 줄 수 있음