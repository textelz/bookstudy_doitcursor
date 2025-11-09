import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// PostgreSQL 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'cozy_coffee',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 연결 이벤트 핸들러
pool.on('connect', () => {
  console.log('📊 데이터베이스 연결 풀에 새 클라이언트가 추가되었습니다.')
})

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 풀 오류:', err)
})

// 연결 종료 시 정리
process.on('SIGINT', async () => {
  console.log('\n서버 종료 중...')
  await pool.end()
  console.log('데이터베이스 연결이 종료되었습니다.')
  process.exit(0)
})

export default pool
