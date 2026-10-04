const https = require('https');
const querystring = require('querystring');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', () => {
    let postData = '';
    if (req.method === 'POST') {
      postData = body;
    } else {
      // For GET requests, convert query params to form urlencoded
      const urlParts = req.url.split('?');
      if (urlParts.length > 1) {
        postData = urlParts[1];
      }
    }

    const parsed = querystring.parse(postData || '');
    if (!parsed.mode) parsed.mode = 'getHydr';
    if (!parsed.param1) parsed.param1 = 'M';
    postData = querystring.stringify(parsed);

    const options = {
      hostname: 'www.water.or.kr',
      port: 443,
      path: '/kor/realtime/sumun/ajaxProc.do',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.water.or.kr/kor/realtime/sumun/index.do?mode=sumun&menuId=13_91_93_94'
      },
      timeout: 8000
    };

    const proxyReq = https.request(options, proxyRes => {
      let responseData = '';
      proxyRes.on('data', chunk => {
        responseData += chunk;
      });
      proxyRes.on('end', () => {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(responseData);
      });
    });

    proxyReq.on('error', err => {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: true, message: err.message, list: [] }));
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      res.writeHead(504, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: true, message: 'Upstream water.or.kr timed out', list: [] }));
    });

    proxyReq.write(postData);
    proxyReq.end();
  });
};
