/**
 * ==============================================================================
 * 낙동강 발전관리과 4조3교대 근무포털 - Node.js 전용 웹 서버 (server.js)
 * ==============================================================================
 * 외부 패키지 설치(npm install) 없이 순수 Node.js 내장 모듈(http, fs, path)로 즉시 실행 가능합니다.
 * 
 * 실행 방법:
 *    node server.js
 *    또는
 *    npm start
 *    또는 포트 지정: PORT=3000 node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

// 포트 결정: 클라우드 환경에서 PORT가 8080(Nginx 포트)인 경우 내부 3000 포트 사용
let resolvedPort = 3000;
if (process.env.APP_PORT) {
  resolvedPort = parseInt(process.env.APP_PORT, 10);
} else if (process.env.PORT && process.env.PORT !== '8080') {
  resolvedPort = parseInt(process.env.PORT, 10);
}
const PORT = resolvedPort;
const HOST = '0.0.0.0';
const BASE_DIR = __dirname;

function getNetworkIpList() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

function loadEnvConfig() {
  const envPaths = [
    path.join(BASE_DIR, '..', '.env'),
    path.join(BASE_DIR, '.env')
  ];
  const config = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || ''
  };

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            const key = match[1];
            let value = (match[2] || '').trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (key === 'SUPABASE_URL' && !config.url) config.url = value;
            if (key === 'SUPABASE_ANON_KEY' && !config.anonKey) config.anonKey = value;
          }
        });
      } catch (e) {}
    }
  }
  return config;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // CORS 및 캐시 제어 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, apikey, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // URL 디코딩 및 정규화
  let reqUrl = decodeURI(req.url.split('?')[0]);

  // API Config (깃허브 공유 시 보안을 위해 서버 측 .env에서만 주입)
  if (reqUrl === '/api/config') {
    const config = loadEnvConfig();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(config));
    return;
  }

  if (reqUrl === '/') {
    reqUrl = '/index.html';
  }

  const safePath = path.normalize(reqUrl).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(BASE_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 Fallback
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>404 Not Found</title></head>
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
          <h2>404 - 파일을 찾을 수 없습니다.</h2>
          <p>요청하신 파일(<code>${safePath}</code>)이 서버에 존재하지 않습니다.</p>
          <a href="/">메인 홈으로 이동</a>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  const localUrl = `http://localhost:${PORT}`;
  const networkIps = getNetworkIpList();

  console.log('\n' + '='.repeat(70));
  console.log('🌊 [Node.js] 낙동강 발전관리과 4조3교대 포털 웹서버 가동 완료');
  console.log(`💻 내 PC 접속 주소 : \x1b[32m\x1b[1m${localUrl}\x1b[0m`);
  
  if (networkIps.length > 0) {
    console.log(`📱 다른 사용자 공유 : \x1b[36m\x1b[1mhttp://${networkIps[0]}:${PORT}\x1b[0m (동일 와이파이/사내망)`);
    if (networkIps.length > 1) {
      for (let i = 1; i < networkIps.length; i++) {
        console.log(`                    \x1b[36mhttp://${networkIps[i]}:${PORT}\x1b[0m`);
      }
    }
  } else {
    console.log(`📱 다른 사용자 공유 : 사내 IP 주소를 확인하여 http://[PC_IP]:${PORT} 로 접속하세요.`);
  }

  console.log(`📂 파일 서빙 경로   : ${BASE_DIR}`);
  console.log('⚙️  운영 근무 체계   : 4조 3교대 순환 (휴무 X - 주간 D - 휴무 X - 야간 S)');
  console.log('🌐 외부 인터넷 공유 : npx localtunnel --port ' + PORT + ' (외부 링크 발급)');
  console.log('🛑 서버 종료 방법   : Ctrl + C');
  console.log('='.repeat(70) + '\n');

  // 자동 브라우저 오픈 (선택적)
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${start} ${localUrl}`, () => {});
});
