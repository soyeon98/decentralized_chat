require('dotenv').config();
const fs = require('fs');
const env = process.env; // 환경변수 설정 (환경변수의 목록을 출력하거나 민감한 정보의 보안을 위한 모듈)
let nodeConfig;
const portFilePath = './node_info.json';

const fd = fs.openSync(portFilePath, 'r');
const content = fs.readFileSync(fd, 'utf8');

nodeConfig = JSON.parse(content);
let node_id=nodeConfig.node_id;
//mysql에 생성한 connection 정보 적어주기 local에서 돌릴경우 local의 root 부터  127.0.0.1 hostname 등을 넣어주세요
const development = {
  username: env.MYSQL_USERNAME,
  password: env.MYSQL_PASSWORD,
  database: `${node_id}`,
  host: '127.0.0.1',
  dialect: "mysql", //옵션설정 (mysql, mariadb 사용중인 db를 넣어준다)
  timezone: "+09:00",
  //port: env.MYSQL_PORT
};

const production = {
  username: 'admin',
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: '127.0.0.1',
  dialect: "mysql",
  timezone: "+09:00",
  //port: env.MYSQL_PORT
};

const test = {
  username: 'admin',
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  host: '127.0.0.1',
  dialect: "mysql",
  timezone: "+09:00",
  //port: env.MYSQL_PORT
};

module.exports = { development, production, test }; //모듈화 (여러 기능들에 관한 코드가 모여있는 하나의 파일 )

