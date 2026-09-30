/**
 * ==============================================================================
 * 낙동강 발전관리과 4조3교대 포털 - 프론트엔드 핵심 로직 (app.js)
 * ==============================================================================
 * - 체계: 4조 3교대 순환 (휴무 X -> 주간 D -> 휴무 X -> 야간 S)
 * - 순수 브라우저 Native REST API 엔진 내장 (외부 CDN 의존도 제로, 네트워크 지연 방지)
 * - Supabase 실시간 연동 (스케줄, 대교직 승인/반려, 주간 업무메모, 게시판, 댓글)
 * - 오프라인/로컬 자동 폴백 및 원클릭 연결 진단/재시도 모달 탑재
 */

// 1. Supabase 접속 설정
// ⚠️ 깃허브 공개 시 보안을 위해 소스코드 내 하드코딩된 API 키를 완전히 제거했습니다.
// 로컬 서버 실행 시 .env 연동(/api/config) 또는 브라우저 로컬 저장소(localStorage)에서 안전하게 불러옵니다.
const DEFAULT_SUPABASE_CONFIG = {
  url: '',
  anonKey: ''
};

async function getActiveSupabaseConfig() {
  // 1. 브라우저 localStorage에 직접 저장된 설정 우선 확인
  try {
    const saved = localStorage.getItem('NAKDONG_SUPABASE_CONFIG');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {}

  // 2. 로컬 웹서버의 /api/config 엔드포인트에서 .env 파일 설정 읽기 (보안 권장)
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const serverCfg = await res.json();
      if (serverCfg.url && serverCfg.anonKey) {
        return serverCfg;
      }
    }
  } catch (e) {}

  return { ...DEFAULT_SUPABASE_CONFIG };
}

let SUPABASE_CONFIG = { url: '', anonKey: '' };

// ==============================================================================
// 2. 고신뢰성 Native Supabase REST API 클라이언트 (CDN 미로드 시에도 100% 작동)
// ==============================================================================
const SupabaseRest = {
  getHeaders() {
    return {
      'apikey': SUPABASE_CONFIG.anonKey,
      'Authorization': `Bearer ${SUPABASE_CONFIG.anonKey}`,
      'Content-Type': 'application/json; charset=utf-8'
    };
  },

  async ping() {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4초 타임아웃
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/users?select=count`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const pingMs = Math.round(performance.now() - startTime);
      if (res.ok) {
        return { ok: true, ping: pingMs, status: res.status };
      } else {
        const text = await res.text();
        return { ok: false, ping: pingMs, status: res.status, error: text };
      }
    } catch (err) {
      const pingMs = Math.round(performance.now() - startTime);
      return { ok: false, ping: pingMs, error: err.message };
    }
  },

  async select(table, query = '') {
    try {
      const url = `${SUPABASE_CONFIG.url}/rest/v1/${table}${query ? '?' + query : ''}`;
      const res = await fetch(url, { headers: this.getHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[SupabaseRest] select(${table}) 오류:`, err);
      return null;
    }
  },

  async insert(table, data) {
    try {
      const headers = { ...this.getHeaders(), 'Prefer': 'return=representation' };
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(Array.isArray(data) ? data : [data])
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[SupabaseRest] insert(${table}) 오류:`, err);
      return null;
    }
  },

  async upsert(table, data, onConflict) {
    try {
      const headers = { 
        ...this.getHeaders(), 
        'Prefer': 'resolution=merge-duplicates,return=representation' 
      };
      const query = onConflict ? `?on_conflict=${onConflict}` : '';
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}${query}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(Array.isArray(data) ? data : [data])
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[SupabaseRest] upsert(${table}) 오류:`, err);
      return null;
    }
  },

  async update(table, filterCol, filterVal, data) {
    try {
      const headers = { ...this.getHeaders(), 'Prefer': 'return=representation' };
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}?${filterCol}=eq.${filterVal}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`[SupabaseRest] update(${table}) 오류:`, err);
      return null;
    }
  },

  async delete(table, filterCol, filterVal) {
    try {
      const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/${table}?${filterCol}=eq.${filterVal}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      return res.ok;
    } catch (err) {
      console.warn(`[SupabaseRest] delete(${table}) 오류:`, err);
      return false;
    }
  }
};

// 3. 4조 3교대 조원 명단 (사번 및 직급)
const DEFAULT_USERS = [
  { id: 1, name: '장성훈(대리)', employee_id: '20221555', car_number: '12가 3456', team: 1, role: '대리', avatar_color_index: 0 },
  { id: 2, name: '김수영(대리)', employee_id: '20214702', car_number: '34나 5678', team: 1, role: '대리', avatar_color_index: 1 },
  { id: 3, name: '황석구(대리)', employee_id: '20140218', car_number: '56다 7890', team: 2, role: '대리', avatar_color_index: 2 },
  { id: 4, name: '박준기(대리)', employee_id: '20132035', car_number: '11라 9988', team: 2, role: '대리', avatar_color_index: 3 },
  { id: 5, name: '이채규(과장)', employee_id: '19893008', car_number: '78마 1234', team: 3, role: '과장', avatar_color_index: 4 },
  { id: 6, name: '전다솜(대리)', employee_id: '20224138', car_number: '22바 4433', team: 3, role: '대리', avatar_color_index: 5 },
  { id: 7, name: '박재환(대리)', employee_id: '20152433', car_number: '90사 5678', team: 4, role: '대리', avatar_color_index: 6 },
  { id: 8, name: '윤지원(대리)', employee_id: '20200638', car_number: '33아 1122', team: 4, role: '대리', avatar_color_index: 7 },
  { id: 99, name: '관리자(김선영)', employee_id: 'ADMIN01', car_number: '-', team: 0, role: '관리자', avatar_color_index: 8 },
  { id: 100, name: '관리자2(이상은)', employee_id: 'ADMIN02', car_number: '-', team: 0, role: '관리자', avatar_color_index: 9 }
];

