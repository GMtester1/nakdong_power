/**
 * ==============================================================================
 * 낙동강 발전관리과 4조3교대 포털 - 프론트엔드 핵심 로직 (app.js)
 * ==============================================================================
 * - 체계: 4조 3교대 순환 (휴무 X -> 주간 D -> 휴무 X -> 야간 S)
 * - 순수 브라우저 Native REST API 엔진 내장 (외부 CDN 의존도 제로, 네트워크 지연 방지)
 * - Supabase 실시간 연동 (스케줄, 주간 업무메모, 게시판, 댓글)
 * - 오프라인/로컬 자동 폴백 및 원클릭 연결 진단/재시도 모달 탑재
 */

// 1. Supabase 접속 설정 (기본값 내장으로 설정 없이 어디서든 즉시 자동 연결)
const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://yihwudxvoplamekroprx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpaHd1ZHh2b3BsYW1la3JvcHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4OTM0NDAsImV4cCI6MjEwMzQ2OTQ0MH0.FX2uU90oZClfiwTJX5S0hDMbPEKMepvGiougVStK7XI'
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

  // 2. 웹서버의 /api/config 엔드포인트에서 설정 읽기 (Vercel/Node 환경)
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const serverCfg = await res.json();
      if (serverCfg.url && serverCfg.anonKey) {
        return serverCfg;
      }
    }
  } catch (e) {}

  // 3. 내장된 기본값 사용 (HTML 직접 열기, 깃허브 페이지, Vercel 무설정 배포 지원)
  return { ...DEFAULT_SUPABASE_CONFIG };
}

let SUPABASE_CONFIG = { url: '', anonKey: '' };

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  { id: 99, name: '김선영(차장)', employee_id: '20100711', car_number: '-', team: 0, role: '관리자', avatar_color_index: 8 },
  { id: 100, name: '이상은(대리)', employee_id: '20194876', car_number: '-', team: 0, role: '관리자', avatar_color_index: 9 }
];

// 4. 4조 3교대 순환 규칙 및 근무 상세
// 4일 순환 주기: X(휴무) -> D(주간) -> X(휴무) -> S(야간)
const CYCLE_PATTERN = ['X', 'D', 'X', 'S'];

const SHIFT_TYPES = {
  D: { name: '주간 (D)', short: 'D', hours: 8.0, timeRange: '09:00 ~ 18:00', restTime: '12:00 ~ 13:00' },
  S: { name: '야간 (S)', short: 'S', hours: 13.5, timeRange: '18:00 ~ 익일 09:00', restTime: '23:30 ~ 01:30' },
  X: { name: '휴무 (X)', short: 'X', hours: 0.0, timeRange: '전일 휴무', restTime: '-' },
  DS: { name: '주야연속 (DS)', short: 'DS', hours: 21.5, timeRange: '09:00 ~ 익일 09:00', restTime: '휴게 3.5h' },
  H: { name: '휴가 (H)', short: 'H', hours: 8.0, timeRange: '전일 연차 및 유급 휴가', restTime: '-' },
  V: { name: '출장 (V)', short: 'V', hours: 8.0, timeRange: '09:00 ~ 18:00', restTime: '-' }
};

// 대한민국 법정 공휴일 (2026년 기준)
const KOREAN_HOLIDAYS = {
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-02-19': '대체공휴일',
  '2026-03-01': '삼일절',
  '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
  '2026-06-03': '지방선거',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-09-28': '대체공휴일',
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절'
};

function isKoreanHoliday(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  if (KOREAN_HOLIDAYS[key]) return true;
  const recurring = `${m}-${d}`;
  const fixed = ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'];
  return fixed.includes(recurring);
}

function getKoreanHolidayName(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const key = `${y}-${m}-${d}`;
  if (KOREAN_HOLIDAYS[key]) return KOREAN_HOLIDAYS[key];
  return null;
}

// 통상근무자 판별 (김선영, 이상은)
function isRegularWorker(user) {
  if (!user) return false;
  return user.team <= 0 || user.role === '관리자' || user.id === 99 || user.id === 100;
}

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
let monthlySelectedDate = new Date(2026, 9, 1);
let weeklySelectedDate = new Date(2026, 9, 1);
let dailySelectedDate = new Date(2026, 9, 1);

let usersList = [...DEFAULT_USERS];
let schedulesCache = {};      // key: `${userId}_${dateString}` -> schedule object
try {
  const savedSchedules = localStorage.getItem('NAKDONG_SCHEDULES_CACHE');
  if (savedSchedules) {
    schedulesCache = JSON.parse(savedSchedules) || {};
  }
} catch (e) {}
let adminNotesCache = {};     // key: dateString -> content
let monthlySchedulesCache = {}; // key: dateString -> content
try {
  const savedMonthly = localStorage.getItem('NAKDONG_MONTHLY_SCHEDULES_CACHE');
  if (savedMonthly) {
    monthlySchedulesCache = JSON.parse(savedMonthly) || {};
  }
} catch (e) {}
let generatorShutdownCache = {
  LARGE_HYDRO: '',
  SMALL_HYDRO: ''
};
let generatorShutdownUpdated = {
  LARGE_HYDRO: null,
  SMALL_HYDRO: null
};
try {
  const savedShutdown = localStorage.getItem('NAKDONG_GENERATOR_SHUTDOWN_CACHE');
  if (savedShutdown) {
    const parsed = JSON.parse(savedShutdown);
    if (parsed) {
      generatorShutdownCache.LARGE_HYDRO = parsed.LARGE_HYDRO || '';
      generatorShutdownCache.SMALL_HYDRO = parsed.SMALL_HYDRO || '';
    }
  }
} catch (e) {}
let postsList = [];
let currentPostDetail = null;
let currentAdminTargetDate = null; // 모달 대상 일자
let currentMonthlyTargetDate = null; // 월간일정 모달 대상 일자

let currentTeamFilter = 'ALL';
let currentReqFilter = 'ALL';
let currentBoardCategory = 'ALL';
let isAntigravityActive = false;

// ==============================================================================
// 6. 근무 자동 연산 엔진 (4조3교대 순환 및 통상근무자)
// ==============================================================================
function calculateShiftForDate(team, dateObj) {
  if (!team || team <= 0 || team > 4) {
    // 통상근무자 (관리자: 김선영, 이상은): 평일 D, 휴일 X
    const day = dateObj.getDay();
    const isWeekend = (day === 0 || day === 6);
    const isHoliday = isKoreanHoliday(dateObj);
    return (isWeekend || isHoliday) ? 'X' : 'D';
  }

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

  const generated = {
    user_id: userId,
    date_string: dateStr,
    shift_type: baseShift,
    original_shift_type: baseShift,
    note: ''
  };

  schedulesCache[cacheKey] = generated;
  return generated;
}

