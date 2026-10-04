const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const candidates = [
    path.join(__dirname, '..', 'NakdongShift_v1.0.apk'),
    path.join(__dirname, '..', 'app-debug.apk'),
    path.join(__dirname, '..', 'download', 'NakdongShift_v1.0.apk'),
    path.join(__dirname, '..', 'download', 'app-debug.apk'),
    path.join(__dirname, '..', '..', 'NakdongShift_v1.0.apk'),
    path.join(__dirname, '..', '..', 'app-debug.apk'),
    path.join(__dirname, '..', '..', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
    path.join(__dirname, '..', '..', 'web', 'NakdongShift_v1.0.apk')
  ];

  let foundPath = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (foundPath) {
    const stat = fs.statSync(foundPath);
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="NakdongShift_v1.0.apk"',
      'Content-Length': stat.size
    });
    return fs.createReadStream(foundPath).pipe(res);
  } else {
    // 404 텍스트 대신 정적 파일 URL로 302 리다이렉트
    res.writeHead(302, {
      'Location': '/NakdongShift_v1.0.apk'
    });
    return res.end();
  }
};