// 4. 4조 3교대 순환 규칙 및 근무 상세
// 4일 순환 주기: X(휴무) -> D(주간) -> X(휴무) -> S(야간)
const CYCLE_PATTERN = ['X', 'D', 'X', 'S'];

const SHIFT_TYPES = {
  D: { name: '주간 (D)', short: 'D', hours: 8.0, timeRange: '09:00 ~ 18:00', restTime: '12:00 ~ 13:00' },
  S: { name: '야간 (S)', short: 'S', hours: 13.5, timeRange: '18:00 ~ 익일 09:00', restTime: '23:30 ~ 01:30' },
  X: { name: '휴무 (X)', short: 'X', hours: 0.0, timeRange: '전일 휴무', restTime: '-' },
  DS: { name: '주야연속 (DS)', short: 'DS', hours: 21.5, timeRange: '09:00 ~ 익일 09:00', restTime: '휴게 3.5h' },
  H: { name: '연차/휴가 (H)', short: 'H', hours: 8.0, timeRange: '유급 휴무', restTime: '-' }
};

const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#475569', '#2563eb', '#16a34a'
];

// ==============================================================================
// 5. 전역 애플리케이션 상태 (State)
// ==============================================================================
let currentUser = DEFAULT_USERS[0];
let isConnectedToSupabase = false;

let currentDate = new Date(2026, 9, 1);       // 2026년 10월 기본
let selectedDate = new Date(2026, 9, 1);
let teamSelectedDate = new Date(2026, 9, 1);
let weeklySelectedDate = new Date(2026, 9, 1);

let usersList = [...DEFAULT_USERS];
let schedulesCache = {};      // key: `${userId}_${dateString}` -> schedule object
let requestsList = [];
let adminNotesCache = {};     // key: dateString -> content
let postsList = [];
let currentPostDetail = null;

let currentTeamFilter = 'ALL';
let currentReqFilter = 'ALL';
let currentBoardCategory = 'ALL';
let isAntigravityActive = false;

// ==============================================================================
// 6. 4조 3교대 근무 자동 연산 엔진
// ==============================================================================
function calculateShiftForDate(team, dateObj) {
  if (!team || team <= 0 || team > 4) return 'X';

  const d1 = new Date(2026, 7, 1); // 2026-08-01 (기점)
  const d2 = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  const daysDiff = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

  // 팀별 오프셋: 1조:0, 2조:1, 3조:2, 4조:3
  const offset = team - 1;
  const cycleIndex = ((daysDiff + offset) % 4 + 4) % 4;
  return CYCLE_PATTERN[cycleIndex];
}

function getSchedule(userId, dateStr) {
  const user = usersList.find(u => u.id === userId);
  const cacheKey = `${userId}_${dateStr}`;
  
  // 1. Supabase 캐시
  if (schedulesCache[cacheKey]) {
    return schedulesCache[cacheKey];
  }

  // 2. 기본 4조3교대 자동 연산
  const parts = dateStr.split('-');
  const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const baseShift = user ? calculateShiftForDate(user.team, dateObj) : 'X';

  // 3. 승인된 대교직 신청 검사
  let shiftType = baseShift;
  let note = '';

  const approvedReqs = requestsList.filter(r => r.status === 'APPROVED');
  for (const req of approvedReqs) {
    if (req.type === 'SUBSTITUTE') {
      if (req.requester_id === userId && req.request_date === dateStr) {
        shiftType = 'X';
        note = '대직 요청 (휴무)';
      } else if (req.target_user_id === userId && req.request_date === dateStr) {
        shiftType = 'DS';
        note = '대직 근무';
      }
    } else if (req.type === 'EXCHANGE') {
      if (req.requester_id === userId && req.request_date === dateStr) {
        shiftType = 'X';
        note = '교직 교환';
      } else if (req.target_user_id === userId && req.request_date === dateStr) {
        shiftType = 'D';
        note = '교직 근무';
      }
    }
  }

  const generated = {
    user_id: userId,
    date_string: dateStr,
    shift_type: shiftType,
    original_shift_type: baseShift,
    note: note
  };

  schedulesCache[cacheKey] = generated;
  return generated;
}

// ==============================================================================
// 7. 앱 시작 및 초기화 (DOM Ready 무관 완벽 방어)
// ==============================================================================
function startApp() {
  initUserSelector();
  initNavigation();
  initCalendarControls();
  initTeamScheduleControls();
  initRequestsScreen();
  initWeeklyNotesControls();
  initBoardScreen();
  initAntigravity();
  initSupabaseSettingsModal();

  // 1. 화면 즉시 렌더링 (지연 없이 즉시 4조3교대 근무표 표시)
  renderMyCalendar();
  renderTeamSchedule();
  renderWeeklyDashboard();

  // 2. Supabase 연결 점검 및 데이터 로드 (비동기)
  checkAndSyncSupabase();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

// ==============================================================================
// 8. Supabase 연결 진단 및 실시간 동기화
// ==============================================================================
async function checkAndSyncSupabase() {
  const statusEl = document.getElementById('supabaseStatus');
  const statusText = document.getElementById('supabaseStatusText');

  statusEl.className = 'status-badge connecting';
  statusText.textContent = 'Supabase 연결 확인 중...';

  // 0. 설정 확인 (비어있으면 로컬스토리지 또는 /api/config에서 읽기)
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    SUPABASE_CONFIG = await getActiveSupabaseConfig();
  }

  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
    isConnectedToSupabase = false;
    statusEl.className = 'status-badge connecting';
    statusText.textContent = 'API 키 입력 필요';
    updateModalDiagnostics({ 
      ok: false, 
      ping: 0, 
      error: 'Supabase URL 또는 Anon Key가 설정되지 않았습니다. 상단 기어(설정) 아이콘을 눌러 입력하세요.' 
    });
    return;
  }

  // 1. 실제 Ping 테스트
  const pingResult = await SupabaseRest.ping();

  if (pingResult.ok) {
    isConnectedToSupabase = true;
    statusEl.className = 'status-badge connected';
    statusText.textContent = `Supabase 연결됨 (${pingResult.ping}ms)`;
    showToast(`✅ Supabase DB에 정상 연결되었습니다. (${pingResult.ping}ms)`);

    // 2. 원격 데이터 백그라운드 로드
    await loadRemoteData();
  } else {
    isConnectedToSupabase = false;
    statusEl.className = 'status-badge error';
    statusText.textContent = '로컬 모드 (오프라인)';
    console.warn('[Supabase] 연결 실패, 로컬 4조3교대 엔진 가동:', pingResult.error);
    showToast('⚠️ Supabase 연결 실패. 로컬 4조3교대 엔진으로 동작합니다.');
  }

  updateModalDiagnostics(pingResult);
}

