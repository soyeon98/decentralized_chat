const { exec, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
let nodeProcesses = {};

//서버 시작
const startNode = (req, res) => {
    const server = req.params.id;
    try {
        // 절대 경로 계산
        const rootDir = path.resolve(__dirname, '../../');
        const serverPath = path.join(rootDir, server, 'socket.js');
        
        // 파일 존재 여부 확인
        if (!fs.existsSync(serverPath)) {
            console.error(`파일을 찾을 수 없음: ${serverPath}`);
            return res.status(404).json({ 
                message: "서버 파일을 찾을 수 없습니다", 
                path: serverPath 
            });
        }

        console.log(`서버 시작 시도: ${serverPath}`);
        
        // 이미 실행 중인 프로세스가 있는지 확인
        if (nodeProcesses[server]) {
            return res.status(400).json({ message: "서버가 이미 실행 중입니다." });
        }

        // spawn을 사용하여 Node 프로세스 실행
        const process = spawn('node', [serverPath], {
            stdio: ['ignore', 'pipe', 'pipe'],
            detached: true,
            cwd: path.dirname(serverPath) // 서버 파일이 있는 디렉토리에서 실행
        });

        let started = false;
        let errorOutput = '';

        // 표준 출력 처리
        process.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`서버 출력: ${output}`);
            if (output.includes('웹소켓 서버가')) {
                started = true;
            }
        });

        // 에러 출력 처리
        process.stderr.on('data', (data) => {
            const error = data.toString();
            console.error(`서버 에러: ${error}`);
            errorOutput += error;
        });

        // 프로세스 종료 이벤트 처리
        process.on('error', (error) => {
            console.error(`프로세스 시작 실패: ${error.message}`);
            return res.status(500).json({ 
                message: "서버 실행 실패", 
                error: error.message,
                path: serverPath
            });
        });

        // 일정 시간 후에 서버 상태 확인
        setTimeout(() => {
            if (process.exitCode === null) {  // 프로세스가 아직 실행 중
                nodeProcesses[server] = process.pid;
                res.json({ 
                    message: "서버가 시작되었습니다!", 
                    pid: process.pid,
                    path: serverPath
                });
            } else {
                res.status(500).json({ 
                    message: "서버 시작 실패", 
                    error: errorOutput || "알 수 없는 오류",
                    path: serverPath
                });
            }
        }, 2000);  // 2초 대기

    } catch (error) {
        console.error(`예외 발생: ${error.toString()}`);
        res.status(500).send({
            'message': '서버 시작 중 오류 발생',
            'error': error.toString()
        });
    }
}



//서버 종료
const stoptNode = (req, res) => {
    const server = req.params.id;
    try {
        const pid = nodeProcesses[server];
        if (!pid) {
            return res.status(404).json({ message: "실행 중인 서버를 찾을 수 없습니다." });
        }

        // Windows용 프로세스 종료 명령
        const stopCommand = `taskkill /F /PID ${pid} /T`;  // /T 옵션 추가하여 자식 프로세스도 종료

        exec(stopCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`서버 종료 실패: ${error.message}`);
                return res.status(500).json({ message: "서버 종료 실패", error: error.message });
            }
            delete nodeProcesses[server];
            console.log(`서버 종료: ${stdout}`);
            res.json({ message: "서버가 종료되었습니다!" });
        });
    } catch (error) {
        res.status(500).send({'message':'서버 종료 중 오류 발생','error':error.toString()})
    }
}

module.exports = { 
    startNode,
    stoptNode
};
