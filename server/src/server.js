import app from './app.js'
import dotenv from 'dotenv'
import pool from './config/database.js'
import { initDatabase } from './database/init.js'

// 환경 변수 로드
dotenv.config()

const PORT = process.env.PORT || 3000

// 데이터베이스 연결 테스트
async function testDatabaseConnection() {
  try {
    const result = await pool.query('SELECT NOW() as current_time')
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0].current_time)
    return true
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message)
    console.error('데이터베이스 연결 정보를 확인하세요.')
    console.error('환경 변수:', {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'cozy_coffee',
      user: process.env.DB_USER || 'postgres'
    })
    return false
  }
}

// 서버 시작
async function startServer() {
  // 데이터베이스 연결 테스트
  const dbConnected = await testDatabaseConnection()
  
  if (!dbConnected) {
    console.warn('⚠️  데이터베이스 연결에 실패했지만 서버는 계속 실행됩니다.')
    console.warn('데이터베이스 연결을 확인하고 .env 파일을 설정하세요.')
  } else {
    // 데이터베이스 초기화 (스키마 생성)
    try {
      await initDatabase()
    } catch (error) {
      console.error('데이터베이스 초기화 중 오류:', error.message)
    }
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 서버가 포트 ${PORT}에서 실행 중입니다.`)
    console.log(`📍 http://localhost:${PORT}`)
    console.log(`💚 Health check: http://localhost:${PORT}/health\n`)
  })
}

startServer()