async function loadRemoteData() {
  try {
    // 1. 사용자 목록
    const users = await SupabaseRest.select('users', 'order=id.asc');
    if (users && users.length > 0) {
      usersList = users;
      initUserSelector();
    }

    // 2. 스케줄 오버레이
    const schedules = await SupabaseRest.select('shift_schedules');
    if (schedules) {
      schedules.forEach(s => {
        schedulesCache[`${s.user_id}_${s.date_string}`] = s;
      });
    }

    // 3. 대교직 신청
    const requests = await SupabaseRest.select('shift_requests', 'order=created_at.desc');
    if (requests) {
      requestsList = requests;
    }

    // 4. 주간 업무 메모
    const notes = await SupabaseRest.select('admin_weekly_notes');
    if (notes) {
      notes.forEach(n => {
        adminNotesCache[n.date_string] = n.content;
      });
    }

    // 5. 게시글
    const posts = await SupabaseRest.select('posts', 'order=created_at.desc');
    if (posts) {
      postsList = posts;
    }

    // 화면 갱신
    renderMyCalendar();
    renderTeamSchedule();
    renderRequestsList();
    renderWeeklyDashboard();
    renderPostsList();
  } catch (e) {
    console.warn('원격 데이터 동기화 예외:', e);
  }
}

// ==============================================================================
// 9. Supabase 연결 진단 모달 및 커스텀 설정
// ==============================================================================
function initSupabaseSettingsModal() {
  const statusBadge = document.getElementById('supabaseStatus');
  if (statusBadge) {
    statusBadge.addEventListener('click', () => {
      openModal('supabaseSettingsModal');
      document.getElementById('cfgSupabaseUrl').value = SUPABASE_CONFIG.url;
      document.getElementById('cfgSupabaseKey').value = SUPABASE_CONFIG.anonKey;
    });
  }

  // 다시 테스트 버튼
  document.getElementById('btnTestSupabase').addEventListener('click', async () => {
    const btn = document.getElementById('btnTestSupabase');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 테스트 중...';
    await checkAndSyncSupabase();
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> 다시 연결 테스트';
  });

  // 설정 저장 버튼
  document.getElementById('btnSaveSupabaseConfig').addEventListener('click', async () => {
    const url = document.getElementById('cfgSupabaseUrl').value.trim();
    const key = document.getElementById('cfgSupabaseKey').value.trim();

    if (!url || !key) {
      alert('Supabase URL과 Anon Key를 모두 입력해주세요.');
      return;
    }

    SUPABASE_CONFIG = { url, anonKey: key };
    try {
      localStorage.setItem('NAKDONG_SUPABASE_CONFIG', JSON.stringify(SUPABASE_CONFIG));
    } catch (e) {}

    closeModal('supabaseSettingsModal');
    showToast('Supabase 설정이 저장되었습니다. 재연결을 시도합니다.');
    await checkAndSyncSupabase();
  });
}

function updateModalDiagnostics(result) {
  const badge = document.getElementById('modalSupabaseBadge');
  const pingEl = document.getElementById('modalSupabasePing');
  const msgEl = document.getElementById('modalSupabaseMsg');

  if (!badge) return;

  if (result.ok) {
    badge.className = 'status-badge connected';
    badge.textContent = '정상 연결됨';
    pingEl.textContent = `${result.ping} ms`;
    msgEl.innerHTML = '<span style="color:#059669; font-weight:700;">REST API 통신이 원활합니다. 실시간 동기화가 활성화되었습니다.</span>';
  } else {
    badge.className = 'status-badge error';
    badge.textContent = '연결 실패 / 오프라인';
    pingEl.textContent = '-';
    msgEl.innerHTML = `<span style="color:#dc2626; font-weight:700;">연결 에러:</span> ${result.error || '네트워크 응답 없음'}<br><small style="color:var(--text-muted);">* 프로젝트 URL과 Anon Key가 정확한지 확인하세요.</small>`;
  }
}

// ==============================================================================
// 10. 조원 선택 및 네비게이션
// ==============================================================================
function initUserSelector() {
  const select = document.getElementById('currentUserSelect');
  select.innerHTML = usersList.map(u => {
    const teamText = u.team > 0 ? `${u.team}조` : '관리';
    return `<option value="${u.id}">${teamText} ${u.name}</option>`;
  }).join('');

  select.value = currentUser.id;
  select.addEventListener('change', (e) => {
    const uid = parseInt(e.target.value, 10);
    currentUser = usersList.find(u => u.id === uid) || usersList[0];
    showToast(`작업자가 '${currentUser.name}'(으)로 전환되었습니다.`);
    renderMyCalendar();
    renderTeamSchedule();
    renderRequestsList();
  });
}

function initNavigation() {
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(`tab-${tab.dataset.tab}`);
      if (targetPane) targetPane.classList.add('active');

      if (tab.dataset.tab === 'myCalendar') renderMyCalendar();
      if (tab.dataset.tab === 'teamSchedule') renderTeamSchedule();
      if (tab.dataset.tab === 'shiftRequests') renderRequestsList();
      if (tab.dataset.tab === 'adminWeekly') renderWeeklyDashboard();
      if (tab.dataset.tab === 'bulletinBoard') renderPostsList();
    });
  });
}

