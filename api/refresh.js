const http = require("http");

const HOST = "203.237.1.41";
const PORT = 8085;

// 26개 수집 대상 계량기 목록
const METERS = [
  // 1. 대수력 (6개)
  { group: "대수력", name: "안동수력#1", code: "15304" },
  { group: "대수력", name: "임하수력#1", code: "15960" },
  { group: "대수력", name: "합천수력#1", code: "15310" },
  { group: "대수력", name: "합천수력#2", code: "15961" },
  { group: "대수력", name: "남강수력#1", code: "15670" },
  { group: "대수력", name: "남강수력#2", code: "16817" },

  // 2. 보수력 (8개)
  { group: "보수력", name: "상주보#1", code: "16721" },
  { group: "보수력", name: "낙단보#1", code: "16722" },
  { group: "보수력", name: "구미보", code: "16700" },
  { group: "보수력", name: "칠곡보#1", code: "16719" },
  { group: "보수력", name: "강정보#1", code: "16690" },
  { group: "보수력", name: "달성보#1", code: "16720" },
  { group: "보수력", name: "합천창녕보", code: "16712" },
  { group: "보수력", name: "창녕함안보", code: "16711" },

  // 3. 중소댐 (5개)
  { group: "중소댐", name: "군위댐소수력#1", code: "16626" },
  { group: "중소댐", name: "보현산소수력", code: "16757" },
  { group: "중소댐", name: "부항댐소수력#1", code: "16741" },
  { group: "중소댐", name: "영주댐소수력", code: "16787" },
  { group: "중소댐", name: "성덕소수력", code: "16758" },

  // 4. 조정지댐 (3개)
  { group: "조정지댐", name: "안동소수력#1", code: "15669" },
  { group: "조정지댐", name: "임하소수력#1", code: "15285" },
  { group: "조정지댐", name: "합천소수력#1", code: "15587" },

  // 5. 현장 (4개)
  { group: "현장", name: "밀양소수력#1", code: "16156" },
  { group: "현장", name: "고산정수장소수력#1", code: "16445" },
  { group: "현장", name: "안계소수력#1", code: "16737" },
  { group: "현장", name: "영천소수력#1", code: "15668" }
];

function getCredentials() {
  if (process.env.KWATER_ID && process.env.KWATER_PW) {
    return {
      id: process.env.KWATER_ID.trim(),
      pw: process.env.KWATER_PW.trim()
    };
  }
  return {
    id: Buffer.from("a3dhdGVycG93ZXI=", "base64").toString("utf8"),
    pw: Buffer.from("Z2lvc3Bvd2Vy", "base64").toString("utf8")
  };
}

function getKstStrings() {
  const now = new Date();
  const kst = new Date(now.getTime() + now.getTimezoneOffset() * 60000 + 9 * 3600000);
  const yyyy = kst.getFullYear();
  const mm = String(kst.getMonth() + 1).padStart(2, "0");
  const dd = String(kst.getDate()).padStart(2, "0");
  const hh = String(kst.getHours()).padStart(2, "0");
  const min = String(kst.getMinutes()).padStart(2, "0");
  const sec = String(kst.getSeconds()).padStart(2, "0");
  return {
    dateDash: `${yyyy}-${mm}-${dd}`,
    nowFormatted: `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`
  };
}

function login(id, pw) {
  return new Promise((resolve, reject) => {
    const body = `serviceCode=login&view=/loginResult.jsp&id=${encodeURIComponent(id)}&password=${encodeURIComponent(pw)}`;
    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: "/mtr/action.do",
      method: "POST",
      timeout: 8000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body)
      }
    }, res => {
      res.resume();
      const setCookie = res.headers["set-cookie"];
      if (!setCookie || !setCookie.length) {
        return reject(new Error("로그인 쿠키 발급 실패"));
      }
      resolve(setCookie[0].split(";")[0]);
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("로그인 타임아웃")));
    req.end(body);
  });
}

