# bookstudy_doitcursor
Do it! 커서로 시작하는 AI 코딩 입문

## 프로젝트 구조

```
bookstudy_doitcursor/
├── ui/              # 프런트엔드 (Vite + React)
├── server/           # 백엔드 (Node.js + Express)
├── docs/            # 프로젝트 문서 (PRD 등)
└── images/          # 이미지 파일
```

## 프런트엔드 실행 방법

### 사전 요구사항
- Node.js (v18 이상 권장)
- npm (Node.js와 함께 설치됨)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   cd ui
   npm install
   ```

2. **개발 서버 실행**
   ```bash
   npm run dev
   ```

3. **브라우저에서 확인**
   - 개발 서버가 실행되면 터미널에 표시된 URL로 접속 (기본: `http://localhost:5173`)

### 기타 명령어

- **프로덕션 빌드**: `npm run build`
- **빌드 미리보기**: `npm run preview`

자세한 내용은 `ui/README.md`를 참고하세요.

### 배포 시 주의 사항
- Vite 환경 변수는 `VITE_` 접두어가 있는 값만 프런트엔드 코드에서 접근 가능합니다.
- Render 등 배포 환경에서 **`VITE_API_URL`** 값을 반드시 설정해야 백엔드 API와 통신할 수 있습니다.
  ```env
  VITE_API_URL=https://your-backend-service.onrender.com
  ```
  (로컬 개발 시에는 UI 폴더의 `.env` 파일에 동일한 값을 추가하면 됩니다.)

## 백엔드 실행 방법

### 사전 요구사항
- Node.js (v18 이상 권장)
- PostgreSQL (데이터베이스)

### 설치 및 실행

1. **의존성 설치**
   ```bash
   cd server
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   # .env 파일을 열어 데이터베이스 연결 정보 수정
   ```

3. **데이터베이스 생성**
   ```sql
   CREATE DATABASE cozy_coffee;
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **서버 확인**
   - 서버가 실행되면 `http://localhost:3000`에서 확인 가능
   - Health check: `http://localhost:3000/health`

자세한 내용은 `server/README.md`를 참고하세요.