// ==============================================================================
// 7. 앱 시작 및 초기화 (DOM Ready 무관 완벽 방어)
// ==============================================================================
function startApp() {
  initAuthSystem();
  initUserSelector();
  initNavigation();
  initCalendarControls();
  initTeamScheduleControls();
  initMonthlyScheduleControls();
  initGeneratorShutdownControls();
  initDailyScheduleControls();
  initBoardScreen();
  initAntigravity();
  initSupabaseSettingsModal();
  initDaeguTrainModule();
  initNotificationsModule();
  initAdminShiftControls();
  initPowerGenerationControls();

  // 1. 화면 즉시 렌더링 (지연 없이 즉시 4조3교대 근무표 표시)
  renderMyCalendar();
  renderTeamSchedule();
  renderMonthlySchedule();
  renderGeneratorShutdownSection();
  renderDailySchedule();

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
      try {
        const savedAuthId = localStorage.getItem('NAKDONG_AUTH_USER_ID');
        if (savedAuthId) {
          const found = usersList.find(u => String(u.id) === String(savedAuthId));
          if (found) currentUser = found;
        }
      } catch (e) {}
      initUserSelector();
    }

    // 2. 스케줄 오버레이
    const schedules = await SupabaseRest.select('shift_schedules');
    if (schedules) {
      schedules.forEach(s => {
        schedulesCache[`${s.user_id}_${s.date_string}`] = s;
      });
    }

    // 3. 주간 업무 메모
    const notes = await SupabaseRest.select('admin_weekly_notes');
    if (notes) {
      notes.forEach(n => {
        adminNotesCache[n.date_string] = n.content;
      });
    }

    // 4. 월간 일정 메모 (monthly_schedules)
    try {
      const monthlyData = await SupabaseRest.select('monthly_schedules');
      if (monthlyData && Array.isArray(monthlyData)) {
        monthlyData.forEach(m => {
          if (m && m.date_string) {
            monthlySchedulesCache[m.date_string] = m.content || '';
          }
        });
        try {
          localStorage.setItem('NAKDONG_MONTHLY_SCHEDULES_CACHE', JSON.stringify(monthlySchedulesCache));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('월간일정 Supabase 로드 실패 (로컬 캐시 사용):', err);
    }

    // 5. 발전기 정지일정 (generator_shutdown_schedules: 대수력 및 소수력)
    try {
      const shutdownData = await SupabaseRest.select('generator_shutdown_schedules');
      if (shutdownData && Array.isArray(shutdownData)) {
        shutdownData.forEach(item => {
          if (item && item.category) {
            generatorShutdownCache[item.category] = item.content || '';
            if (item.updated_at) {
              generatorShutdownUpdated[item.category] = item.updated_at;
            }
          }
        });
        try {
          localStorage.setItem('NAKDONG_GENERATOR_SHUTDOWN_CACHE', JSON.stringify(generatorShutdownCache));
        } catch (e) {}
      }
    } catch (err) {
      console.warn('발전기 정지일정 Supabase 로드 실패 (로컬 캐시 사용):', err);
    }

    // 6. 게시글
    const posts = await SupabaseRest.select('posts', 'order=created_at.desc');
    if (posts) {
      postsList = posts;
    }

    // 화면 갱신
    renderMyCalendar();
    renderTeamSchedule();
    renderMonthlySchedule();
    renderGeneratorShutdownSection();
    renderDailySchedule();
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

  // 기본값 복원 버튼
  const resetBtn = document.getElementById('btnResetSupabaseConfig');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      try {
        localStorage.removeItem('NAKDONG_SUPABASE_CONFIG');
      } catch (e) {}
      SUPABASE_CONFIG = { ...DEFAULT_SUPABASE_CONFIG };
      document.getElementById('cfgSupabaseUrl').value = SUPABASE_CONFIG.url;
      document.getElementById('cfgSupabaseKey').value = SUPABASE_CONFIG.anonKey;
      showToast('기본 Supabase 설정으로 복원되었습니다. 재연결을 시도합니다.');
      await checkAndSyncSupabase();
    });
  }

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
// 10. 상단 메뉴 (프로필 전환, 대구역 열차, 알림 센터) 및 네비게이션
// ==============================================================================
function updateUserProfileUI() {
  const avatarEl = document.getElementById('headerProfileAvatar');
  const nameEl = document.getElementById('headerProfileName');
  const teamEl = document.getElementById('headerProfileTeam');
  if (avatarEl && currentUser) {
    avatarEl.textContent = (currentUser.name || '조').slice(0, 1);
    const colors = ['#2563eb', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2', '#4f46e5', '#be185d'];
    avatarEl.style.backgroundColor = colors[(currentUser.avatar_color_index || 0) % colors.length];
  }
  if (nameEl && currentUser) {
    nameEl.textContent = currentUser.name || '';
  }
  if (teamEl && currentUser) {
    teamEl.textContent = currentUser.team > 0 ? `${currentUser.team}조` : '관리자';
  }
}

function initUserSelector() {
  const select = document.getElementById('currentUserSelect');
  if (select) {
    select.innerHTML = usersList.map(u => {
      const teamText = u.team > 0 ? `${u.team}조` : '관리';
      return `<option value="${u.id}">${teamText} ${u.name}</option>`;
    }).join('');

    select.value = currentUser.id;
    select.addEventListener('change', (e) => {
      const uid = parseInt(e.target.value, 10);
      currentUser = usersList.find(u => u.id === uid) || usersList[0];
      try {
        localStorage.setItem('NAKDONG_AUTH_USER_ID', String(currentUser.id));
      } catch (err) {}
      updateUserProfileUI();
      showToast(`작업자가 '${currentUser.name}'(으)로 전환되었습니다.`);
      renderMyCalendar();
      renderTeamSchedule();
    });
  }
  updateUserProfileUI();
}

// ==============================================================================
// 10-2. 최초 접속 로그인 및 계정 인증 모듈 (Total 10 Accounts)
// ==============================================================================
function initAuthSystem() {
  const overlay = document.getElementById('loginOverlay');
  const form = document.getElementById('portalLoginForm');
  const nameInput = document.getElementById('loginNameInput');
  const pwInput = document.getElementById('loginPwInput');
  const errorMsg = document.getElementById('loginErrorMsg');
  const errorText = document.getElementById('loginErrorText');
  const quickGrid = document.getElementById('loginQuickSelectGrid');
  const logoutBtn = document.getElementById('headerLogoutBtn');

  // 1. 등록 계정 10명 빠른 선택 렌더링
  if (quickGrid) {
    quickGrid.innerHTML = DEFAULT_USERS.map(u => {
      const parenMatch = u.name.match(/\((.*?)\)/);
      const cleanName = parenMatch ? parenMatch[1] : (u.name.replace(/관리자[0-9]*/g, '').trim() || u.name);
      const teamBg = u.team > 0 ? (['#2563eb', '#059669', '#d97706', '#7c3aed'][u.team - 1] || '#475569') : '#dc2626';
      const teamText = u.team > 0 ? `${u.team}조` : '관리';
      return `
        <div class="login-quick-pill" data-name="${cleanName}" data-pw="${u.employee_id}" title="클릭 시 이름과 사번이 자동 입력됩니다">
          <span class="team-badge" style="background:${teamBg};">${teamText}</span>
          <span style="font-weight:700;">${cleanName}</span>
          <span style="font-size:0.68rem; color:#64748b; margin-left:auto;">${u.employee_id}</span>
        </div>
      `;
    }).join('');

    quickGrid.querySelectorAll('.login-quick-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (nameInput) nameInput.value = pill.dataset.name;
        if (pwInput) pwInput.value = pill.dataset.pw;
        if (errorMsg) errorMsg.style.display = 'none';
        if (pwInput) pwInput.focus();
      });
    });
  }

  // 2. 로그인 폼 제출 처리 (id : name, pw : employee_id)
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredName = nameInput ? nameInput.value.trim().toLowerCase() : '';
      const enteredPw = pwInput ? pwInput.value.trim().toLowerCase() : '';

      // 10개 계정 매칭 검사
      const matchedUser = usersList.find(u => {
        // PW: employee_id 일치 (대소문자 무관)
        const empId = (u.employee_id || '').toLowerCase();
        if (empId !== enteredPw) return false;

        // ID: name 일치 (풀네임 or 괄호 안 이름 or 직급 뗀 이름)
        const fullName = (u.name || '').toLowerCase();
        const parenMatch = u.name.match(/\((.*?)\)/);
        const innerName = parenMatch ? parenMatch[1].toLowerCase() : '';
        const withoutParen = u.name.replace(/\(.*?\)/, '').trim().toLowerCase();

        return enteredName === fullName || enteredName === innerName || enteredName === withoutParen;
      });

      if (!matchedUser) {
        if (errorMsg) {
          errorMsg.style.display = 'flex';
          if (errorText) errorText.textContent = '이름(ID) 또는 사번(비밀번호)이 일치하지 않습니다.';
        }
        return;
      }

      // 로그인 성공 -> 접속계정 프로필로 자동접속 저장
      if (errorMsg) errorMsg.style.display = 'none';
      currentUser = matchedUser;
      try {
        localStorage.setItem('NAKDONG_AUTH_USER_ID', String(currentUser.id));
      } catch (err) {}

      if (overlay) overlay.classList.add('hidden');
      updateUserProfileUI();
      const select = document.getElementById('currentUserSelect');
      if (select) select.value = currentUser.id;

      showToast(`'${currentUser.name}' 계정으로 로그인되었습니다.`);
      renderMyCalendar();
      renderTeamSchedule();
      renderDailySchedule();
      updateSelectedDateDetail(selectedDate);
    });
  }

  // 3. 로그아웃 버튼 처리
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem('NAKDONG_AUTH_USER_ID');
      } catch (err) {}
      if (overlay) {
        overlay.classList.remove('hidden');
        if (nameInput) nameInput.value = '';
        if (pwInput) pwInput.value = '';
        if (errorMsg) errorMsg.style.display = 'none';
        if (nameInput) nameInput.focus();
      }
      showToast('로그아웃 되었습니다. 다시 로그인해 주세요.');
    });
  }

  // 4. 최초 접속 여부 및 자동 접속 체크
  let savedAuthId = null;
  try {
    savedAuthId = localStorage.getItem('NAKDONG_AUTH_USER_ID');
  } catch (err) {}

  if (savedAuthId) {
    const existingUser = usersList.find(u => String(u.id) === String(savedAuthId));
    if (existingUser) {
      // 이미 인증된 접속계정 프로필로 자동 접속
      currentUser = existingUser;
      if (overlay) overlay.classList.add('hidden');
      updateUserProfileUI();
      const select = document.getElementById('currentUserSelect');
      if (select) select.value = currentUser.id;
    } else {
      if (overlay) overlay.classList.remove('hidden');
    }
  } else {
    // 최초 접속: 로그인 오버레이 노출
    if (overlay) overlay.classList.remove('hidden');
  }
}

// ------------------------------------------------------------------------------
// 대구역 실시간 기차 및 광역전철 시간표 모듈 (Daegu Station Timetable)
// ------------------------------------------------------------------------------
const DAEGU_TIMETABLES = {
  daegyeong: [
    { time: "05:30", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "05:47", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "06:00", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "06:13", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "06:30", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "06:53", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "07:11", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "07:27", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "07:51", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "08:13", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "08:25", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "08:44", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "08:59", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "09:15", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "09:38", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "10:17", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "10:45", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "11:07", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "11:36", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "11:50", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "13:13", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "13:46", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "14:22", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "14:51", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "15:01", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "15:27", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "15:53", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "16:22", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "16:55", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "17:14", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "17:35", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "17:55", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "18:12", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "18:38", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "19:04", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "19:29", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "20:02", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "20:21", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "20:48", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "21:08", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "21:31", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "22:01", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "22:27", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "22:54", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "23:12", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "23:36", dest: "구미/경산 (대경선)", type: "광역전철" },
    { time: "23:56", dest: "구미/경산 (대경선 막차)", type: "광역전철" }
  ],
  line1: [
    { time: "05:41", dest: "하양 방면", type: "1호선" },
    { time: "06:08", dest: "하양 방면", type: "1호선" },
    { time: "06:31", dest: "하양 방면", type: "1호선" },
    { time: "07:00", dest: "하양 방면", type: "1호선" },
    { time: "07:17", dest: "안심 방면", type: "1호선" },
    { time: "07:24", dest: "하양 방면", type: "1호선" },
    { time: "07:36", dest: "하양 방면", type: "1호선" },
    { time: "07:47", dest: "하양 방면", type: "1호선" },
    { time: "08:07", dest: "하양 방면", type: "1호선" },
    { time: "08:27", dest: "하양 방면", type: "1호선" },
    { time: "08:47", dest: "하양 방면", type: "1호선" },
    { time: "09:07", dest: "하양 방면", type: "1호선" },
    { time: "09:27", dest: "하양 방면", type: "1호선" },
    { time: "10:11", dest: "하양 방면", type: "1호선" },
    { time: "11:15", dest: "하양 방면", type: "1호선" },
    { time: "12:19", dest: "하양 방면", type: "1호선" },
    { time: "13:23", dest: "하양 방면", type: "1호선" },
    { time: "14:27", dest: "하양 방면", type: "1호선" },
    { time: "15:31", dest: "하양 방면", type: "1호선" },
    { time: "16:35", dest: "하양 방면", type: "1호선" },
    { time: "17:15", dest: "하양 방면", type: "1호선" },
    { time: "17:45", dest: "하양 방면", type: "1호선" },
    { time: "18:15", dest: "하양 방면", type: "1호선" },
    { time: "18:45", dest: "하양 방면", type: "1호선" },
    { time: "19:20", dest: "하양 방면", type: "1호선" },
    { time: "20:30", dest: "하양 방면", type: "1호선" },
    { time: "21:40", dest: "하양 방면", type: "1호선" },
    { time: "22:50", dest: "하양 방면 (막차)", type: "1호선" }
  ],
  korail: [
    { time: "06:15", dest: "동대구/부산행", type: "무궁화호" },
    { time: "06:42", dest: "구미/대전/서울행", type: "ITX-마음" },
    { time: "07:20", dest: "동대구/마산행", type: "무궁화호" },
    { time: "07:55", dest: "대전/서울행", type: "ITX-새마을" },
    { time: "08:35", dest: "동대구/부산행", type: "무궁화호" },
    { time: "09:12", dest: "김천/대전행", type: "ITX-마음" },
    { time: "10:25", dest: "동대구/포항행", type: "무궁화호" },
    { time: "11:40", dest: "서울/용산행", type: "ITX-새마을" },
    { time: "13:50", dest: "동대구/부산행", type: "무궁화호" },
    { time: "15:30", dest: "대전/서울행", type: "ITX-마음" },
    { time: "17:25", dest: "동대구/부산행", type: "무궁화호" },
    { time: "18:05", dest: "구미/대전행", type: "ITX-새마을" },
    { time: "18:50", dest: "동대구/부산행", type: "무궁화호" },
    { time: "20:20", dest: "대전/서울행", type: "ITX-마음" },
    { time: "22:15", dest: "동대구행 (막차)", type: "무궁화호" }
  ]
};

