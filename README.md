# 낙동강 발전관리과 4조3교대 근무포털 (Node.js & Python Antigravity Web Server)

JavaScript, HTML5, CSS3 및 Supabase를 연동하여 제작된 **낙동강 발전관리과 4조3교대 근무일정 및 대교직 관리 웹 포털**입니다.

---

## 🌟 주요 기능 및 4조 3교대 체계

- **4조 3교대 순환 규칙 (4일 주기):**
  - **휴무 (X) &rarr; 주간 (D: 09:00~18:00) &rarr; 휴무 (X) &rarr; 야간 (S: 18:00~익일 09:00)**
  - 1조: 오프셋 0 (X - D - X - S)
  - 2조: 오프셋 1 (D - X - S - X)
  - 3조: 오프셋 2 (X - S - X - D)
  - 4조: 오프셋 3 (S - X - D - X)
  - **전일자 자동 연산 엔진**: 어떤 년도나 월(과거/현재/미래)을 조회하더라도 공백 없이 100% 실시간 자동 계산 및 표시됩니다.
  - **Supabase DB 오버레이**: 승인된 대직/교직 및 사용자 변경 사항은 원격 DB에서 실시간 오버레이 반영됩니다.

1. **📅 개인 캘린더 (My Calendar)**
   - 월별 개인 근무 일정표 (주간 D, 야간 S, 휴무 X, 주야연속 DS, 연차 H)
   - 월간 총 근무 시간, 주간/야간/휴무 일수 실시간 자동 통계 집계
   - 날짜 클릭 시 해당 일자의 근무시간, 휴게시간, 인수인계 메모 상세 확인

2. **👥 팀 일정표 (Team Schedule)**
   - **전월 1주 + 당월 전체 + 익월 1주** 연속 캘린더 뷰
   - 선택한 일자의 조원별 근무 편성 (주간/야간/휴무) 실시간 확인
   - **대직자(🔀 대직자)** 및 **교직자(🔄 교직자)** 전용 뱃지 자동 표출
   - 근무 형태별(전체/주간/야간/휴무) 퀵 필터링

3. **🔄 대교직 신청 및 승인 관리 (Shift Requests)**
   - 대직(대신 근무), 교직(맞교환), 연차 신청서 온라인 작성 및 제출
   - 상태별(대기중, 승인완료, 반려됨) 탭 구분
   - 관리자 및 대상자의 원클릭 승인/반려 기능 & 근무일정표 실시간 자동 반영

4. **📝 업무 메모 / 주간 대시보드 (Admin Weekly Notes)**
   - 주간(월~일) 일자별 조원 근무 현황
   - 발전기 점검, 인수인계 사항 등 일자별 업무 메모 작성, 저장, 삭제
   - **Supabase DB (`admin_weekly_notes`) 실시간 동기화 (`on_conflict=date_string`)**

5. **📢 소통 게시판 (Bulletin Board)**
   - 카테고리별(공지사항, 대교직, 일반, 건의) 게시글 작성 및 검색
   - 게시글별 실시간 댓글 작성 및 조회 기능 (`posts`, `comments` 테이블 연동)

6. **🚀 Antigravity 무중력 모드 (Interactive Physics)**
   - 상단 **"Antigravity 모드"** 버튼 클릭 시 마우스 반발 무중력 파티클 물리 효과 및 부유(Floating) 애니메이션 동작

---

## 🚀 웹서버 실행 방법

### 방법 1: Node.js 웹서버 실행 (`server.js`) - 가장 추천!
외부 패키지 설치(`npm install`)가 필요 없는 **순수 Node.js 내장 모듈 기반 웹서버**입니다.

```bash
# web 디렉터리로 이동
cd web

# Node.js 서버 실행
node server.js
# 또는
npm start
```
- 접속 주소: **`http://localhost:8080`** (브라우저가 자동으로 실행됩니다)
- 포트 변경 시: `PORT=3000 node server.js`

---

### 방법 2: Python Antigravity 웹서버 실행 (`server.py`)
파이썬 내장 `antigravity` 모듈과 전용 HTTP 핸들러를 사용합니다.

```bash
cd web

python3 server.py
# 또는 특정 포트 지정
python server.py --port 8080
```

---

### 방법 3: 브라우저에서 직접 열기
별도 서버 실행 없이 `web/index.html` 파일을 크롬, 엣지, 사파리 등의 브라우저로 더블 클릭하여 바로 열어도 모든 4조3교대 근무표와 Supabase 통신이 완벽하게 작동합니다.

---

## 🔒 보안 및 데이터베이스 환경 변수 설정 (GitHub 공유 안내)

본 프로젝트는 **GitHub 공유 및 오픈소스 보안 표준**을 준수하여 작성되었습니다. 소스코드에 API 키가 포함되어 있지 않으며, 아래의 안전한 방식으로 연동됩니다.

### 1) 로컬 개발 환경 (.env 연동 - 권장)
1. 프로젝트 루트의 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다:
   ```bash
   cp .env.example .env
   ```
2. `.env` 파일에 본인의 Supabase 접속 정보를 입력합니다:
   ```properties
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```
3. `node server.js` 또는 `python3 server.py` 실행 시 서버가 `.env` 파일을 안전하게 읽어 자동으로 연동합니다. (`.env` 파일은 `.gitignore`에 등록되어 GitHub에 커밋되지 않습니다)

### 2) 정적 웹 호스팅 환경 (Netlify, Vercel, GitHub Pages)
- 서버 실행 없이 웹페이지에 접속한 경우, 상단 우측의 **`Supabase 상태 뱃지 / ⚙️ 설정 아이콘`**을 클릭하여 본인의 Supabase URL과 Anon Key를 입력하면 브라우저 로컬 저장소(`localStorage`)에만 안전하게 보관되어 동작합니다.

---

## 👥 사원 명단 (4조 3교대):
- **1조**: 장성훈(대리), 김수영(대리)
- **2조**: 황석구(대리), 박준기(대리)
- **3조**: 이채규(과장), 전다솜(대리)
- **4조**: 박재환(대리), 윤지원(대리)
- **관리자**: 김선영, 이상은
