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
    path.join(__dirname, '..', 'app-debug.apk'),
    path.join(__dirname, '..', 'download', 'app-debug.apk'),
    path.join(__dirname, '..', '..', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
    path.join(__dirname, '..', '..', 'web', 'app-debug.apk')
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
    res.status(404).send('APK 파일을 찾을 수 없습니다.');
  }
};