// ==============================================================================
// 11. [메뉴 1] 개인 캘린더 (My Calendar)
// ==============================================================================
function initCalendarControls() {
  document.getElementById('prevMonthBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderMyCalendar();
  });
  document.getElementById('nextMonthBtn').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderMyCalendar();
  });
  document.getElementById('todayBtn').addEventListener('click', () => {
    currentDate = new Date();
    selectedDate = new Date();
    renderMyCalendar();
  });
}

function renderMyCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  document.getElementById('currentMonthTitle').textContent = `${year}년 ${month + 1}월`;

  const grid = document.getElementById('myCalendarGrid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)
  const totalDays = lastDay.getDate();

  let dayCount = 0;
  let nightCount = 0;
  let offCount = 0;
  let totalHours = 0;

  // 이전 달 채우기
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const pDate = new Date(year, month - 1, prevMonthLastDay - i);
    grid.appendChild(createCalendarCell(pDate, true));
  }

  // 당월 채우기
  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(selectedDate);

  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDate(dateObj);
    const cell = createCalendarCell(dateObj, false);

    const sched = getSchedule(currentUser.id, dateStr);
    const st = sched.shift_type;

    if (st.includes('D') && !st.includes('DS')) dayCount++;
    if (st.includes('S') && !st.includes('DS')) nightCount++;
    if (st.includes('DS')) { dayCount++; nightCount++; }
    if (st === 'X') offCount++;

    const info = SHIFT_TYPES[st] || SHIFT_TYPES.X;
    totalHours += info.hours || 0;

    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedStr) cell.classList.add('selected');

    grid.appendChild(cell);
  }

  // 다음 달 채우기
  const remainingCells = (7 - ((startDayOfWeek + totalDays) % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nDate = new Date(year, month + 1, i);
    grid.appendChild(createCalendarCell(nDate, true));
  }

  document.getElementById('statDayCount').textContent = dayCount;
  document.getElementById('statNightCount').textContent = nightCount;
  document.getElementById('statOffCount').textContent = offCount;
  document.getElementById('statTotalHours').textContent = totalHours.toFixed(1);

  updateSelectedDateDetail(selectedDate);
}

function createCalendarCell(dateObj, isOtherMonth) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell ${isOtherMonth ? 'other-month' : ''}`;
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');

  const dateStr = formatDate(dateObj);
  const sched = getSchedule(currentUser.id, dateStr);
  const shiftType = sched.shift_type;
  const note = sched.note || '';

  cell.innerHTML = `
    <div class="day-header">
      <span class="day-number">${dateObj.getDate()}</span>
      ${isOtherMonth ? `<span style="font-size:0.65rem; color:#94a3b8;">${dateObj.getMonth()+1}월</span>` : ''}
    </div>
    <div class="shift-tag-box">
      <span class="shift-tag ${shiftType}">${shiftType}</span>
      ${note ? `<div class="cell-note">${note}</div>` : ''}
    </div>
  `;

  cell.addEventListener('click', () => {
    selectedDate = dateObj;
    document.querySelectorAll('#myCalendarGrid .calendar-cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
    updateSelectedDateDetail(dateObj);
  });

  return cell;
}

function updateSelectedDateDetail(dateObj) {
  const dateStr = formatDate(dateObj);
  const sched = getSchedule(currentUser.id, dateStr);
  const shift = sched.shift_type;
  const info = SHIFT_TYPES[shift] || SHIFT_TYPES.X;

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const teamText = currentUser.team > 0 ? `${currentUser.team}조` : '관리';
  document.getElementById('selectedDateText').innerHTML = 
    `<i class="fa-regular fa-clock"></i> ${dateStr} (${dayNames[dateObj.getDay()]}) ${teamText} ${currentUser.name} 근무 상세`;

  const badge = document.getElementById('selectedShiftBadge');
  badge.textContent = info.name;
  badge.className = `shift-tag ${shift}`;

  document.getElementById('selectedTimeRange').textContent = info.timeRange;
  document.getElementById('selectedRestTime').textContent = info.restTime;
  document.getElementById('selectedNote').textContent = sched.note || '특이사항 없음 (4조3교대 정상 순환)';
}

// ==============================================================================
// 12. [메뉴 2] 팀 일정표 (Team Schedule)
// ==============================================================================
function initTeamScheduleControls() {
  document.getElementById('teamPrevMonthBtn').addEventListener('click', () => {
    teamSelectedDate.setMonth(teamSelectedDate.getMonth() - 1);
    renderTeamSchedule();
  });
  document.getElementById('teamNextMonthBtn').addEventListener('click', () => {
    teamSelectedDate.setMonth(teamSelectedDate.getMonth() + 1);
    renderTeamSchedule();
  });
  document.getElementById('teamTodayBtn').addEventListener('click', () => {
    teamSelectedDate = new Date();
    renderTeamSchedule();
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentTeamFilter = chip.dataset.filter;
      renderWorkerRoster(teamSelectedDate);
    });
  });
}

function renderTeamSchedule() {
  const year = teamSelectedDate.getFullYear();
  const month = teamSelectedDate.getMonth();

  document.getElementById('teamMonthTitle').textContent = `${year}년 ${month + 1}월 (팀 전체)`;

  const grid = document.getElementById('teamCalendarGrid');
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();

  // 1. 이전 달 1주분
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  const prevDaysCount = startDayOfWeek === 0 ? 7 : startDayOfWeek;
  for (let i = prevDaysCount - 1; i >= 0; i--) {
    const pDate = new Date(year, month - 1, prevMonthLastDate - i);
    grid.appendChild(createTeamCalendarCell(pDate, true));
  }

  // 2. 당월
  const todayStr = formatDate(new Date());
  const selectedStr = formatDate(teamSelectedDate);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const cDate = new Date(year, month, d);
    const dateStr = formatDate(cDate);
    const cell = createTeamCalendarCell(cDate, false);

    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === selectedStr) cell.classList.add('selected');
    grid.appendChild(cell);
  }

  // 3. 다음 달 1주분
  const currentTotal = prevDaysCount + lastDay.getDate();
  const nextDaysCount = Math.max(7, (7 - (currentTotal % 7)) % 7 + 7);
  for (let d = 1; d <= nextDaysCount; d++) {
    const nDate = new Date(year, month + 1, d);
    grid.appendChild(createTeamCalendarCell(nDate, true));
  }

  renderWorkerRoster(teamSelectedDate);
}

function createTeamCalendarCell(dateObj, isOtherMonth) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell ${isOtherMonth ? 'other-month' : ''}`;
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');

  const dateStr = formatDate(dateObj);

  let dayW = 0, nightW = 0;
  usersList.filter(u => u.team > 0).forEach(u => {
    const sched = getSchedule(u.id, dateStr);
    if (sched.shift_type.includes('D')) dayW++;
    if (sched.shift_type.includes('S')) nightW++;
  });

  cell.innerHTML = `
    <div class="day-header">
      <span class="day-number">${dateObj.getDate()}</span>
      ${isOtherMonth ? `<span style="font-size:0.65rem; color:#94a3b8;">${dateObj.getMonth()+1}월</span>` : ''}
    </div>
    <div style="font-size: 0.725rem; margin-top: 0.25rem; display: flex; flex-direction: column; gap: 2px;">
      <span style="color:var(--shift-day); font-weight:700;">주간 ${dayW}명</span>
      <span style="color:var(--shift-night); font-weight:700;">야간 ${nightW}명</span>
    </div>
  `;

  cell.addEventListener('click', () => {
    teamSelectedDate = dateObj;
    document.querySelectorAll('#teamCalendarGrid .calendar-cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
    renderWorkerRoster(dateObj);
  });

  return cell;
}

