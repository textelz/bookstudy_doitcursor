import express from 'express'
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js'

const router = express.Router()

// 주문 생성
router.post('/', createOrder)

// 주문 상세 조회
router.get('/:orderId', getOrderById)

// 관리자용 주문 목록 조회
router.get('/admin/list', getOrders)

// 주문 상태 변경
router.patch('/admin/:orderId/status', updateOrderStatus)

// 주문 통계 조회
router.get('/admin/stats', getOrderStats)

export default router

