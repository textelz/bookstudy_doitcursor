# 환경 변수 설정 가이드

## .env 파일 생성

`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 서버 포트
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cozy_coffee
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_SSL=false

# 환경 설정
NODE_ENV=development
```

## 데이터베이스 설정

### 1. PostgreSQL 데이터베이스 생성

PostgreSQL에 접속하여 데이터베이스를 생성하세요:

```sql
-- PostgreSQL에 접속 (터미널에서)
psql -U postgres

-- 데이터베이스 생성
CREATE DATABASE cozy_coffee;

-- 데이터베이스 확인
\l

-- 생성한 데이터베이스로 전환
\c cozy_coffee
```

### 2. .env 파일 수정

생성한 데이터베이스 정보에 맞게 `.env` 파일을 수정하세요:

- `DB_NAME`: 생성한 데이터베이스 이름 (예: `cozy_coffee`)
- `DB_USER`: PostgreSQL 사용자 이름 (기본: `postgres`)
- `DB_PASSWORD`: PostgreSQL 비밀번호
- `DB_HOST`: 데이터베이스 호스트 (기본: `localhost`)
- `DB_PORT`: 데이터베이스 포트 (기본: `5432`)
- `DB_SSL`: Render와 같이 SSL이 필요한 환경에서는 `true`로 설정 (기본은 `false`)

### 3. 연결 테스트

서버를 실행하면 자동으로 데이터베이스 연결을 테스트합니다:

```bash
cd server
npm run dev
```

연결 성공 시 다음과 같은 메시지가 표시됩니다:
```
✅ 데이터베이스 연결 성공: 2024-01-15T10:30:00.000Z
🚀 서버가 포트 3000에서 실행 중입니다.
```

## 문제 해결

### 데이터베이스 연결 실패 시

1. **PostgreSQL이 실행 중인지 확인**
   ```bash
   # macOS
   brew services list
   # 또는
   pg_isready
   ```

2. **데이터베이스가 존재하는지 확인**
   ```sql
   psql -U postgres -l
   ```

3. **사용자 권한 확인**
   ```sql
   psql -U postgres
   \du
   ```

4. **.env 파일의 정보가 올바른지 확인**
   - DB_NAME, DB_USER, DB_PASSWORD가 정확한지 확인
   - Render 등의 클라우드 DB를 사용하는 경우 `DB_SSL=true`로 설정되어 있는지 확인

5. **포트가 올바른지 확인**
   - 기본 PostgreSQL 포트는 5432입니다
   - 다른 포트를 사용하는 경우 .env 파일에서 수정