function renderWorkerRoster(dateObj) {
  const dateStr = formatDate(dateObj);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  document.getElementById('rosterDateTitle').innerHTML = 
    `<i class="fa-solid fa-user-group"></i> ${dateStr} (${dayNames[dateObj.getDay()]}) 근무 편성`;

  const dayList = document.getElementById('dayWorkerList');
  const nightList = document.getElementById('nightWorkerList');
  const offList = document.getElementById('offWorkerList');

  dayList.innerHTML = '';
  nightList.innerHTML = '';
  offList.innerHTML = '';

  const approvedReqs = requestsList.filter(r => r.status === 'APPROVED');

  usersList.filter(u => u.team > 0).forEach(user => {
    const sched = getSchedule(user.id, dateStr);
    const shift = sched.shift_type;
    const note = sched.note || '';

    const isSubstitute = note.includes('대직') || approvedReqs.some(r => 
      r.type === 'SUBSTITUTE' && (r.target_user_id === user.id && r.request_date === dateStr)
    );
    const isExchange = note.includes('교직') || approvedReqs.some(r => 
      r.type === 'EXCHANGE' && ((r.requester_id === user.id && r.target_date === dateStr) || (r.target_user_id === user.id && r.request_date === dateStr))
    );

    if (currentTeamFilter === 'DAY' && !shift.includes('D')) return;
    if (currentTeamFilter === 'NIGHT' && !shift.includes('S')) return;
    if (currentTeamFilter === 'OFF' && shift !== 'X') return;

    const card = document.createElement('div');
    card.className = `worker-item-card ${user.id === currentUser.id ? 'is-current' : ''}`;
    const avatarBg = AVATAR_COLORS[user.avatar_color_index % AVATAR_COLORS.length];

    card.innerHTML = `
      <div class="worker-info">
        <div class="worker-avatar" style="background-color: ${avatarBg};">
          ${user.name.charAt(0)}
        </div>
        <div class="worker-name-group">
          <span class="worker-name">
            ${user.name}
            ${user.id === currentUser.id ? '<span style="font-size:0.7rem; color:var(--primary); font-weight:700;">(본인)</span>' : ''}
          </span>
          <span class="worker-role-team">${user.team}조 &bull; 사번 ${user.employee_id} &bull; ${user.car_number}</span>
        </div>
      </div>
      <div class="worker-badges">
        <span class="shift-tag ${shift}">${shift}</span>
        ${isSubstitute ? `
          <span class="role-badge substitute">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> 대직자
          </span>` : ''}
        ${isExchange ? `
          <span class="role-badge exchange">
            <i class="fa-solid fa-arrows-rotate"></i> 교직자
          </span>` : ''}
      </div>
    `;

    if (shift.includes('D') && !shift.includes('DS')) {
      dayList.appendChild(card);
    } else if (shift.includes('S') && !shift.includes('DS')) {
      nightList.appendChild(card);
    } else if (shift.includes('DS')) {
      dayList.appendChild(card.cloneNode(true));
      nightList.appendChild(card);
    } else {
      offList.appendChild(card);
    }
  });

  if (!dayList.hasChildNodes()) dayList.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">편성된 주간 근무자가 없습니다.</div>`;
  if (!nightList.hasChildNodes()) nightList.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">편성된 야간 근무자가 없습니다.</div>`;
  if (!offList.hasChildNodes()) offList.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem;">비번자가 없습니다.</div>`;
}