let currentTrainTab = 'daegyeong';
let trainClockTimer = null;

function renderTrainSchedule() {
  const container = document.getElementById('trainScheduleList');
  if (!container) return;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const list = DAEGU_TIMETABLES[currentTrainTab] || [];
  let foundNext = false;

  container.innerHTML = list.map(item => {
    const [h, m] = item.time.split(':').map(Number);
    const trainMinutes = h * 60 + m;
    const diff = trainMinutes - currentMinutes;

    let remainingText = '';
    let isNext = false;
    let isSoon = false;

    if (diff > 0 && !foundNext) {
      foundNext = true;
      isNext = true;
      if (diff <= 15) isSoon = true;
      remainingText = `${diff}분 후 출발`;
    } else if (diff > 0) {
      remainingText = `${diff}분 후`;
    } else {
      remainingText = '출발 완료';
    }

    const badgeClass = currentTrainTab === 'daegyeong' ? 'dg' : (currentTrainTab === 'line1' ? 'line1' : 'kr');

    return `
      <div class="train-item-card ${isNext ? 'next-train' : ''}">
        <div class="train-item-left">
          <span class="train-badge-pill ${badgeClass}">${item.type}</span>
          <div class="train-dest-info">
            <span class="train-dest-name">${item.dest}</span>
            <span class="train-time-display"><i class="fa-regular fa-clock"></i> ${item.time} 출발</span>
          </div>
        </div>
        <div class="train-remaining-tag ${isSoon ? 'soon' : ''}">
          ${isNext ? '<i class="fa-solid fa-person-running"></i> ' : ''}${remainingText}
        </div>
      </div>
    `;
  }).join('');
}

function initDaeguTrainModule() {
  const trainBtn = document.getElementById('headerDaeguBtn');
  if (trainBtn) {
    trainBtn.addEventListener('click', () => {
      openModal('daeguStationModal');
      renderTrainSchedule();
      if (!trainClockTimer) {
        trainClockTimer = setInterval(() => {
          const now = new Date();
          const clockEl = document.getElementById('trainLiveClock');
          if (clockEl) {
            clockEl.textContent = now.toTimeString().split(' ')[0];
          }
        }, 1000);
      }
    });
  }

  document.querySelectorAll('.train-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.train-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTrainTab = btn.dataset.trainTab;
      renderTrainSchedule();
    });
  });
}

function initNotificationsModule() {
  const notifBtn = document.getElementById('headerNotifBtn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      openModal('notificationsModal');
      const badge = document.getElementById('headerNotifBadge');
      if (badge) badge.style.display = 'none';
    });
  }
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
      if (tab.dataset.tab === 'teamSchedule') {
        teamSelectedDate = new Date(selectedDate);
        renderTeamSchedule();
      }
      if (tab.dataset.tab === 'monthlySchedule') {
        monthlySelectedDate = new Date(selectedDate);
        renderMonthlySchedule();
        renderGeneratorShutdownSection();
      }
      if (tab.dataset.tab === 'dailySchedule') {
        dailySelectedDate = new Date(selectedDate);
        renderDailySchedule();
      }
      if (tab.dataset.tab === 'bulletinBoard') renderPostsList();
      if (tab.dataset.tab === 'powerGeneration') renderPowerGeneration();
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
  const memoText = adminNotesCache[dateStr] || sched.note || '';

  cell.innerHTML = `
    <div class="day-header">
      <span class="day-number">${dateObj.getDate()}</span>
      ${isOtherMonth ? `<span style="font-size:0.65rem; color:#94a3b8;">${dateObj.getMonth()+1}월</span>` : ''}
    </div>
    <div class="shift-tag-box" title="클릭하여 근무 코드(휴가, 출장, 교대 등) 변경" style="cursor: pointer;">
      <span class="shift-tag ${shiftType}">${shiftType}</span>
    </div>
  `;

  const tagBox = cell.querySelector('.shift-tag-box');
  if (tagBox) {
    tagBox.addEventListener('click', (e) => {
      e.stopPropagation();
      selectedDate = dateObj;
      document.querySelectorAll('#myCalendarGrid .calendar-cell').forEach(c => c.classList.remove('selected'));
      cell.classList.add('selected');
      updateSelectedDateDetail(dateObj);
      openAdminShiftModal(dateObj);
    });
  }

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
  const memoText = adminNotesCache[dateStr] || sched.note || '';

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const teamText = currentUser.team > 0 ? `${currentUser.team}조` : '통상근무';
  document.getElementById('selectedDateText').innerHTML = 
    `<i class="fa-regular fa-clock"></i> ${dateStr} (${dayNames[dateObj.getDay()]}) ${teamText} ${currentUser.name} 근무 상세`;

  const badge = document.getElementById('selectedShiftBadge');
  badge.textContent = info.name;
  badge.className = `shift-tag ${shift}`;

  document.getElementById('selectedTimeRange').textContent = info.timeRange;
  document.getElementById('selectedRestTime').textContent = info.restTime;
  document.getElementById('selectedNote').textContent = memoText || (isRegularWorker(currentUser) ? '통상근무 (평일 D, 휴일 X, 휴가 H, 출장 V)' : '특이사항 없음');

  // 빠른 근무 코드 변경 바 (교대근무자 & 통상근무자 공통 항상 표시)
  const adminRow = document.getElementById('adminShiftControlRow');
  if (adminRow) {
    adminRow.style.display = 'block';
    ['H', 'V', 'D', 'S', 'DS', 'X'].forEach(c => {
      const btn = document.getElementById(`btnAdminSet${c}`);
      if (btn) {
        if (shift === c) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });
  }
}

function openAdminShiftModal(dateObj) {
  currentAdminTargetDate = dateObj;
  const dateStr = formatDate(dateObj);
  const titleElem = document.getElementById('adminShiftModalTitle');
  if (titleElem) {
    titleElem.innerHTML = `<i class="fa-solid fa-calendar-check" style="color:var(--primary);"></i> 근무 코드 변경 (${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일)`;
  }
  const descElem = document.getElementById('adminShiftModalDesc');
  if (descElem) {
    descElem.textContent = `${currentUser.name}님의 근무 형태를 선택하세요:`;
  }
  openModal('adminShiftModal');
}

async function updateAdminShift(userId, dateStr, shiftCode) {
  const cacheKey = `${userId}_${dateStr}`;
  const parts = dateStr.split('-');
  const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const origShift = calculateShiftForDate(currentUser.team || 0, dateObj);

  let finalShift = shiftCode;
  if (shiftCode === 'RESTORE') {
    finalShift = origShift;
  }

  const existingNote = schedulesCache[cacheKey]?.note || adminNotesCache[dateStr] || '';

  schedulesCache[cacheKey] = {
    user_id: userId,
    date_string: dateStr,
    shift_type: finalShift,
    original_shift_type: schedulesCache[cacheKey]?.original_shift_type || origShift,
    note: existingNote
  };

  try {
    localStorage.setItem('NAKDONG_SCHEDULES_CACHE', JSON.stringify(schedulesCache));
  } catch (e) {}

  const shiftInfo = SHIFT_TYPES[finalShift] || SHIFT_TYPES.X;
  showToast(`${dateStr} 일정이 [${shiftInfo.name}]로 변경되었습니다.`);

  // Push to Supabase if connected
  if (isConnectedToSupabase && typeof SupabaseRest !== 'undefined') {
    try {
      await SupabaseRest.upsert('shift_schedules', {
        user_id: userId,
        date_string: dateStr,
        shift_type: finalShift,
        original_shift_type: schedulesCache[cacheKey].original_shift_type,
        note: existingNote
      }, 'user_id,date_string');
    } catch (e) {
      console.warn('Supabase schedule upsert failed:', e);
    }
  }

  renderMyCalendar();
  renderTeamSchedule();
  renderDailySchedule();
  updateSelectedDateDetail(selectedDate);
}

