import pool from '../config/database.js'

export const Order = {
  // 주문 생성
  async create(orderData) {
    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // Orders 테이블에 주문 삽입
      const orderQuery = `
        INSERT INTO orders (order_time, total_price, status)
        VALUES (NOW(), $1, 'received')
        RETURNING id, order_time, total_price, status
      `
      const orderResult = await client.query(orderQuery, [orderData.total_price])
      const order = orderResult.rows[0]

      // OrderItems 삽입 및 재고 차감
      for (const item of orderData.items) {
        // 재고 확인 및 차감
        const stockQuery = `
          UPDATE menus 
          SET stock = stock - $1,
              updated_at = NOW()
          WHERE id = $2 AND stock >= $1
          RETURNING id, name, stock
        `
        const stockResult = await client.query(stockQuery, [item.quantity, item.menu_id])
        
        if (stockResult.rows.length === 0) {
          throw new Error(`재고가 부족합니다: 메뉴 ID ${item.menu_id}`)
        }

        // OrderItems 삽입
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_id, quantity, item_price)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `
        const itemResult = await client.query(itemQuery, [
          order.id,
          item.menu_id,
          item.quantity,
          item.item_price
        ])
        const orderItemId = itemResult.rows[0].id

        // OrderItemOptions 삽입
        if (item.option_ids && item.option_ids.length > 0) {
          for (const optionId of item.option_ids) {
            await client.query(
              'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
              [orderItemId, optionId]
            )
          }
        }
      }

      await client.query('COMMIT')
      return order
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },

  // 주문 상세 조회
  async findById(orderId) {
    const query = `
      SELECT 
        o.id,
        o.order_time,
        o.total_price,
        o.status,
        COALESCE(
          json_agg(
            json_build_object(
              'menu_id', m.id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'item_price', oi.item_price,
              'options', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'option_id', opt.id,
                      'option_name', opt.name,
                      'option_price', opt.price
                    )
                  )
                  FROM order_item_options oio
                  JOIN options opt ON oio.option_id = opt.id
                  WHERE oio.order_item_id = oi.id
                ),
                '[]'
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id = $1
      GROUP BY o.id
    `
    const result = await pool.query(query, [orderId])
    if (result.rows.length === 0) return null
    return result.rows[0]
  },

  // 모든 주문 조회 (관리자용)
  async findAll(status = null) {
    let query = `
      SELECT 
        o.id,
        o.order_time,
        o.total_price,
        o.status,
        COALESCE(
          json_agg(
            json_build_object(
              'menu_id', m.id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'item_price', oi.item_price,
              'options', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'option_id', opt.id,
                      'option_name', opt.name,
                      'option_price', opt.price
                    )
                  )
                  FROM order_item_options oio
                  JOIN options opt ON oio.option_id = opt.id
                  WHERE oio.order_item_id = oi.id
                ),
                '[]'
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
    `
    const params = []
    
    if (status) {
      query += ' WHERE o.status = $1'
      params.push(status)
    }
    
    query += ' GROUP BY o.id ORDER BY o.order_time DESC'
    
    const result = await pool.query(query, params)
    return result.rows
  },

  // 주문 상태 업데이트
  async updateStatus(orderId, newStatus) {
    const validStatuses = ['received', 'in_progress', 'completed']
    if (!validStatuses.includes(newStatus)) {
      throw new Error('잘못된 주문 상태입니다.')
    }

    const query = `
      UPDATE orders 
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, status
    `
    const result = await pool.query(query, [newStatus, orderId])
    return result.rows[0]
  },

  // 주문 통계 조회
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'received') as received_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
      FROM orders
    `
    const result = await pool.query(query)
    return result.rows[0]
  }
}

