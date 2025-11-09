import { Order } from '../models/Order.js'
import { Menu } from '../models/Menu.js'

export const createOrder = async (req, res, next) => {
  try {
    const { items, total_price } = req.body

    // 입력 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: '주문 정보가 올바르지 않습니다.'
        }
      })
    }

    if (!total_price || typeof total_price !== 'number') {
      return res.status(400).json({
        success: false,
        error: {
          message: '주문 정보가 올바르지 않습니다.'
        }
      })
    }

    // 재고 확인
    for (const item of items) {
      const menu = await Menu.findById(item.menu_id)
      if (!menu) {
        return res.status(400).json({
          success: false,
          error: {
            message: `메뉴를 찾을 수 없습니다: 메뉴 ID ${item.menu_id}`
          }
        })
      }

      if (menu.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            message: '재고가 부족합니다.',
            details: {
              menu_id: item.menu_id,
              menu_name: menu.name,
              requested: item.quantity,
              available: menu.stock
            }
          }
        })
      }
    }

    // 주문 생성
    const order = await Order.create({ items, total_price })

    res.status(201).json({
      success: true,
      data: {
        order_id: order.id,
        order_time: order.order_time,
        total_price: order.total_price,
        status: order.status,
        message: '주문이 접수되었습니다.'
      }
    })
  } catch (error) {
    if (error.message.includes('재고가 부족합니다')) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message
        }
      })
    }
    next(error)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: '주문을 찾을 수 없습니다.'
        }
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (req, res, next) => {
  try {
    const { status } = req.query
    const orders = await Order.findAll(status || null)

    res.json({
      success: true,
      data: { orders }
    })
  } catch (error) {
    next(error)
  }
}

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: {
          message: '주문 상태가 필요합니다.'
        }
      })
    }

    const validStatuses = ['received', 'in_progress', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: '잘못된 상태 변경입니다. 주문 상태는 received, in_progress, completed 중 하나여야 합니다.'
        }
      })
    }

    // 주문 존재 확인
    const existingOrder = await Order.findById(orderId)
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        error: {
          message: '주문을 찾을 수 없습니다.'
        }
      })
    }

    // 상태 변경 검증 (간단한 순서 검증)
    const statusOrder = ['received', 'in_progress', 'completed']
    const currentIndex = statusOrder.indexOf(existingOrder.status)
    const newIndex = statusOrder.indexOf(status)

    if (newIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        error: {
          message: '잘못된 상태 변경입니다. 주문 상태는 received → in_progress → completed 순서로만 변경할 수 있습니다.'
        }
      })
    }

    const updated = await Order.updateStatus(orderId, status)

    res.json({
      success: true,
      data: {
        order_id: updated.id,
        status: updated.status,
        message: '주문 상태가 업데이트되었습니다.'
      }
    })
  } catch (error) {
    next(error)
  }
}

export const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.getStats()
    res.json({
      success: true,
      data: {
        total_orders: parseInt(stats.total_orders),
        received_orders: parseInt(stats.received_orders),
        in_progress_orders: parseInt(stats.in_progress_orders),
        completed_orders: parseInt(stats.completed_orders)
      }
    })
  } catch (error) {
    next(error)
  }
}

