import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// 환경 변수 로드
dotenv.config()

const app = express()

// 미들웨어 설정
app.use(cors()) // CORS 설정 (프런트엔드와 통신을 위해)
app.use(express.json()) // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 요청 본문 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  })
})

// Health check 엔드포인트
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// API 라우트
import menuRoutes from './routes/menuRoutes.js'
import orderRoutes from './routes/orderRoutes.js'

app.use('/api/menus', menuRoutes)
app.use('/api/orders', orderRoutes)

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: '요청한 리소스를 찾을 수 없습니다.'
    }
  })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || '서버 내부 오류가 발생했습니다.'
    }
  })
})

export default app