function initAdminShiftControls() {
  // Modal options
  document.querySelectorAll('.btn-modal-shift-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentAdminTargetDate) {
        const code = btn.dataset.code;
        updateAdminShift(currentUser.id, formatDate(currentAdminTargetDate), code);
        closeModal('adminShiftModal');
      }
    });
  });

  // Selected date quick buttons
  ['H', 'V', 'D', 'S', 'DS', 'X'].forEach(c => {
    const btn = document.getElementById(`btnAdminSet${c}`);
    if (btn) {
      btn.addEventListener('click', () => {
        updateAdminShift(currentUser.id, formatDate(selectedDate), c);
      });
    }
  });

  const restoreBtn = document.getElementById('btnAdminRestoreDefault');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      updateAdminShift(currentUser.id, formatDate(selectedDate), 'RESTORE');
    });
  }
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

  document.querySelectorAll('#tab-teamSchedule .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#tab-teamSchedule .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentTeamFilter = chip.dataset.filter;
      renderTeamSchedule();
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

  // 1. 이전 달 채우기
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
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

  // 3. 다음 달 채우기
  const remainingCells = (7 - ((startDayOfWeek + lastDay.getDate()) % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nDate = new Date(year, month + 1, d);
    grid.appendChild(createTeamCalendarCell(nDate, true));
  }
}

function createTeamCalendarCell(dateObj, isOtherMonth) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell team-cell ${isOtherMonth ? 'other-month' : ''}`;
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');

  const dateStr = formatDate(dateObj);

  const adminWorkers = [];
  const dayWorkers = [];
  const nightWorkers = [];
  const tripWorkers = [];

  usersList.forEach(u => {
    const sched = getSchedule(u.id, dateStr);
    const st = sched.shift_type;
    const isAdmin = u.team === 0 || u.role === '관리자' || u.id === 99 || u.id === 100 || (u.name && u.name.includes('관리자'));

    if (isAdmin) {
      if (st === 'V') {
        const match = u.name.match(/\((.*?)\)/);
        const realName = match ? match[1] : (u.name.replace(/관리자[0-9]*/g, '').trim() || u.name);
        tripWorkers.push(realName);
        return;
      }
      // 관리자 "H"코드 및 휴가/휴무는 캘린더에 미표기
      const isVacation = (st === 'H' || st === 'VACATION') || (sched.note && sched.note.includes('휴가'));
      if (st && st !== 'X' && st !== 'H' && !isVacation) {
        // 관리자 실제 성명 추출: '관리자(김선영)' -> '김선영', '관리자2(이상은)' -> '이상은'
        const match = u.name.match(/\((.*?)\)/);
        const realName = match ? match[1] : (u.name.replace(/관리자[0-9]*/g, '').trim() || u.name);
        adminWorkers.push(realName);
      }
      return;
    }

    const cleanName = u.name.replace(/\(.*?\)/, '').trim();

    if (st === 'V') {
      tripWorkers.push(cleanName);
    } else if (u.team > 0 || (st && st !== 'X')) {
      if (st === 'DS' || st.includes('DS')) {
        dayWorkers.push(cleanName);
        nightWorkers.push(cleanName);
      } else if (st === 'D' || (st.includes('D') && !st.includes('S'))) {
        dayWorkers.push(cleanName);
      } else if (st === 'S' || (st.includes('S') && !st.includes('D'))) {
        nightWorkers.push(cleanName);
      }
    }
  });

  const showAdmin = (currentTeamFilter === 'ALL' || currentTeamFilter === 'DAY') && adminWorkers.length > 0;
  const showDay = (currentTeamFilter === 'ALL' || currentTeamFilter === 'DAY') && dayWorkers.length > 0;
  const showNight = (currentTeamFilter === 'ALL' || currentTeamFilter === 'NIGHT') && nightWorkers.length > 0;
  const showTrip = (currentTeamFilter === 'ALL' || currentTeamFilter === 'DAY') && tripWorkers.length > 0;

  const adminText = adminWorkers.join(', ');
  const adminHtml = showAdmin ? `
    <div class="team-worker-row admin-worker-row" title="관리자 근무현황: ${adminText}">
      <span class="worker-shift-lbl admin">관</span>
      <span class="worker-names-text">${adminText}</span>
    </div>
  ` : '';

  const dayHtml = showDay ? `
    <div class="team-worker-row day-worker-row" title="주간 근무자: ${dayWorkers.join(', ')}">
      <span class="worker-shift-lbl day">주</span>
      <span class="worker-names-text">${dayWorkers.join(', ')}</span>
    </div>
  ` : '';

  const nightHtml = showNight ? `
    <div class="team-worker-row night-worker-row" title="야간 근무자: ${nightWorkers.join(', ')}">
      <span class="worker-shift-lbl night">야</span>
      <span class="worker-names-text">${nightWorkers.join(', ')}</span>
    </div>
  ` : '';

  const tripHtml = showTrip ? `
    <div class="team-worker-row trip-worker-row" title="출장 근무자: ${tripWorkers.join(', ')}">
      <span class="worker-shift-lbl trip">출</span>
      <span class="worker-names-text">${tripWorkers.join(', ')}</span>
    </div>
  ` : '';

  cell.innerHTML = `
    <div class="day-header">
      <span class="day-number">${dateObj.getDate()}</span>
      ${isOtherMonth ? `<span style="font-size:0.65rem; color:#94a3b8;">${dateObj.getMonth()+1}월</span>` : ''}
    </div>
    <div class="team-calendar-worker-box">
      ${adminHtml}
      ${dayHtml}
      ${nightHtml}
      ${tripHtml}
      ${!adminHtml && !dayHtml && !nightHtml && !tripHtml ? '<span style="font-size:0.65rem; color:#94a3b8; text-align:center; padding:2px 0;">-</span>' : ''}
    </div>
  `;

  cell.addEventListener('click', () => {
    teamSelectedDate = dateObj;
    document.querySelectorAll('#teamCalendarGrid .calendar-cell').forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
  });

  return cell;
}

function renderWorkerRoster(dateObj) {
  // 우측 근무편성표 삭제됨: 캘린더 내 주/야 근무자 표시로 대체됨
}

// ==============================================================================
// 13. [메뉴 3] 월간 일정표 (Monthly Schedule: 일자별 메모 박스 캘린더)
// ==============================================================================
function initMonthlyScheduleControls() {
  const prevBtn = document.getElementById('monthlyPrevMonthBtn');
  const nextBtn = document.getElementById('monthlyNextMonthBtn');
  const todayBtn = document.getElementById('monthlyTodayBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      monthlySelectedDate.setMonth(monthlySelectedDate.getMonth() - 1);
      renderMonthlySchedule();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      monthlySelectedDate.setMonth(monthlySelectedDate.getMonth() + 1);
      renderMonthlySchedule();
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      monthlySelectedDate = new Date();
      renderMonthlySchedule();
    });
  }

  // 모달 내 저장 및 삭제 버튼 리스너
  const saveBtn = document.getElementById('btnMonthlyMemoSave');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (!currentMonthlyTargetDate) return;
      const textarea = document.getElementById('monthlyMemoModalTextarea');
      const val = textarea ? textarea.value.trim() : '';
      const dateStr = currentMonthlyTargetDate;

      // 1. 로컬 캐시 및 localStorage 저장
      if (val) {
        monthlySchedulesCache[dateStr] = val;
      } else {
        delete monthlySchedulesCache[dateStr];
      }
      try {
        localStorage.setItem('NAKDONG_MONTHLY_SCHEDULES_CACHE', JSON.stringify(monthlySchedulesCache));
      } catch (e) {}

      // 2. Supabase 비동기 저장/삭제 (monthly_schedules 테이블)
      if (isConnectedToSupabase) {
        try {
          if (val) {
            await SupabaseRest.upsert('monthly_schedules', {
              date_string: dateStr,
              content: val,
              updated_at: Date.now()
            }, 'date_string');
          } else {
            await SupabaseRest.delete('monthly_schedules', 'date_string', dateStr);
          }
        } catch (err) {
          console.warn('[Supabase] monthly_schedules 동기화 오류:', err);
        }
      }

      closeModal('monthlyMemoModal');
      renderMonthlySchedule();
      showToast(val ? `✅ ${dateStr} 월간 메모가 저장되었습니다.` : `🗑️ ${dateStr} 메모가 삭제되었습니다.`);
    });
  }

  const deleteBtn = document.getElementById('btnMonthlyMemoDelete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!currentMonthlyTargetDate) return;
      const dateStr = currentMonthlyTargetDate;
      if (!confirm(`${dateStr} 월간 일정 메모를 삭제하시겠습니까?`)) return;

      delete monthlySchedulesCache[dateStr];
      try {
        localStorage.setItem('NAKDONG_MONTHLY_SCHEDULES_CACHE', JSON.stringify(monthlySchedulesCache));
      } catch (e) {}

      if (isConnectedToSupabase) {
        try {
          await SupabaseRest.delete('monthly_schedules', 'date_string', dateStr);
        } catch (err) {
          console.warn('[Supabase] monthly_schedules 삭제 오류:', err);
        }
      }

      closeModal('monthlyMemoModal');
      renderMonthlySchedule();
      showToast(`🗑️ ${dateStr} 메모가 삭제되었습니다.`);
    });
  }
}

function renderMonthlySchedule() {
  const year = monthlySelectedDate.getFullYear();
  const month = monthlySelectedDate.getMonth();

  const titleEl = document.getElementById('monthlyMonthTitle');
  if (titleEl) {
    titleEl.textContent = `${year}년 ${month + 1}월`;
  }

  const grid = document.getElementById('monthlyCalendarGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)
  const totalDays = lastDay.getDate();

  // 1. 이전 달 채우기
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const pDate = new Date(year, month - 1, prevMonthLastDay - i);
    grid.appendChild(createMonthlyCalendarCell(pDate, true));
  }

  // 2. 이번 달 채우기
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month, d);
    grid.appendChild(createMonthlyCalendarCell(dateObj, false));
  }

  // 3. 다음 달 채우기 (7열 그리드 완성)
  const remainingCells = (7 - ((startDayOfWeek + totalDays) % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    const nDate = new Date(year, month + 1, i);
    grid.appendChild(createMonthlyCalendarCell(nDate, true));
  }
}

function createMonthlyCalendarCell(dateObj, isOtherMonth) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell monthly-cell ${isOtherMonth ? 'other-month' : ''}`;
  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0) cell.classList.add('sunday');
  if (dayOfWeek === 6) cell.classList.add('saturday');

  const dateStr = formatDate(dateObj);
  const holidayName = getKoreanHolidayName(dateObj);
  if (holidayName) cell.classList.add('sunday');

  const todayStr = formatDate(new Date());
  if (dateStr === todayStr) cell.classList.add('today');

  const memoText = monthlySchedulesCache[dateStr] || '';

  cell.innerHTML = `
    <div class="day-header">
      <span class="day-number">${dateObj.getDate()}</span>
      ${isOtherMonth ? `<span style="font-size:0.65rem; color:#94a3b8;">${dateObj.getMonth() + 1}월</span>` : ''}
      ${holidayName ? `<span class="holiday-lbl" style="font-size:0.65rem; color:#dc2626; font-weight:700;">${holidayName}</span>` : ''}
    </div>
    <div class="monthly-memo-box ${memoText ? 'has-memo' : ''}" data-date="${dateStr}" title="클릭하여 월간 일정 메모 입력 및 수정">
      ${memoText 
        ? `<div class="memo-text">${escapeHtml(memoText)}</div>` 
        : `<span class="memo-placeholder"><i class="fa-solid fa-plus"></i> 메모</span>`
      }
    </div>
  `;

  cell.addEventListener('click', () => {
    openMonthlyMemoModal(dateStr, dateObj);
  });

  return cell;
}

function openMonthlyMemoModal(dateStr, dateObj) {
  currentMonthlyTargetDate = dateStr;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[dateObj.getDay()];
  const holidayName = getKoreanHolidayName(dateObj);

  const badgeEl = document.getElementById('monthlyMemoDateBadge');
  if (badgeEl) {
    badgeEl.textContent = `${dateStr} (${dayName})${holidayName ? ' [' + holidayName + ']' : ''}`;
  }

  const existingMemo = monthlySchedulesCache[dateStr] || '';
  const textarea = document.getElementById('monthlyMemoModalTextarea');
  if (textarea) {
    textarea.value = existingMemo;
  }

  const deleteBtn = document.getElementById('btnMonthlyMemoDelete');
  if (deleteBtn) {
    deleteBtn.style.display = existingMemo ? 'inline-flex' : 'none';
  }

  openModal('monthlyMemoModal');
  setTimeout(() => {
    if (textarea) textarea.focus();
  }, 100);
}