function fetchMeterHtml(cookie, code, dateDash) {
  return new Promise((resolve, reject) => {
    const body =
      `nodetype=EnergyMeter&nodecode=${code}` +
      `&serviceCode=retrieveListWeighingResult` +
      `&view=/metering/ajaxweighingresult/main.jsp` +
      `&prefix=master&master_dataType=result` +
      `&master_startDate=${dateDash}&master_endDate=${dateDash}` +
      `&master_dateTerm=5min&master_displayMode=data` +
      `&master_chCount=5&master_ch1=1&master_ch2=1` +
      `&master_result1=1&master_result2=1&master_unit=Wh`;

    const req = http.request({
      hostname: HOST,
      port: PORT,
      path: "/mtr/ajax.do",
      method: "POST",
      timeout: 8000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body),
        "Cookie": cookie
      }
    }, res => {
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        resolve(new TextDecoder("euc-kr").decode(Buffer.concat(chunks)));
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("조회 타임아웃")));
    req.end(body);
  });
}

function extractRows(html) {
  const re = /<td[^>]*>(\d{8})<\/td>\s*<td[^>]*><nobr>(\d{2}\s*:\s*\d{2})<\/nobr><\/td>\s*<td[^>]*>\s*<nobr>\s*([^\s<]+)\s*<\/nobr>\s*<\/td>\s*<td[^>]*><nobr>\s*([^\s<]+)\s*<\/nobr><\/td>\s*<td[^>]*><nobr>\s*([^\s<]+)\s*<\/nobr>/gs;
  const rows = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const rawWh = m[3].trim();
    const numericWh = rawWh === "-" || rawWh === "X" ? null : parseFloat(rawWh.replace(/,/g, ""));
    rows.push({
      date: m[1].trim(),
      time: m[2].replace(/\s+/g, ""),
      wh: Number.isNaN(numericWh) ? null : numericWh,
      flag: m[5].trim()
    });
  }
  return rows;
}

async function fetchAndParseMeter(cookie, meter, dateDash) {
  const html = await fetchMeterHtml(cookie, meter.code, dateDash);
  const rows = extractRows(html);

  if (rows.length === 0) {
    return {
      group: meter.group,
      name: meter.name,
      time: "-",
      whTimes12: null,
      flag: "실패(비정상)"
    };
  }

  const normalRows = rows.filter(r => r.flag === "정상" && r.wh !== null);
  const latestNormal = normalRows.length > 0 ? normalRows[normalRows.length - 1] : null;

  if (latestNormal) {
    return {
      group: meter.group,
      name: meter.name,
      time: latestNormal.time,
      whTimes12: latestNormal.wh * 12,
      flag: latestNormal.flag
    };
  }

  const lastRow = rows[rows.length - 1];
  return {
    group: meter.group,
    name: meter.name,
    time: lastRow ? lastRow.time : "-",
    whTimes12: lastRow && lastRow.wh !== null ? lastRow.wh * 12 : null,
    flag: lastRow ? lastRow.flag : "실패(비정상)"
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  try {
    const { id, pw } = getCredentials();
    const { dateDash, nowFormatted } = getKstStrings();
    const cookie = await login(id, pw);

    const results = [];
    const BATCH_SIZE = 13;
    for (let i = 0; i < METERS.length; i += BATCH_SIZE) {
      const batch = METERS.slice(i, i + BATCH_SIZE);
      const batchRes = await Promise.all(
        batch.map(async m => {
          try {
            return await fetchAndParseMeter(cookie, m, dateDash);
          } catch (_) {
            return {
              group: m.group,
              name: m.name,
              time: "-",
              whTimes12: null,
              flag: "실패(통신오류)"
            };
          }
        })
      );
      results.push(...batchRes);
    }

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({
      meta: { crawledAt: nowFormatted },
      results
    }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ error: err.message }));
  }
};