// ==============================================================================
// 13. [메뉴 3] 대교직 신청 및 승인 관리 (Shift Requests)
// ==============================================================================
function initRequestsScreen() {
  document.getElementById('openNewRequestBtn').addEventListener('click', () => {
    openModal('newRequestModal');
    document.getElementById('reqDate').value = formatDate(new Date());
    document.getElementById('targetDate').value = formatDate(new Date());

    const targetSelect = document.getElementById('targetUser');
    targetSelect.innerHTML = usersList
      .filter(u => u.id !== currentUser.id && u.team > 0)
      .map(u => `<option value="${u.id}">${u.team}조 ${u.name}</option>`)
      .join('');
  });

  document.querySelectorAll('input[name="reqType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const targetDateGroup = document.getElementById('targetDateGroup');
      const targetUserGroup = document.getElementById('targetUserGroup');
      if (e.target.value === 'VACATION') {
        targetDateGroup.style.display = 'none';
        targetUserGroup.style.display = 'none';
      } else if (e.target.value === 'SUBSTITUTE') {
        targetDateGroup.style.display = 'none';
        targetUserGroup.style.display = 'block';
      } else {
        targetDateGroup.style.display = 'block';
        targetUserGroup.style.display = 'block';
      }
    });
  });

  document.getElementById('newRequestForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = document.querySelector('input[name="reqType"]:checked').value;
    const reqDate = document.getElementById('reqDate').value;
    const targetDate = document.getElementById('targetDate').value;
    const targetUserId = parseInt(document.getElementById('targetUser').value, 10);
    const reason = document.getElementById('reqReason').value;

    const newReq = {
      type,
      requester_id: currentUser.id,
      target_user_id: targetUserId || currentUser.id,
      request_date: reqDate,
      target_date: type === 'EXCHANGE' ? targetDate : '',
      status: 'PENDING',
      reason,
      created_at: Date.now()
    };

    if (isConnectedToSupabase) {
      const res = await SupabaseRest.insert('shift_requests', newReq);
      if (res && res.length > 0) {
        requestsList.unshift(res[0]);
      } else {
        requestsList.unshift({ id: Date.now(), ...newReq });
      }
    } else {
      requestsList.unshift({ id: Date.now(), ...newReq });
    }

    closeModal('newRequestModal');
    showToast('대교직 신청서가 제출되었습니다.');
    renderRequestsList();
  });

  document.querySelectorAll('.req-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.req-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReqFilter = btn.dataset.reqFilter;
      renderRequestsList();
    });
  });
}