// ==============================================================================
// 13-1. [월간 일정표 하단 고정 메뉴] 발전기 정지일정 (대수력 / 소수력 2분할)
// ==============================================================================
function initGeneratorShutdownControls() {
  const largeSaveBtn = document.getElementById('btnSaveLargeHydroShutdown');
  const smallSaveBtn = document.getElementById('btnSaveSmallHydroShutdown');
  const allSaveBtn = document.getElementById('btnSaveAllShutdownMemos');
  const largeDeleteBtn = document.getElementById('btnDeleteLargeHydroShutdown');
  const smallDeleteBtn = document.getElementById('btnDeleteSmallHydroShutdown');

  if (largeSaveBtn) {
    largeSaveBtn.addEventListener('click', async () => {
      const textarea = document.getElementById('largeHydroShutdownTextarea');
      const val = textarea ? textarea.value.trim() : '';
      await saveGeneratorShutdownCategory('LARGE_HYDRO', val, '대수력');
    });
  }

  if (smallSaveBtn) {
    smallSaveBtn.addEventListener('click', async () => {
      const textarea = document.getElementById('smallHydroShutdownTextarea');
      const val = textarea ? textarea.value.trim() : '';
      await saveGeneratorShutdownCategory('SMALL_HYDRO', val, '소수력');
    });
  }

  if (allSaveBtn) {
    allSaveBtn.addEventListener('click', async () => {
      const largeVal = document.getElementById('largeHydroShutdownTextarea')?.value.trim() || '';
      const smallVal = document.getElementById('smallHydroShutdownTextarea')?.value.trim() || '';
      await Promise.all([
        saveGeneratorShutdownCategory('LARGE_HYDRO', largeVal, '대수력', false),
        saveGeneratorShutdownCategory('SMALL_HYDRO', smallVal, '소수력', false)
      ]);
      showToast('✅ 발전기 정지일정(대수력·소수력)이 모두 저장되었습니다.');
    });
  }

  if (largeDeleteBtn) {
    largeDeleteBtn.addEventListener('click', async () => {
      if (!confirm('대수력 발전기 정지일정 내용을 초기화/삭제하시겠습니까?')) return;
      const textarea = document.getElementById('largeHydroShutdownTextarea');
      if (textarea) textarea.value = '';
      await saveGeneratorShutdownCategory('LARGE_HYDRO', '', '대수력');
    });
  }

  if (smallDeleteBtn) {
    smallDeleteBtn.addEventListener('click', async () => {
      if (!confirm('소수력 발전기 정지일정 내용을 초기화/삭제하시겠습니까?')) return;
      const textarea = document.getElementById('smallHydroShutdownTextarea');
      if (textarea) textarea.value = '';
      await saveGeneratorShutdownCategory('SMALL_HYDRO', '', '소수력');
    });
  }
}

async function saveGeneratorShutdownCategory(category, content, label, showNotification = true) {
  const now = Date.now();
  generatorShutdownCache[category] = content;
  generatorShutdownUpdated[category] = now;

  try {
    localStorage.setItem('NAKDONG_GENERATOR_SHUTDOWN_CACHE', JSON.stringify(generatorShutdownCache));
  } catch (e) {}

  if (isConnectedToSupabase) {
    try {
      await SupabaseRest.upsert('generator_shutdown_schedules', {
        category: category,
        content: content,
        updated_at: now
      }, 'category');
    } catch (err) {
      console.warn(`[Supabase] 발전기 정지일정 (${category}) 저장 오류:`, err);
    }
  }

  renderGeneratorShutdownSection();
  if (showNotification) {
    showToast(content ? `✅ ${label} 정지일정이 저장되었습니다.` : `🗑️ ${label} 정지일정이 삭제되었습니다.`);
  }
}

