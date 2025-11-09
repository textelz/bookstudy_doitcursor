import pool from '../config/database.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 데이터베이스 초기화 함수
export async function initDatabase() {
  try {
    // schema.sql 파일 읽기
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')

    // SQL 실행
    await pool.query(schemaSQL)
    console.log('✅ 데이터베이스 스키마가 생성되었습니다.')
  } catch (error) {
    if (error.code === '42P07') {
      // 테이블이 이미 존재하는 경우
      console.log('ℹ️  데이터베이스 테이블이 이미 존재합니다.')
    } else {
      console.error('❌ 데이터베이스 초기화 실패:', error.message)
      throw error
    }
  }
}

