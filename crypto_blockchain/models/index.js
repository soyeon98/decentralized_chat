// index.js 파일은 Sequelize 설정 파일로, Sequelize를 초기화하고 여러 모델을 로드하며 Sequelize 인스턴스와 모델들을 내보내는 역할을 합니다. 

// Sequelize 객체 가져오기
const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';

// config 폴더에서 데이터베이스 설정 가져오기
const config = require('../config/config')[env];

// Sequelize 관련 객체들을 저장할 객체 생성
const db = {};

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config,
);

// 모델 로딩 예) User모델을 sequelize 인스턴스와 Sequelize 객체를 사용하여 로드
db.Peers = require('./peers')(sequelize, Sequelize);
db.Nick = require('./nick')(sequelize, Sequelize);

// 연관관계 설정이나 필요한 초기화 작업 수행
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db 객체를 모듈로 내보냄
module.exports = db;