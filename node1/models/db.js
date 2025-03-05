const { Level } = require('level');
const path = require('path');
const fs = require('fs');

class ChatDB {
    constructor(nodeId) {
        this.nodeId = nodeId;
        this.dbPath = path.join(__dirname, '..', 'data', `node_${nodeId}`);
        
        // data 디렉토리가 없으면 생성
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        this.initDB();
    }

    initDB() {
        if (!this.db) {
            this.db = new Level(this.dbPath, { 
                valueEncoding: 'json',
                createIfMissing: true 
            });
        }
    }

    async ensureConnection() {
        try {
            // db가 없거나 닫혀있으면 다시 초기화
            if (!this.db || this.db.isClosed()) {
                this.initDB();
            }
            // 연결 테스트
            await this.db.get('test_key').catch(() => {});
        } catch (error) {
            console.log('DB 재연결 시도:', error.message);
            this.initDB();
        }
    }

    // 채팅 메시지 저장
    async saveChat(message) {
        await this.ensureConnection();
        
        const timestamp = message.timestamp.toString().padStart(16, '0');
        const messageHash = this.generateMessageHash(message);
        const key = `chat_${timestamp}_${messageHash}`;
        
        await this.db.put(key, {
            node: this.nodeId,
            nick: message.nick,
            message: message.message,
            timestamp: message.timestamp,
            messageHash: messageHash
        });
    }

    generateMessageHash(message) {
        const content = `${message.node}_${message.nick}_${message.message}_${message.timestamp}`;
        return require('crypto').createHash('sha256').update(content).digest('hex');
    }

    // 채팅 메시지 조회
    async getChats() {
        await this.ensureConnection();
        
        const messages = [];
        for await (const [key, value] of this.db.iterator({
            gt: 'chat_',
            lt: 'chat_\xFF',
            reverse: false
        })) {
            messages.push(value);
        }
        return messages;
    }

    // 일주일메시지만 조회
    async getChatsLastWeek() {
        await this.ensureConnection();
        
        const messages = [];
        const now = Date.now(); // 현재 시간 (밀리초)
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 7일 전 timestamp 계산
    
        // 7일 전 timestamp를 Key 범위의 시작점으로 설정
        const startKey = `chat_${oneWeekAgo.toString().padStart(16, '0')}`;
        
        for await (const [key, value] of this.db.iterator({
            gt: startKey, // 7일 전보다 큰 데이터만 가져오기
            lt: 'chat_\xFF', // 'chat_'로 시작하는 모든 데이터 포함
            reverse: false
        })) {
            messages.push(value);
        }
        return messages;
    }
    
    // 데이터베이스 초기화
    async clear() {
        await this.ensureConnection();
        
        for await (const [key] of this.db.iterator()) {
            await this.db.del(key);
        }
    }

    // 마지막 메시지 조회
    async getLastMessage() {
        await this.ensureConnection();
        
        const messages = await this.getChats();
        return messages[messages.length - 1] || null;
    }

    // 특정 timestamp 이후의 메시지 조회 (동기화용)
    async getChatsAfter(timestamp) {
        await this.ensureConnection();
        
        const messages = [];
        const startKey = `chat_${timestamp.toString().padStart(16, '0')}`;
        
        for await (const [key, value] of this.db.iterator({
            gt: startKey,
            lt: 'chat_\xFF',
            reverse: false
        })) {
            messages.push(value);
        }
        return messages;
    }

    // 메시지 중복 체크
    async isMessageExists(messageHash) {
        await this.ensureConnection();
        
        for await (const [key, value] of this.db.iterator({
            gt: 'chat_',
            lt: 'chat_\xFF',
            reverse: false
        })) {
            if (value.messageHash === messageHash) {
                return true;
            }
        }
        return false;
    }

    // 여러 메시지 일괄 저장 (블록 동기화 시 사용)
    async saveBulkChats(messages) {
        await this.ensureConnection();
        
        const batch = this.db.batch();
        for (const message of messages) {
            const messageHash = message.messageHash || this.generateMessageHash(message);
            const timestamp = message.timestamp.toString().padStart(16, '0');
            const key = `chat_${timestamp}_${messageHash}`;
            
            // 중복 체크 후 저장
            const exists = await this.isMessageExists(messageHash);
            if (!exists) {
                batch.put(key, {
                    ...message,
                    messageHash: messageHash
                });
            }
        }
        await batch.write();
    }

    // 데이터베이스 종료
    async close() {
        if (this.db && !this.db.isClosed()) {
            await this.db.close();
        }
    }

    // 데이터베이스 완전 초기화 (디렉토리 삭제 후 재생성)
    async resetDB() {
        try {
            // DB 연결 종료
            if (this.db) {
                await this.db.close();
                this.db = null;
            }
            
            // data 디렉토리 삭제
            const dataDir = path.join(__dirname, '..', 'data');
            if (fs.existsSync(dataDir)) {
                fs.rmSync(dataDir, { recursive: true, force: true });
            }
            
            // data 디렉토리 재생성
            fs.mkdirSync(dataDir, { recursive: true });
            
            // DB 재초기화
            this.initDB();
            console.log('데이터베이스가 성공적으로 초기화되었습니다.');
        } catch (error) {
            console.error('데이터베이스 초기화 중 오류 발생:', error);
            throw error;
        }
    }
}

// 싱글톤 인스턴스 관리
let instance = null;

module.exports = (nodeId) => {
    if (!instance) {
        instance = new ChatDB(nodeId);
    }
    return instance;
};
