const { v4: uuidv4 } = require('uuid');

const generateShortTimestamp = () => {
    const now = Date.now(); // 현재 시간의 밀리초
    return now.toString(36); // Base36 인코딩
};

const generateCustomId = () => {
    // 1. UUID v4 생성
    const uuid = uuidv4().replace(/-/g, ''); // 하이픈 제거로 32문자

    // 2. 현재 시간 추가
    const shortTimestamp = generateShortTimestamp();
    // 3. UUID와 시간 결합
    const customId = `${uuid}${shortTimestamp}`; // UUID 32문자 + 시간 12문자 = 44문자
    
    return customId;
};
module.exports = generateCustomId;

