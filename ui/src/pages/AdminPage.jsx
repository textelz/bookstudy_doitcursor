import { useState, useEffect } from 'react'
import Dashboard from '../components/Dashboard'
import InventoryStatus from '../components/InventoryStatus'
import OrderStatus from '../components/OrderStatus'
import { menuAPI, orderAPI } from '../services/api'
import './AdminPage.css'

function AdminPage() {
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    receivedOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0
  })

  // 주문 통계 로드
  const loadStats = async () => {
    try {
      const response = await orderAPI.getOrderStats()
      setStats({
        totalOrders: response.data.total_orders,
        receivedOrders: response.data.received_orders,
        inProgressOrders: response.data.in_progress_orders,
        completedOrders: response.data.completed_orders
      })
    } catch (err) {
      console.error('통계 로드 실패:', err)
    }
  }

  // 재고 수량 변경
  const handleStockChange = async (productId, change) => {
    try {
      const response = await menuAPI.updateStock(productId, change)
      // 재고 목록 새로고침
      await loadInventory()
    } catch (err) {
      console.error('재고 수정 실패:', err)
      alert(err.message || '재고 수정에 실패했습니다.')
    }
  }

  // 주문 상태 변경
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      // 주문 목록 및 통계 새로고침
      await Promise.all([loadOrders(), loadStats()])
    } catch (err) {
      console.error('주문 상태 변경 실패:', err)
      alert(err.message || '주문 상태 변경에 실패했습니다.')
    }
  }

  // 재고 데이터 로드
  const loadInventory = async () => {
    try {
      const response = await menuAPI.getMenusWithStock()
      setInventory(response.data.menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        stock: menu.stock
      })))
    } catch (err) {
      console.error('재고 로드 실패:', err)
      setError('재고 정보를 불러오는데 실패했습니다.')
    }
  }

  // 주문 데이터 로드
  const loadOrders = async () => {
    try {
      const response = await orderAPI.getOrders()
      setOrders(response.data.orders)
    } catch (err) {
      console.error('주문 로드 실패:', err)
      setError('주문 정보를 불러오는데 실패했습니다.')
    }
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([loadInventory(), loadOrders(), loadStats()])
        setError(null)
      } catch (err) {
        console.error('데이터 로드 실패:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // 커스텀 이벤트 리스너 (주문하기 화면에서 주문이 추가될 때)
    const handleOrderAdded = () => {
      loadOrders()
      loadStats()
    }
    
    window.addEventListener('orderAdded', handleOrderAdded)
    
    // 주기적으로 주문 목록 및 통계 확인 (실제로는 WebSocket 사용 권장)
    const interval = setInterval(() => {
      loadOrders()
      loadStats()
    }, 5000) // 5초마다 확인
    
    return () => {
      window.removeEventListener('orderAdded', handleOrderAdded)
      clearInterval(interval)
    }
  }, [])

  if (loading) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Dashboard stats={stats} />
      <InventoryStatus 
        inventory={inventory} 
        onStockChange={handleStockChange}
      />
      <OrderStatus 
        orders={orders}
        onOrderStatusChange={handleOrderStatusChange}
      />
    </div>
  )
}

export default AdminPage