function renderRequestsList() {
  const container = document.getElementById('requestsList');
  container.innerHTML = '';

  const pending = requestsList.filter(r => r.status === 'PENDING').length;
  const approved = requestsList.filter(r => r.status === 'APPROVED').length;
  const rejected = requestsList.filter(r => r.status === 'REJECTED').length;

  document.getElementById('countReqAll').textContent = requestsList.length;
  document.getElementById('countReqPending').textContent = pending;
  document.getElementById('countReqApproved').textContent = approved;
  document.getElementById('countReqRejected').textContent = rejected;

  const navBadge = document.getElementById('pendingRequestBadge');
  if (pending > 0) {
    navBadge.style.display = 'inline-block';
    navBadge.textContent = pending;
  } else {
    navBadge.style.display = 'none';
  }

  const filtered = requestsList.filter(r => {
    if (currentReqFilter === 'ALL') return true;
    return r.status === currentReqFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">해당 조건의 신청 내역이 없습니다.</div>`;
    return;
  }

  filtered.forEach(req => {
    const requester = usersList.find(u => u.id === req.requester_id) || { name: '알 수 없음', team: 1 };
    const targetUser = usersList.find(u => u.id === req.target_user_id) || { name: '알 수 없음', team: 1 };

    const typeLabel = req.type === 'SUBSTITUTE' ? '대직 신청' : (req.type === 'EXCHANGE' ? '교직 맞교환' : '연차 신청');
    const statusLabel = req.status === 'PENDING' ? '대기중' : (req.status === 'APPROVED' ? '승인완료' : '반려됨');

    const card = document.createElement('div');
    card.className = 'request-card';
    card.innerHTML = `
      <div>
        <div class="req-card-header">
          <span class="category-chip ${req.type === 'SUBSTITUTE' ? 'sub' : ''}">${typeLabel}</span>
          <span class="req-status-pill ${req.status}">${statusLabel}</span>
        </div>
        <div class="req-users-flow" style="margin-top: 0.65rem;">
          <div>${requester.name} (${requester.team}조)</div>
          <i class="fa-solid fa-arrow-right" style="color:var(--primary); font-size:0.8rem;"></i>
          <div>${targetUser.name} (${targetUser.team}조)</div>
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.6rem;">
          <div><strong>근무 일자:</strong> ${req.request_date} ${req.target_date ? ` &harr; ${req.target_date}` : ''}</div>
          ${req.reason ? `<div><strong>사유:</strong> ${req.reason}</div>` : ''}
        </div>
      </div>
      ${req.status === 'PENDING' ? `
        <div class="req-actions">
          <button class="btn-pill btn-success flex-1" onclick="handleApproveRequest(${req.id})">
            <i class="fa-solid fa-check"></i> 승인
          </button>
          <button class="btn-pill btn-danger flex-1" onclick="handleRejectRequest(${req.id})">
            <i class="fa-solid fa-xmark"></i> 반려
          </button>
        </div>` : ''}
    `;

    container.appendChild(card);
  });
}

window.handleApproveRequest = async function(reqId) {
  const req = requestsList.find(r => r.id === reqId);
  if (!req) return;

  req.status = 'APPROVED';

  const reqKey = `${req.requester_id}_${req.request_date}`;
  const targetKey = `${req.target_user_id}_${req.request_date}`;
  delete schedulesCache[reqKey];
  delete schedulesCache[targetKey];

  if (isConnectedToSupabase) {
    await SupabaseRest.update('shift_requests', 'id', reqId, { status: 'APPROVED' });
  }

  showToast('신청이 승인되어 4조3교대 근무일정표에 반영되었습니다.');
  renderRequestsList();
  renderMyCalendar();
  renderTeamSchedule();
};

window.handleRejectRequest = async function(reqId) {
  const req = requestsList.find(r => r.id === reqId);
  if (!req) return;

  req.status = 'REJECTED';
  if (isConnectedToSupabase) {
    await SupabaseRest.update('shift_requests', 'id', reqId, { status: 'REJECTED' });
  }

  showToast('신청이 반려 처리되었습니다.');
  renderRequestsList();
};

// ==============================================================================
// 14. [메뉴 4] 업무 메모 / 주간 대시보드 (Admin Weekly Notes)
// ==============================================================================
function initWeeklyNotesControls() {
  document.getElementById('prevWeekBtn').addEventListener('click', () => {
    weeklySelectedDate.setDate(weeklySelectedDate.getDate() - 7);
    renderWeeklyDashboard();
  });
  document.getElementById('nextWeekBtn').addEventListener('click', () => {
    weeklySelectedDate.setDate(weeklySelectedDate.getDate() + 7);
    renderWeeklyDashboard();
  });
  document.getElementById('currentWeekTodayBtn').addEventListener('click', () => {
    weeklySelectedDate = new Date();
    renderWeeklyDashboard();
  });
}

function renderWeeklyDashboard() {
  const container = document.getElementById('weeklyCardsContainer');
  container.innerHTML = '';

  const curr = new Date(weeklySelectedDate);
  const day = curr.getDay();
  const diff = curr.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(curr.setDate(diff));

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  document.getElementById('currentWeekTitle').textContent = 
    `${formatDate(monday)} ~ ${formatDate(sunday)} 주간 업무 일정`;

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
  const todayStr = formatDate(new Date());

  for (let i = 0; i < 7; i++) {
    const cardDate = new Date(monday);
    cardDate.setDate(monday.getDate() + i);
    const dateStr = formatDate(cardDate);
    const isToday = dateStr === todayStr;

    let dayWorkers = [];
    let nightWorkers = [];
    usersList.filter(u => u.team > 0).forEach(u => {
      const sched = getSchedule(u.id, dateStr);
      if (sched.shift_type.includes('D')) dayWorkers.push(u.name);
      if (sched.shift_type.includes('S')) nightWorkers.push(u.name);
    });

    const memoContent = adminNotesCache[dateStr] || '';

    const card = document.createElement('div');
    card.className = 'weekly-day-card';
    card.innerHTML = `
      <div class="weekly-day-header ${isToday ? 'today' : ''}">
        <span>${dateStr} (${dayNames[i]}요일)</span>
        ${isToday ? '<span class="badge" style="background:var(--primary); color:#fff; font-size:0.7rem; padding:0.15rem 0.4rem; border-radius:4px;">오늘</span>' : ''}
      </div>
      <div style="padding: 0.85rem; display: flex; flex-direction: column; gap: 0.65rem;">
        <div style="font-size:0.8rem; background:#f8fafc; padding:0.5rem; border-radius:6px; border:1px solid var(--border-color);">
          <div><strong style="color:var(--shift-day);">주간 (D):</strong> ${dayWorkers.join(', ') || '없음'}</div>
          <div><strong style="color:var(--shift-night);">야간 (S):</strong> ${nightWorkers.join(', ') || '없음'}</div>
        </div>

        <div>
          <label style="font-size:0.8rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.25rem; display:block;">
            <i class="fa-regular fa-note-sticky"></i> 업무 인수인계 및 특이사항
          </label>
          <textarea id="memo_${dateStr}" class="memo-textarea" placeholder="발전기 점검, 수로 수위, 안전 점검 등 메모 입력...">${memoContent}</textarea>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.35rem;">
          <button class="btn-pill btn-secondary" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="handleDeleteMemo('${dateStr}')">
            <i class="fa-solid fa-trash-can"></i> 삭제
          </button>
          <button class="btn-pill btn-primary" style="padding:0.3rem 0.75rem; font-size:0.75rem;" onclick="handleSaveMemo('${dateStr}')">
            <i class="fa-solid fa-floppy-disk"></i> 저장
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  }
}

window.handleSaveMemo = async function(dateStr) {
  const textarea = document.getElementById(`memo_${dateStr}`);
  const content = textarea.value.trim();

  adminNotesCache[dateStr] = content;

  if (isConnectedToSupabase) {
    await SupabaseRest.upsert('admin_weekly_notes', {
      date_string: dateStr,
      content,
      updated_at: Date.now()
    }, 'date_string');
  }

  showToast(`${dateStr} 업무 메모가 저장되었습니다.`);
};

window.handleDeleteMemo = async function(dateStr) {
  if (!confirm(`${dateStr} 메모를 삭제하시겠습니까?`)) return;

  delete adminNotesCache[dateStr];
  const textarea = document.getElementById(`memo_${dateStr}`);
  if (textarea) textarea.value = '';

  if (isConnectedToSupabase) {
    await SupabaseRest.delete('admin_weekly_notes', 'date_string', dateStr);
  }

  showToast('메모가 삭제되었습니다.');
};

// ==============================================================================
// 15. [메뉴 5] 소통 게시판 (Bulletin Board)
// ==============================================================================
function initBoardScreen() {
  document.getElementById('openNewPostBtn').addEventListener('click', () => {
    openModal('newPostModal');
  });

  document.getElementById('newPostForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('postCategory').value;
    const isNotice = document.getElementById('postIsNotice').checked;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;

    const newPost = {
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_team: currentUser.team,
      author_role: currentUser.role,
      author_avatar_index: currentUser.avatar_color_index,
      title,
      content,
      category,
      is_notice: isNotice,
      comment_count: 0,
      created_at: Date.now()
    };

    if (isConnectedToSupabase) {
      const res = await SupabaseRest.insert('posts', newPost);
      if (res && res.length > 0) {
        postsList.unshift(res[0]);
      } else {
        postsList.unshift({ id: Date.now(), ...newPost });
      }
    } else {
      postsList.unshift({ id: Date.now(), ...newPost });
    }

    closeModal('newPostModal');
    document.getElementById('newPostForm').reset();
    showToast('새 게시글이 등록되었습니다.');
    renderPostsList();
  });

  document.querySelectorAll('.board-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.board-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBoardCategory = btn.dataset.category;
      renderPostsList();
    });
  });

  document.getElementById('postSearchInput').addEventListener('input', () => {
    renderPostsList();
  });

  document.getElementById('newCommentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPostDetail) return;

    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    if (!content) return;

    const newComment = {
      post_id: currentPostDetail.id,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_team: currentUser.team,
      author_role: currentUser.role,
      author_avatar_index: currentUser.avatar_color_index,
      content,
      created_at: Date.now()
    };

    if (isConnectedToSupabase) {
      await SupabaseRest.insert('comments', newComment);
      await SupabaseRest.update('posts', 'id', currentPostDetail.id, { 
        comment_count: (currentPostDetail.comment_count || 0) + 1 
      });
    }

    currentPostDetail.comment_count = (currentPostDetail.comment_count || 0) + 1;
    input.value = '';
    showToast('댓글이 등록되었습니다.');
    loadAndRenderComments(currentPostDetail.id);
    renderPostsList();
  });
}

function renderPostsList() {
  const container = document.getElementById('postsList');
  container.innerHTML = '';

  const searchKeyword = document.getElementById('postSearchInput').value.toLowerCase();

  const filtered = postsList.filter(p => {
    if (currentBoardCategory !== 'ALL' && p.category !== currentBoardCategory) return false;
    if (searchKeyword && !p.title.toLowerCase().includes(searchKeyword) && !p.content.toLowerCase().includes(searchKeyword)) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">등록된 게시글이 없습니다.</div>`;
    return;
  }

  filtered.forEach(post => {
    const card = document.createElement('div');
    card.className = `post-card ${post.is_notice ? 'notice' : ''}`;
    const dateFormatted = new Date(post.created_at).toLocaleDateString('ko-KR');

    card.innerHTML = `
      <div class="post-card-header">
        <span class="category-chip ${post.is_notice ? 'notice' : ''}">${post.category}</span>
        ${post.is_notice ? '<span style="color:#ef4444; font-size:0.75rem; font-weight:700;"><i class="fa-solid fa-bullhorn"></i> 중요</span>' : ''}
      </div>
      <h3 class="post-title">${post.title}</h3>
      <p class="post-snippet">${post.content}</p>
      <div class="post-footer">
        <span>${post.author_team > 0 ? post.author_team + '조' : '관리'} ${post.author_name} &bull; ${dateFormatted}</span>
        <span><i class="fa-regular fa-comment"></i> ${post.comment_count || 0}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      openPostDetailModal(post);
    });

    container.appendChild(card);
  });
}

async function openPostDetailModal(post) {
  currentPostDetail = post;
  document.getElementById('detailPostCategory').textContent = post.category;
  document.getElementById('detailPostTitle').textContent = post.title;
  document.getElementById('detailPostAuthor').textContent = `${post.author_team > 0 ? post.author_team + '조' : '관리'} ${post.author_name}`;
  document.getElementById('detailPostDate').textContent = new Date(post.created_at).toLocaleString('ko-KR');
  document.getElementById('detailPostContent').textContent = post.content;

  openModal('postDetailModal');
  loadAndRenderComments(post.id);
}

async function loadAndRenderComments(postId) {
  const container = document.getElementById('detailCommentsList');
  container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">댓글 불러오는 중...</div>';

  let comments = [];
  if (isConnectedToSupabase) {
    const data = await SupabaseRest.select('comments', `post_id=eq.${postId}&order=created_at.asc`);
    if (data) comments = data;
  }

  document.getElementById('detailCommentCount').textContent = comments.length;

  if (comments.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">첫 댓글을 남겨보세요.</div>';
    return;
  }

  container.innerHTML = comments.map(c => `
    <div style="background:#f8fafc; padding:0.65rem 0.85rem; border-radius:6px; margin-bottom:0.5rem; border:1px solid var(--border-color);">
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.25rem;">
        <strong>${c.author_team > 0 ? c.author_team + '조' : '관리'} ${c.author_name}</strong>
        <span>${new Date(c.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="font-size:0.875rem; color:var(--text-main);">${c.content}</div>
    </div>
  `).join('');
}

// ==============================================================================
// 16. Antigravity 무중력 모드 & Particle Engine
// ==============================================================================
function initAntigravity() {
  const btn = document.getElementById('antigravityBtn');
  const canvas = document.getElementById('antigravityCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particleCount = 45;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1.2,
      vy: (Math.random() - 0.5) * 1.2,
      size: Math.random() * 3 + 1.5,
      color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 255, ${Math.random() * 0.4 + 0.2})`
    });
  }

  let mouse = { x: -1000, y: -1000 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  function renderParticles() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      if (isAntigravityActive) {
        p.vy -= 0.015;
        if (p.y < -10) p.y = height + 10;
      } else {
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        p.x += (dx / dist) * force * 4;
        p.y += (dy / dist) * force * 4;
      }

      p.x += p.vx;
      p.y += p.vy;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    });

    requestAnimationFrame(renderParticles);
  }
  requestAnimationFrame(renderParticles);

  btn.addEventListener('click', () => {
    isAntigravityActive = !isAntigravityActive;
    if (isAntigravityActive) {
      document.body.classList.add('antigravity-active');
      btn.classList.add('active');
      btn.innerHTML = `<i class="fa-solid fa-check"></i> <span class="btn-text">무중력 가동 중</span>`;
      showToast('🚀 Antigravity 무중력 모드가 활성화되었습니다!');
    } else {
      document.body.classList.remove('antigravity-active');
      btn.classList.remove('active');
      btn.innerHTML = `<i class="fa-solid fa-rocket"></i> <span class="btn-text">Antigravity 모드</span>`;
      showToast('지구 중력으로 복귀하였습니다.');
    }
  });
}

// ==============================================================================
// 17. 모달 및 보조 유틸리티
// ==============================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    closeModal(btn.dataset.close);
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('open');
  }
});

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i> <span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
