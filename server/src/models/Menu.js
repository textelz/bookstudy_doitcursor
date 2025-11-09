import pool from '../config/database.js'

export const Menu = {
  // 모든 메뉴 조회 (재고 정보 제외)
  async findAll() {
    const query = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image_url,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'price', o.price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id
      GROUP BY m.id
      ORDER BY m.id
    `
    const result = await pool.query(query)
    return result.rows.map(row => ({
      ...row,
      options: row.options || []
    }))
  },

  // 모든 메뉴 조회 (재고 정보 포함 - 관리자용)
  async findAllWithStock() {
    const query = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image_url,
        m.stock,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'price', o.price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id
      GROUP BY m.id
      ORDER BY m.id
    `
    const result = await pool.query(query)
    return result.rows.map(row => ({
      ...row,
      options: row.options || []
    }))
  },

  // ID로 메뉴 조회
  async findById(id) {
    const query = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'price', o.price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id
      WHERE m.id = $1
      GROUP BY m.id
    `
    const result = await pool.query(query, [id])
    if (result.rows.length === 0) return null
    return {
      ...result.rows[0],
      options: result.rows[0].options || []
    }
  },

  // 재고 수량 업데이트
  async updateStock(id, change) {
    const query = `
      UPDATE menus 
      SET stock = GREATEST(0, stock + $1),
          updated_at = NOW()
      WHERE id = $2
      RETURNING id, stock
    `
    const result = await pool.query(query, [change, id])
    return result.rows[0]
  },

  // 재고 차감 (주문 시)
  async decreaseStock(id, quantity) {
    const query = `
      UPDATE menus 
      SET stock = stock - $1,
          updated_at = NOW()
      WHERE id = $2 AND stock >= $1
      RETURNING id, name, stock
    `
    const result = await pool.query(query, [quantity, id])
    return result.rows[0]
  }
}

