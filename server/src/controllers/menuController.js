import { Menu } from '../models/Menu.js'

export const getMenus = async (req, res, next) => {
  try {
    const menus = await Menu.findAll()
    res.json({
      success: true,
      data: { menus }
    })
  } catch (error) {
    next(error)
  }
}

export const getMenusWithStock = async (req, res, next) => {
  try {
    const menus = await Menu.findAllWithStock()
    res.json({
      success: true,
      data: { menus }
    })
  } catch (error) {
    next(error)
  }
}

export const updateStock = async (req, res, next) => {
  try {
    const { menuId } = req.params
    const { change } = req.body

    if (change !== 1 && change !== -1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'change 값은 1 또는 -1이어야 합니다.'
        }
      })
    }

    const menu = await Menu.findById(menuId)
    if (!menu) {
      return res.status(404).json({
        success: false,
        error: {
          message: '메뉴를 찾을 수 없습니다.'
        }
      })
    }

    const updated = await Menu.updateStock(menuId, change)
    
    if (updated.stock < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: '재고 수량은 0 미만이 될 수 없습니다.'
        }
      })
    }

    res.json({
      success: true,
      data: {
        menu_id: updated.id,
        stock: updated.stock,
        message: '재고 수량이 업데이트되었습니다.'
      }
    })
  } catch (error) {
    next(error)
  }
}

