# 커피 주문 앱 - 백엔드 서버

Express.js와 PostgreSQL을 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cozy_coffee
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false
NODE_ENV=development
```

자세한 설정 방법은 `ENV_SETUP.md` 파일을 참고하세요.

> Render와 같은 클라우드 PostgreSQL을 사용할 경우 `DB_SSL=true`로 설정해야 합니다.

## 데이터베이스 설정

PostgreSQL 데이터베이스를 생성하고 연결 정보를 `.env` 파일에 설정하세요.

```sql
CREATE DATABASE cozy_coffee;
```

## 서버 실행

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 기본
- `GET /` - 서버 정보
- `GET /health` - 헬스 체크

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회 (일반 사용자)
- `GET /api/admin/menus` - 메뉴 목록 조회 (관리자, 재고 포함)
- `PATCH /api/admin/menus/:menuId/stock` - 재고 수량 수정

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders/:orderId` - 주문 상세 조회
- `GET /api/admin/orders` - 주문 목록 조회 (관리자)
- `PATCH /api/admin/orders/:orderId/status` - 주문 상태 변경
- `GET /api/admin/orders/stats` - 주문 통계 조회

자세한 API 명세는 `docs/PRD_Backend.md`를 참고하세요.

## 프로젝트 구조

```
server/
├── src/
│   ├── app.js              # Express 앱 설정
│   ├── server.js           # 서버 시작 파일
│   ├── config/             # 설정 파일
│   ├── routes/             # 라우트 파일
│   ├── controllers/        # 컨트롤러
│   ├── models/            # 데이터 모델
│   └── middleware/        # 미들웨어
├── package.json
├── .env.example
└── README.md
```

