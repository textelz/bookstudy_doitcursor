// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// 공통 fetch 함수
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || '요청에 실패했습니다.')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 메뉴 관련 API
export const menuAPI = {
  // 메뉴 목록 조회 (일반 사용자)
  getMenus: () => fetchAPI('/api/menus'),

  // 메뉴 목록 조회 (관리자, 재고 포함)
  getMenusWithStock: () => fetchAPI('/api/menus/admin'),

  // 재고 수량 수정
  updateStock: (menuId, change) => 
    fetchAPI(`/api/menus/admin/${menuId}/stock`, {
      method: 'PATCH',
      body: { change }
    })
}

// 주문 관련 API
export const orderAPI = {
  // 주문 생성
  createOrder: (orderData) =>
    fetchAPI('/api/orders', {
      method: 'POST',
      body: orderData
    }),

  // 주문 상세 조회
  getOrderById: (orderId) => fetchAPI(`/api/orders/${orderId}`),

  // 주문 목록 조회 (관리자)
  getOrders: (status = null) => {
    const query = status ? `?status=${status}` : ''
    return fetchAPI(`/api/orders/admin/list${query}`)
  },

  // 주문 상태 변경
  updateOrderStatus: (orderId, status) =>
    fetchAPI(`/api/orders/admin/${orderId}/status`, {
      method: 'PATCH',
      body: { status }
    }),

  // 주문 통계 조회
  getOrderStats: () => fetchAPI('/api/orders/admin/stats')
}

