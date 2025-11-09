import express from 'express'
import { getMenus, getMenusWithStock, updateStock } from '../controllers/menuController.js'

const router = express.Router()

// 일반 사용자용 메뉴 목록 조회
router.get('/', getMenus)

// 관리자용 메뉴 목록 조회 (재고 포함)
router.get('/admin', getMenusWithStock)

// 재고 수량 수정
router.patch('/admin/:menuId/stock', updateStock)

export default router