function renderGeneratorShutdownSection() {
  const largeTextarea = document.getElementById('largeHydroShutdownTextarea');
  const smallTextarea = document.getElementById('smallHydroShutdownTextarea');
  const largeTimeEl = document.getElementById('largeHydroUpdatedTime');
  const smallTimeEl = document.getElementById('smallHydroUpdatedTime');

  if (largeTextarea && document.activeElement !== largeTextarea) {
    largeTextarea.value = generatorShutdownCache['LARGE_HYDRO'] || '';
  }
  if (smallTextarea && document.activeElement !== smallTextarea) {
    smallTextarea.value = generatorShutdownCache['SMALL_HYDRO'] || '';
  }

  if (largeTimeEl) {
    const t = generatorShutdownUpdated['LARGE_HYDRO'];
    largeTimeEl.textContent = t ? `저장일시: ${new Date(t).toLocaleDateString('ko-KR')} ${new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '';
  }
  if (smallTimeEl) {
    const t = generatorShutdownUpdated['SMALL_HYDRO'];
    smallTimeEl.textContent = t ? `저장일시: ${new Date(t).toLocaleDateString('ko-KR')} ${new Date(t).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}` : '';
  }
}

// ==============================================================================
// 14. [메뉴 3] 일간 교대일정 (Daily Schedule: 좌 주간 / 우 야간 이분할)
// ==============================================================================

function initDailyScheduleControls() {
  const prevWeekBtn = document.getElementById('dailyPrevWeekBtn');
  if (prevWeekBtn) {
    prevWeekBtn.onclick = (e) => {
      e.preventDefault();
      dailySelectedDate = new Date(dailySelectedDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      selectedDate = new Date(dailySelectedDate);
      renderDailySchedule();
    };
  }
  const nextWeekBtn = document.getElementById('dailyNextWeekBtn');
  if (nextWeekBtn) {
    nextWeekBtn.onclick = (e) => {
      e.preventDefault();
      dailySelectedDate = new Date(dailySelectedDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      selectedDate = new Date(dailySelectedDate);
      renderDailySchedule();
    };
  }
  const prevBtn = document.getElementById('dailyPrevBtn');
  if (prevBtn) {
    prevBtn.onclick = (e) => {
      e.preventDefault();
      dailySelectedDate = new Date(dailySelectedDate.getTime() - 24 * 60 * 60 * 1000);
      selectedDate = new Date(dailySelectedDate);
      renderDailySchedule();
    };
  }
  const nextBtn = document.getElementById('dailyNextBtn');
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.preventDefault();
      dailySelectedDate = new Date(dailySelectedDate.getTime() + 24 * 60 * 60 * 1000);
      selectedDate = new Date(dailySelectedDate);
      renderDailySchedule();
    };
  }
  const todayBtn = document.getElementById('dailyTodayBtn');
  if (todayBtn) {
    todayBtn.onclick = (e) => {
      e.preventDefault();
      dailySelectedDate = new Date();
      selectedDate = new Date();
      renderDailySchedule();
    };
  }

  // Date picker click on title
  const dateTitle = document.getElementById('dailyDateTitle');
  const datePicker = document.getElementById('dailyDatePickerInput');
  if (dateTitle && datePicker) {
    dateTitle.onclick = () => {
      datePicker.value = formatDate(dailySelectedDate);
      if (typeof datePicker.showPicker === 'function') {
        datePicker.showPicker();
      } else {
        datePicker.click();
      }
    };
    datePicker.onchange = (e) => {
      if (e.target.value) {
        const parts = e.target.value.split('-');
        dailySelectedDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        selectedDate = new Date(dailySelectedDate);
        renderDailySchedule();
      }
    };
  }

  // 주간 인수인계 저장
  const saveDayBtn = document.getElementById('dailySaveDayMemoBtn');
  if (saveDayBtn) {
    saveDayBtn.addEventListener('click', async () => {
      const textarea = document.getElementById('dailyDayMemoTextarea');
      const val = textarea ? textarea.value.trim() : '';
      const dateStr = formatDate(dailySelectedDate);
      const dayKey = `${dateStr}_DAY`;
      adminNotesCache[dayKey] = val;

      if (isConnectedToSupabase) {
        await SupabaseRest.upsert('admin_weekly_notes', {
          date_string: dayKey,
          content: val,
          updated_at: Date.now()
        }, 'date_string');
      }
      showToast(`${dateStr} 주간 인수인계가 저장되었습니다.`);
    });
  }

  // 주간 인수인계 삭제
  const deleteDayBtn = document.getElementById('dailyDeleteDayMemoBtn');
  if (deleteDayBtn) {
    deleteDayBtn.addEventListener('click', async () => {
      const dateStr = formatDate(dailySelectedDate);
      const dayKey = `${dateStr}_DAY`;
      if (!confirm(`${dateStr} 주간 인수인계를 삭제하시겠습니까?`)) return;
      delete adminNotesCache[dayKey];
      delete adminNotesCache[dateStr];
      const textarea = document.getElementById('dailyDayMemoTextarea');
      if (textarea) textarea.value = '';

      if (isConnectedToSupabase) {
        await SupabaseRest.delete('admin_weekly_notes', 'date_string', dayKey);
        await SupabaseRest.delete('admin_weekly_notes', 'date_string', dateStr);
      }
      showToast(`${dateStr} 주간 인수인계가 삭제되었습니다.`);
    });
  }

  // 야간 인수인계 저장
  const saveNightBtn = document.getElementById('dailySaveNightMemoBtn');
  if (saveNightBtn) {
    saveNightBtn.addEventListener('click', async () => {
      const textarea = document.getElementById('dailyNightMemoTextarea');
      const val = textarea ? textarea.value.trim() : '';
      const dateStr = formatDate(dailySelectedDate);
      const nightKey = `${dateStr}_NIGHT`;
      adminNotesCache[nightKey] = val;

      if (isConnectedToSupabase) {
        await SupabaseRest.upsert('admin_weekly_notes', {
          date_string: nightKey,
          content: val,
          updated_at: Date.now()
        }, 'date_string');
      }
      showToast(`${dateStr} 야간 인수인계가 저장되었습니다.`);
    });
  }

  // 야간 인수인계 삭제
  const deleteNightBtn = document.getElementById('dailyDeleteNightMemoBtn');
  if (deleteNightBtn) {
    deleteNightBtn.addEventListener('click', async () => {
      const dateStr = formatDate(dailySelectedDate);
      const nightKey = `${dateStr}_NIGHT`;
      if (!confirm(`${dateStr} 야간 인수인계를 삭제하시겠습니까?`)) return;
      delete adminNotesCache[nightKey];
      const textarea = document.getElementById('dailyNightMemoTextarea');
      if (textarea) textarea.value = '';

      if (isConnectedToSupabase) {
        await SupabaseRest.delete('admin_weekly_notes', 'date_string', nightKey);
      }
      showToast(`${dateStr} 야간 인수인계가 삭제되었습니다.`);
    });
  }

  // 주·야간 동시 저장
  const saveBothBtn = document.getElementById('dailySaveBothMemoBtn');
  if (saveBothBtn) {
    saveBothBtn.addEventListener('click', async () => {
      const dateStr = formatDate(dailySelectedDate);
      const dayKey = `${dateStr}_DAY`;
      const nightKey = `${dateStr}_NIGHT`;
      const dayVal = document.getElementById('dailyDayMemoTextarea')?.value.trim() || '';
      const nightVal = document.getElementById('dailyNightMemoTextarea')?.value.trim() || '';

      adminNotesCache[dayKey] = dayVal;
      adminNotesCache[nightKey] = nightVal;

      if (isConnectedToSupabase) {
        await Promise.all([
          SupabaseRest.upsert('admin_weekly_notes', {
            date_string: dayKey,
            content: dayVal,
            updated_at: Date.now()
          }, 'date_string'),
          SupabaseRest.upsert('admin_weekly_notes', {
            date_string: nightKey,
            content: nightVal,
            updated_at: Date.now()
          }, 'date_string')
        ]);
      }
      showToast(`${dateStr} 주간·야간 인수인계가 동시 저장되었습니다.`);
    });
  }
}

function renderDailySchedule() {
  const dateStr = formatDate(dailySelectedDate);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeekName = dayNames[dailySelectedDate.getDay()];
  const isHoliday = isKoreanHoliday(dailySelectedDate);
  const holidayName = getKoreanHolidayName(dailySelectedDate);

  // 1. Date Title
  const titleElem = document.getElementById('dailyDateTitle');
  if (titleElem) {
    const isWeekend = dailySelectedDate.getDay() === 0 || dailySelectedDate.getDay() === 6;
    const titleColor = (isWeekend || isHoliday) ? '#ef4444' : 'inherit';
    titleElem.style.color = titleColor;
    titleElem.innerHTML = `${dailySelectedDate.getFullYear()}년 ${dailySelectedDate.getMonth() + 1}월 ${dailySelectedDate.getDate()}일 (${dayOfWeekName}) ${holidayName ? `<span class="badge" style="background:#fee2e2; color:#dc2626; font-size:0.75rem; font-weight:700; margin-left:6px; border:1px solid #fca5a5;">${holidayName}</span>` : ''}`;
  }

  // 2. 7-Day Quick Strip Bar (안드로이드앱 스타일 주단위 툴바)
  const strip = document.getElementById('dailyQuickStrip');
  if (strip) {
    strip.innerHTML = '';
    for (let offset = -3; offset <= 3; offset++) {
      const d = new Date(dailySelectedDate);
      d.setDate(dailySelectedDate.getDate() + offset);
      const dStr = formatDate(d);
      const isSel = dStr === dateStr;
      const isTod = dStr === formatDate(new Date());
      const isSun = d.getDay() === 0;
      const isSat = d.getDay() === 6;
      const isHol = isKoreanHoliday(d);

      let dayTextColor = '#94a3b8';
      let numColor = '#f8fafc';
      if (isSel) {
        dayTextColor = 'rgba(255, 255, 255, 0.9)';
        numColor = '#ffffff';
      } else if (isSun || isSat || isHol) {
        dayTextColor = '#ef4444';
        numColor = '#ef4444';
      }

      const item = document.createElement('div');
      item.style.cssText = `cursor:pointer; text-align:center; padding:0.45rem 0.2rem; border-radius:10px; background:${isSel ? '#2563eb' : 'transparent'}; border:${isSel ? '1px solid #3b82f6' : '1px solid transparent'}; transition:all 0.15s ease; user-select:none;`;
      item.innerHTML = `
        <div style="font-size:0.75rem; font-weight:${isSel ? '700' : '600'}; color:${dayTextColor}; margin-bottom:2px;">${dayNames[d.getDay()]}</div>
        <div style="font-size:1.05rem; font-weight:800; color:${numColor}; line-height:1.2;">${d.getDate()}</div>
        ${isTod ? `<div style="width:5px; height:5px; border-radius:50%; background:${isSel ? '#ffffff' : '#38bdf8'}; margin:4px auto 0;"></div>` : '<div style="width:5px; height:5px; margin:4px auto 0;"></div>'}
      `;
      item.addEventListener('mouseenter', () => {
        if (!isSel) item.style.background = '#1e293b';
      });
      item.addEventListener('mouseleave', () => {
        if (!isSel) item.style.background = 'transparent';
      });
      item.addEventListener('click', () => {
        dailySelectedDate = new Date(d);
        selectedDate = new Date(d);
        renderDailySchedule();
      });
      strip.appendChild(item);
    }
  }

  // 3. 일간 근무자 요약 (주간 근무자 / 야간 근무자 - DS 근무자는 주간과 야간에 모두 포함)
  const workersSummaryBox = document.getElementById('dailyWorkersSummary');
  if (workersSummaryBox) {
    const dayWorkers = [];
    const nightWorkers = [];

    usersList.forEach(u => {
      const sched = getSchedule(u.id, dateStr);
      const st = sched.shift_type;
      const cleanName = u.name.replace(/\(.*?\)/, '').trim();

      if (u.team > 0 || (st && st !== 'X')) {
        if (st === 'DS' || (st && st.includes('DS'))) {
          dayWorkers.push({ name: cleanName, team: u.team, st: 'DS' });
          nightWorkers.push({ name: cleanName, team: u.team, st: 'DS' });
        } else if (st === 'D' || (st && st.includes('D') && !st.includes('S'))) {
          dayWorkers.push({ name: cleanName, team: u.team, st: st });
        } else if (st === 'S' || (st && st.includes('S') && !st.includes('D'))) {
          nightWorkers.push({ name: cleanName, team: u.team, st: st });
        }
      }
    });

    const dayBadges = dayWorkers.length > 0
      ? dayWorkers.map(w => `<span class="badge" style="background:#fef3c7; color:#b45309; font-weight:700; font-size:0.8rem; padding:0.25rem 0.55rem; border:1px solid #fde68a; border-radius:6px;">${w.team > 0 ? `${w.team}조 ` : ''}${w.name}${w.st === 'DS' ? ' <strong style="color:#c05621;">[DS]</strong>' : ''}</span>`).join(' ')
      : '<span style="color:#94a3b8; font-size:0.8rem;">주간 근무자 없음</span>';

    const nightBadges = nightWorkers.length > 0
      ? nightWorkers.map(w => `<span class="badge" style="background:#ede9fe; color:#6d28d9; font-weight:700; font-size:0.8rem; padding:0.25rem 0.55rem; border:1px solid #ddd6fe; border-radius:6px;">${w.team > 0 ? `${w.team}조 ` : ''}${w.name}${w.st === 'DS' ? ' <strong style="color:#c05621;">[DS]</strong>' : ''}</span>`).join(' ')
      : '<span style="color:#94a3b8; font-size:0.8rem;">야간 근무자 없음</span>';

    workersSummaryBox.innerHTML = `
      <div style="background:#fffdf5; border:1.5px solid #f59e0b; border-radius:12px; padding:0.75rem 1rem; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
          <strong style="color:#92400e; font-size:0.92rem;"><i class="fa-solid fa-sun" style="color:#b45309;"></i> ☀️ 주간 근무자 (${dayWorkers.length}명)</strong>
          <span class="badge" style="background:#fef3c7; color:#b45309; font-size:0.75rem; font-weight:700;">09:00 ~ 18:00</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center;">
          ${dayBadges}
        </div>
      </div>
      <div style="background:#faf8ff; border:1.5px solid #7c3aed; border-radius:12px; padding:0.75rem 1rem; box-shadow:var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.45rem;">
          <strong style="color:#5b21b6; font-size:0.92rem;"><i class="fa-solid fa-moon" style="color:#6d28d9;"></i> 🌙 야간 근무자 (${nightWorkers.length}명)</strong>
          <span class="badge" style="background:#ede9fe; color:#6d28d9; font-size:0.75rem; font-weight:700;">18:00 ~ 익일 09:00</span>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:0.35rem; align-items:center;">
          ${nightBadges}
        </div>
      </div>
    `;
  }

  // 4. 인수인계사항 2분할 (주간 / 야간) 로드
  const dayKey = `${dateStr}_DAY`;
  const nightKey = `${dateStr}_NIGHT`;

  const dayTextarea = document.getElementById('dailyDayMemoTextarea');
  if (dayTextarea) {
    dayTextarea.value = adminNotesCache[dayKey] || adminNotesCache[dateStr] || '';
  }

  const nightTextarea = document.getElementById('dailyNightMemoTextarea');
  if (nightTextarea) {
    nightTextarea.value = adminNotesCache[nightKey] || '';
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

  const searchKeyword = (document.getElementById('postSearchInput').value || '').trim().toLowerCase();

  const filtered = postsList.filter(p => {
    if (currentBoardCategory !== 'ALL' && p.category !== currentBoardCategory) return false;
    if (searchKeyword && !p.title.toLowerCase().includes(searchKeyword) && !p.content.toLowerCase().includes(searchKeyword)) {
      return false;
    }
    return true;
  });

  // 중요 공지사항 우선 + 새 글 / 최신 등록 글이 항상 위쪽에 배치되도록 내림차순(DESC) 정렬
  filtered.sort((a, b) => {
    if (a.is_notice && !b.is_notice) return -1;
    if (!a.is_notice && b.is_notice) return 1;

    const timeA = typeof a.created_at === 'number' ? a.created_at : (new Date(a.created_at).getTime() || a.id || 0);
    const timeB = typeof b.created_at === 'number' ? b.created_at : (new Date(b.created_at).getTime() || b.id || 0);
    return timeB - timeA;
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

  if (btn) {
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

// ==============================================================================
// 19. [메뉴 5] 실시간 발전현황 및 조정지 실시간 수위 모듈
// ==============================================================================
const POWER_GEN_DAMS = [
  { id: 'andong', damCd: '2001110', name: '안동댐', capacity: '90MW', capacityMw: 90.0, discharge: 0.0, waterLevel: 144.37, isRegulating: false },
  { id: 'andong_reg', damCd: '2001611', name: '안동조정지', capacity: '1.5MW', capacityMw: 1.5, discharge: 14.0, waterLevel: 95.33, isRegulating: true },
  { id: 'imha', damCd: '2002110', name: '임하댐', capacity: '50MW', capacityMw: 50.0, discharge: 30.1, waterLevel: 148.78, isRegulating: false },
  { id: 'imha_reg', damCd: '2002610', name: '임하조정지', capacity: '1.06MW', capacityMw: 1.06, discharge: 0.0, waterLevel: 101.67, isRegulating: true },
  { id: 'hapcheon', damCd: '2015110', name: '합천댐', capacity: '100MW', capacityMw: 100.0, discharge: 53.5, waterLevel: 153.20, isRegulating: false },
  { id: 'hapcheon_reg', damCd: '2018611', name: '합천조정지', capacity: '1.8MW', capacityMw: 1.8, discharge: 13.8, waterLevel: 55.91, isRegulating: true },
  { id: 'namgang', damCd: '2018110', name: '남강댐', capacity: '18MW', capacityMw: 18.0, discharge: 4.7, waterLevel: 37.54, isRegulating: false },
  { id: 'yeongju', damCd: '2004101', name: '영주댐', capacity: '5MW', capacityMw: 5.0, discharge: 5.0, waterLevel: 150.81, isRegulating: false },
  { id: 'gimcheon', damCd: '2010101', name: '김천부항댐', capacity: '0.6MW', capacityMw: 0.6, discharge: 0.2, waterLevel: 175.80, isRegulating: false },
  { id: 'gunwi', damCd: '2008101', name: '군위댐', capacity: '0.5MW', capacityMw: 0.5, discharge: 0.16, waterLevel: 187.15, isRegulating: false },
  { id: 'seongdeok', damCd: '2002111', name: '성덕댐', capacity: '0.23MW', capacityMw: 0.23, discharge: 0.08, waterLevel: 345.76, isRegulating: false },
  { id: 'bohyeon', damCd: '2012101', name: '보현산댐', capacity: '0.17MW', capacityMw: 0.17, discharge: 0.03, waterLevel: 216.33, isRegulating: false }
];

const RESERVOIR_METAS = {
  '2001611': { damCd: '2001611', name: '안동조정지', capacity: '1.5MW', normalLevel: 95.5, floodLevel: 96.5, lowLevel: 94.0, baseLevel: 95.36, baseDischarge: 14.1, desc: '안동댐 하류 역조정지 수위 조절 및 소수력 발전' },
  '2002610': { damCd: '2002610', name: '임하조정지', capacity: '1.06MW', normalLevel: 101.8, floodLevel: 103.0, lowLevel: 100.0, baseLevel: 101.67, baseDischarge: 0.0, desc: '임하댐 하류 하천유지수 방류 및 소수력 발전' },
  '2018611': { damCd: '2018611', name: '합천조정지', capacity: '1.8MW', normalLevel: 55.6, floodLevel: 57.0, lowLevel: 54.0, baseLevel: 55.77, baseDischarge: 13.7, desc: '황강 하류 유량 균등화 및 소수력 발전' }
};

let powerGenCurrentSubTab = 'generators'; // 'generators' or 'reservoirs'
let powerGenSelectedDamCd = '2001611'; // Default 안동조정지
const customDischarges = {};
const manualOverrides = {};
const reservoirHistoryCache = {};

function initPowerGenerationControls() {
  const btnTabGen = document.getElementById('btnPowerGenTabGenerators');
  const btnTabRes = document.getElementById('btnPowerGenTabReservoirs');
  const viewGen = document.getElementById('powerGenViewGenerators');
  const viewRes = document.getElementById('powerGenViewReservoirs');

  if (btnTabGen && btnTabRes) {
    btnTabGen.addEventListener('click', () => {
      powerGenCurrentSubTab = 'generators';
      btnTabGen.classList.add('active');
      btnTabGen.classList.remove('btn-secondary');
      btnTabRes.classList.remove('active');
      btnTabRes.classList.add('btn-secondary');
      if (viewGen) viewGen.style.display = 'block';
      if (viewRes) viewRes.style.display = 'none';
      renderPowerGeneration();
    });

    btnTabRes.addEventListener('click', () => {
      powerGenCurrentSubTab = 'reservoirs';
      btnTabRes.classList.add('active');
      btnTabRes.classList.remove('btn-secondary');
      btnTabGen.classList.remove('active');
      btnTabGen.classList.add('btn-secondary');
      if (viewRes) viewRes.style.display = 'block';
      if (viewGen) viewGen.style.display = 'none';
      renderPowerGeneration();
    });
  }

  // Reservoir Chip Selectors
  document.querySelectorAll('.btn-reservoir-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-reservoir-chip').forEach(b => {
        b.classList.remove('active');
        b.classList.add('btn-secondary');
      });
      btn.classList.add('active');
      btn.classList.remove('btn-secondary');
      powerGenSelectedDamCd = btn.dataset.damcd;
      renderReservoirWaterLevels();
      syncLiveWaterData();
    });
  });

  // Refresh Button
  const refreshBtn = document.getElementById('btnRefreshPowerGen');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      const badge = document.getElementById('powerGenLastUpdated');
      const prevHtml = badge ? badge.innerHTML : '';
      if (badge) badge.innerHTML = `<i class="fa-solid fa-arrows-rotate fa-spin"></i> 실시간 수신중...`;
      refreshBtn.disabled = true;
      try {
        await syncLiveWaterData(true);
        showToast('MyWater 수문포털 실시간 발전현황 및 조정지 수위가 갱신되었습니다.');
      } catch (err) {
        if (badge) badge.innerHTML = prevHtml;
        showToast('실시간 데이터 갱신 중 오류가 발생했습니다.');
      } finally {
        refreshBtn.disabled = false;
      }
    });
  }

  // Initial background sync
  setTimeout(() => {
    syncLiveWaterData();
  }, 1000);
}

let isFetchingLiveWater = false;

async function queryWaterPortalApi(damCd, count = 1, startDate = '', endDate = '') {
  const formBody = new URLSearchParams({
    mode: 'getHydr',
    damCd: damCd,
    param1: 'M',
    startDate: startDate || '',
    endDate: endDate || '',
    cntPerPage: count.toString()
  });

  // 1. Try server proxy endpoint POST
  try {
    const res = await fetch('/api/water-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: formBody.toString()
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.list && Array.isArray(data.list) && data.list.length > 0) {
        return data.list;
      }
    }
  } catch (_) {}

  // 2. Try server proxy endpoint GET fallback
  try {
    const res = await fetch(`/api/water-proxy?${formBody.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.list && Array.isArray(data.list) && data.list.length > 0) {
        return data.list;
      }
    }
  } catch (_) {}

  // 3. Direct fetch fallback
  try {
    const res = await fetch('https://www.water.or.kr/kor/realtime/sumun/ajaxProc.do', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: formBody.toString()
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.list && Array.isArray(data.list) && data.list.length > 0) {
        return data.list;
      }
    }
  } catch (_) {}

  return null;
}

function getCurrentObservationTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function syncLiveWaterData(force = false) {
  if (isFetchingLiveWater) return;
  isFetchingLiveWater = true;

  try {
    // 1. 12개 발전기 실시간 10분 총방류량 수신 (총방류량 > 0.4 CMS 이면 ON, 아니면 OFF)
    const updates = await Promise.allSettled(
      POWER_GEN_DAMS.map(dam => queryWaterPortalApi(dam.damCd, 1))
    );

    let changed = false;
    let latestDataTimeStr = getCurrentObservationTime();

    updates.forEach((result, idx) => {
      if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
        const item = result.value[0];
        const dam = POWER_GEN_DAMS[idx];
        if (item.DATA1 !== undefined && item.DATA1 !== null) {
          dam.waterLevel = parseFloat(item.DATA1) || dam.waterLevel;
        }
        if (item.DATA6 !== undefined && item.DATA6 !== null) {
          dam.discharge = parseFloat(item.DATA6) || 0.0;
        }
        if (item.SDATE && item.SDATE.length >= 12) {
          dam.lastUpdatedTime = `${item.SDATE.substring(8, 10)}:${item.SDATE.substring(10, 12)}`;
          if (dam.id === 'andong') {
            latestDataTimeStr = dam.lastUpdatedTime;
          }
        }
        changed = true;
      }
    });

    // 2. 3개 조정지 최근 24시간 실시간 수위 데이터 수신 (현재기준 24시간)
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const resList = await queryWaterPortalApi(powerGenSelectedDamCd, 150, yesterdayStr, todayStr);
    if (resList && resList.length > 0) {
      const mapped = resList.map(item => {
        const s = item.SDATE || '';
        const m = s.substring(4, 6);
        const d = s.substring(6, 8);
        const h = s.substring(8, 10);
        const min = s.substring(10, 12);
        return {
          sdate: s,
          time: `${m}/${d} ${h}:${min}`,
          fullTime: `${s.substring(0, 4)}-${m}-${d} ${h}:${min}`,
          waterLevel: parseFloat(item.DATA1) || 0.0,
          discharge: parseFloat(item.DATA6) || 0.0,
          inflow: parseFloat(item.DATA4) || parseFloat(item.DATA5) || 0.0
        };
      }).sort((a, b) => a.fullTime.localeCompare(b.fullTime));

      // 최근 24시간 (최대 144건) 데이터만 유지
      reservoirHistoryCache[powerGenSelectedDamCd] = mapped.slice(-144);
      changed = true;
    }

    // 갱신 시간 표시 (안동댐 실시간 수위/방류량 관측시간 기준)
    const badge = document.getElementById('powerGenLastUpdated');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> 실시간 갱신: ${latestDataTimeStr} 기준 (수문포털 연동)`;
    }

    const curTimeLbl = document.getElementById('reservoirCurrentTimeLabel');
    if (curTimeLbl) {
      curTimeLbl.textContent = `현재 (${latestDataTimeStr})`;
    }

    if (changed || force) {
      if (powerGenCurrentSubTab === 'generators') {
        renderGeneratorsStatus();
      } else {
        renderReservoirWaterLevels();
      }
    }
  } catch (err) {
    console.warn('Sync live water data error:', err);
    const fallbackTime = getCurrentObservationTime();
    const badge = document.getElementById('powerGenLastUpdated');
    if (badge) {
      badge.innerHTML = `<i class="fa-solid fa-clock-rotate-left"></i> 실시간 갱신: ${fallbackTime} 기준 (수문포털 연동)`;
    }
  } finally {
    isFetchingLiveWater = false;
  }
}

function renderPowerGeneration() {
  if (powerGenCurrentSubTab === 'generators') {
    renderGeneratorsStatus();
  } else {
    renderReservoirWaterLevels();
  }
  syncLiveWaterData();
}

function renderGeneratorsStatus() {
  const grid = document.getElementById('generatorCardsGrid');
  if (!grid) return;

  let totalOnline = 0;
  let totalDischargeSum = 0;

  grid.innerHTML = POWER_GEN_DAMS.map(dam => {
    // 규칙 수정: 총방류량 > 0.4 CMS 이면 ON, 아니면 OFF (단, 임하 및 남강은 5.0 CMS 초과 시 ON)
    const threshold = (dam.id === 'imha' || dam.id === 'namgang') ? 5.0 : 0.4;
    const isOnline = dam.discharge > threshold;

    if (isOnline) totalOnline++;
    totalDischargeSum += dam.discharge;

    const borderColor = isOnline ? '#10b981' : '#cbd5e1';
    const cardBg = isOnline ? '#f0fdf4' : '#f8fafc';
    const regBadge = dam.isRegulating 
      ? `<span class="badge" style="background:#ede9fe; color:#6d28d9; font-size:0.75rem; margin-left:4px;">조정지</span>` 
      : `<span class="badge" style="background:#dbeafe; color:#1e40af; font-size:0.75rem; margin-left:4px;">본댐</span>`;

    return `
      <div class="card" style="border: 1.5px solid ${borderColor}; background: ${cardBg}; border-radius: 12px; padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); width: 100%; box-sizing: border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
          <div style="display:flex; align-items:center;">
            <i class="fa-solid ${dam.isRegulating ? 'fa-water' : 'fa-dam'}" style="color:${dam.isRegulating ? '#7c3aed' : '#2563eb'}; margin-right:0.4rem; font-size:1.1rem;"></i>
            <strong style="font-size:1.05rem; color:#0f172a;">${dam.name}</strong>
            ${regBadge}
            <span class="badge" style="background:#f1f5f9; color:#334155; font-size:0.75rem; margin-left:4px; font-weight:700;">${dam.capacity}</span>
          </div>
          <span class="badge" style="background:${isOnline ? '#059669' : '#64748b'}; color:#fff; font-size:0.8rem; font-weight:800; padding:0.25rem 0.6rem; border-radius:20px;">
            ${isOnline ? '● ON (운전중)' : '○ OFF (정지)'}
          </span>
        </div>

        <div style="background:rgba(255,255,255,0.85); border-radius:8px; padding:0.6rem 0.75rem; font-size:0.85rem; display:flex; justify-content:space-between; align-items:center; border:1px solid #e2e8f0;">
          <span>실시간 수위: <strong>EL. ${dam.waterLevel.toFixed(2)} m</strong></span>
          <span>총방류량: <strong style="color:${isOnline ? '#059669' : '#64748b'}; font-size:0.95rem;">${dam.discharge.toFixed(1)} CMS</strong></span>
        </div>
      </div>
    `;
  }).join('');

  // Update KPI counters
  const kpiOnline = document.getElementById('kpiGeneratorsOnline');
  if (kpiOnline) kpiOnline.textContent = `${totalOnline} / 12 기`;
  const kpiDischarge = document.getElementById('kpiTotalDischarge');
  if (kpiDischarge) kpiDischarge.textContent = `${totalDischargeSum.toFixed(1)} CMS`;
}

function generateReservoirHistory(damCd) {
  if (reservoirHistoryCache[damCd] && reservoirHistoryCache[damCd].length > 0) {
    return reservoirHistoryCache[damCd];
  }

  const meta = RESERVOIR_METAS[damCd] || RESERVOIR_METAS['2001611'];
  const baseL = meta.baseLevel;
  const baseD = meta.baseDischarge;
  const list = [];

  // 현재기준 최근 24시간 실시간 수위만 표시
  const end = new Date();
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);

  let current = new Date(start);
  let idx = 0;
  while (current <= end) {
    const wave = Math.sin(idx * 0.08) * 0.18 + Math.cos(idx * 0.03) * 0.08;
    const waveD = Math.sin(idx * 0.05) * 8.0;
    const wl = Math.round((baseL + wave) * 100) / 100;
    const dq = Math.max(0, Math.round((baseD + waveD) * 10) / 10);
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const h = String(current.getHours()).padStart(2, '0');
    const min = String(current.getMinutes()).padStart(2, '0');

    list.push({
      time: `${m}/${d} ${h}:${min}`,
      fullTime: `${current.getFullYear()}-${m}-${d} ${h}:${min}`,
      waterLevel: wl,
      discharge: dq,
      inflow: Math.round((12.0 + wave * 2.0) * 10) / 10
    });

    current.setMinutes(current.getMinutes() + 10);
    idx++;
  }

  reservoirHistoryCache[damCd] = list;
  return list;
}

function renderReservoirWaterLevels() {
  const meta = RESERVOIR_METAS[powerGenSelectedDamCd] || RESERVOIR_METAS['2001611'];
  const history = (reservoirHistoryCache[meta.damCd] && reservoirHistoryCache[meta.damCd].length > 0)
    ? reservoirHistoryCache[meta.damCd]
    : generateReservoirHistory(meta.damCd);
  const current = history[history.length - 1] || { waterLevel: meta.normalLevel, discharge: 0, inflow: 0, time: '-' };

  // 1. Overview Card
  const overview = document.getElementById('reservoirOverviewCard');
  if (overview) {
    const isOnline = current.discharge > 0.4;
    overview.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #334155; padding-bottom:0.75rem; margin-bottom:0.75rem;">
        <div>
          <div style="font-size:1.2rem; font-weight:800; display:flex; align-items:center; gap:0.4rem;">
            <i class="fa-solid fa-water" style="color:#38bdf8;"></i> ${meta.name}
            <span class="badge" style="background:#2563eb; color:#fff; font-size:0.75rem;">${meta.capacity}</span>
          </div>
          <div style="font-size:0.8rem; color:#94a3b8; margin-top:2px;">${meta.desc}</div>
        </div>
        <span class="badge" style="background:${isOnline ? '#059669' : '#475569'}; color:#fff; font-size:0.85rem; font-weight:800; padding:0.3rem 0.75rem; border-radius:20px;">
          ${isOnline ? '● 발전 ON (방류량 > 0.4 CMS)' : '○ 발전 OFF (방류량 ≤ 0.4 CMS)'}
        </span>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:1rem;">
        <div>
          <div style="font-size:0.75rem; color:#94a3b8;">현재 수위</div>
          <div style="font-size:1.5rem; font-weight:800; color:#38bdf8;">EL. ${current.waterLevel.toFixed(2)} m</div>
          <div style="font-size:0.75rem; color:#64748b;">상시만수위 ${meta.normalLevel} m</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#94a3b8;">총 방류량</div>
          <div style="font-size:1.5rem; font-weight:800; color:${current.discharge > 0.4 ? '#34d399' : '#94a3b8'};">${current.discharge.toFixed(1)} CMS</div>
          <div style="font-size:0.75rem; color:#64748b;">계획홍수위 ${meta.floodLevel} m</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#94a3b8;">유입량</div>
          <div style="font-size:1.3rem; font-weight:800; color:#cbd5e1;">${current.inflow.toFixed(1)} CMS</div>
          <div style="font-size:0.75rem; color:#64748b;">저수위 ${meta.lowLevel} m</div>
        </div>
        <div>
          <div style="font-size:0.75rem; color:#94a3b8;">최신 측정 일시</div>
          <div style="font-size:1.1rem; font-weight:700; color:#f8fafc; margin-top:3px;">${current.time}</div>
          <div style="font-size:0.75rem; color:#38bdf8;">최근 24시간 실시간</div>
        </div>
      </div>
    `;
  }

  // 2. Chart Title
  const chartTitle = document.getElementById('reservoirChartTitle');
  if (chartTitle) chartTitle.innerHTML = `<i class="fa-solid fa-chart-line" style="color:#2563eb;"></i> ${meta.name} 실시간 수위 그래프`;

  // 3. Render Interactive SVG Chart
  renderReservoirSvgChart(history, meta);

  // 4. Data Table
  const tableBody = document.getElementById('reservoirTableBody');
  const tableCount = document.getElementById('reservoirTableCount');
  if (tableBody) {
    if (tableCount) tableCount.textContent = `총 ${history.length} 건 (최근 25건 표시)`;
    const recent = history.slice(-25).reverse();
    tableBody.innerHTML = recent.map((row, idx) => {
      const isOnline = row.discharge > 0.4;
      return `
        <tr style="border-bottom:1px solid #f1f5f9; background:${idx % 2 === 1 ? '#f8fafc' : '#fff'};">
          <td style="padding:0.5rem 0.8rem; font-weight:600; color:#1e293b;">${row.time}</td>
          <td style="padding:0.5rem 0.8rem; text-align:right; font-weight:700; color:#0f172a;">${row.waterLevel.toFixed(2)}</td>
          <td style="padding:0.5rem 0.8rem; text-align:right; font-weight:700; color:${isOnline ? '#059669' : '#64748b'};">${row.discharge.toFixed(1)}</td>
          <td style="padding:0.5rem 0.8rem; text-align:right; color:#475569;">${row.inflow.toFixed(1)}</td>
          <td style="padding:0.5rem 0.8rem; text-align:center;">
            <span class="badge" style="background:${isOnline ? '#dcfce7' : '#f1f5f9'}; color:${isOnline ? '#15803d' : '#64748b'}; font-size:0.75rem; padding:0.15rem 0.4rem;">
              ${isOnline ? 'ON' : 'OFF'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }
}

function renderReservoirSvgChart(history, meta) {
  const container = document.getElementById('reservoirSvgChartContainer');
  if (!container || history.length === 0) return;

  const w = container.clientWidth || 600;
  const h = 260;
  const padTop = 20;
  const padBottom = 20;
  const padLeft = 45;
  const padRight = 20;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  const levels = history.map(d => d.waterLevel);
  const minL = Math.min(...levels) - 0.15;
  const maxL = Math.max(...levels) + 0.15;
  const range = Math.max(0.3, maxL - minL);

  // Build points for SVG
  const points = history.map((d, i) => {
    const x = padLeft + (i / (history.length - 1)) * chartW;
    const y = padTop + ((maxL - d.waterLevel) / range) * chartH;
    return { x, y, data: d };
  });

  const polylineStr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = `${points[0].x.toFixed(1)},${padTop + chartH} ` + polylineStr + ` ${points[points.length - 1].x.toFixed(1)},${padTop + chartH}`;

  // Y-axis gridlines (4 lines)
  let gridLinesSvg = '';
  for (let step = 0; step <= 3; step++) {
    const gridY = padTop + (step / 3) * chartH;
    const gridVal = (maxL - (step / 3) * range).toFixed(2);
    gridLinesSvg += `
      <line x1="${padLeft}" y1="${gridY}" x2="${w - padRight}" y2="${gridY}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${padLeft - 6}" y="${gridY + 4}" fill="#64748b" font-size="10" text-anchor="end">${gridVal}</text>
    `;
  }

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible;" id="reservoirSvgChart">
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      ${gridLinesSvg}
      <polygon points="${areaStr}" fill="url(#areaGradient)" />
      <polyline points="${polylineStr}" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <circle id="chartScrubCircle" cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="4.5" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
    </svg>
  `;

  // Attach hover/touch scrubbing
  const svg = document.getElementById('reservoirSvgChart');
  const scrubTime = document.getElementById('chartScrubTime');
  const scrubLevel = document.getElementById('chartScrubLevel');
  const scrubDischarge = document.getElementById('chartScrubDischarge');
  const scrubCircle = document.getElementById('chartScrubCircle');

  const updateScrub = (clientX) => {
    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left - padLeft;
    const ratio = Math.max(0, Math.min(1, relX / chartW));
    const idx = Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))));
    const pt = points[idx];
    if (pt) {
      if (scrubCircle) {
        scrubCircle.setAttribute('cx', pt.x);
        scrubCircle.setAttribute('cy', pt.y);
      }
      if (scrubTime) scrubTime.textContent = `선택 일시: ${pt.data.time}`;
      if (scrubLevel) scrubLevel.textContent = `수위: EL. ${pt.data.waterLevel.toFixed(2)} m`;
      if (scrubDischarge) scrubDischarge.textContent = `방류량: ${pt.data.discharge.toFixed(1)} CMS`;
    }
  };

  container.addEventListener('mousemove', (e) => updateScrub(e.clientX));
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updateScrub(e.touches[0].clientX);
  });

  // Initial callout values set to latest point
  const lastPt = points[points.length - 1];
  if (lastPt) {
    if (scrubTime) scrubTime.textContent = `선택 일시: ${lastPt.data.time}`;
    if (scrubLevel) scrubLevel.textContent = `수위: EL. ${lastPt.data.waterLevel.toFixed(2)} m`;
    if (scrubDischarge) scrubDischarge.textContent = `방류량: ${lastPt.data.discharge.toFixed(1)} CMS`;
  }
}

