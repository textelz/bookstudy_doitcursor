import './OrderStatus.css'

function OrderStatus({ orders, onOrderStatusChange }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  const formatOrderItems = (items) => {
    if (!items || !Array.isArray(items)) return ''
    return items.map(item => {
      const optionsText = item.options && item.options.length > 0
        ? ` (${item.options.map(opt => opt.option_name).join(', ')})`
        : ''
      return `${item.menu_name}${optionsText} x ${item.quantity}`
    }).join(', ')
  }

  const getStatusButton = (order) => {
    switch (order.status) {
      case 'pending':
        return (
          <button 
            className="status-button"
            onClick={() => onOrderStatusChange(order.id, 'received')}
          >
            주문 접수
          </button>
        )
      case 'received':
        return (
          <button 
            className="status-button"
            onClick={() => onOrderStatusChange(order.id, 'in_progress')}
          >
            제조 시작
          </button>
        )
      case 'in_progress':
        return (
          <button 
            className="status-button status-button-complete"
            onClick={() => onOrderStatusChange(order.id, 'completed')}
          >
            제조 완료
          </button>
        )
      case 'completed':
        return (
          <span className="status-completed">완료</span>
        )
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '대기'
      case 'received': return '접수'
      case 'in_progress': return '제조 중'
      case 'completed': return '완료'
      default: return status
    }
  }

  // 최신 주문이 위에 오도록 정렬 (이미 서버에서 정렬되어 있지만 안전을 위해)
  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.order_time) - new Date(a.order_time)
  )

  if (sortedOrders.length === 0) {
    return (
      <div className="order-status">
        <h2 className="order-status-title">주문 현황</h2>
        <p className="order-empty">주문이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="order-status">
      <h2 className="order-status-title">주문 현황</h2>
      <div className="order-list">
        {sortedOrders.map(order => (
          <div key={order.id} className="order-item">
            <div className="order-info">
              <div className="order-header">
                <span className="order-time">{formatDate(order.order_time)}</span>
                <span className={`order-status-badge order-status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <div className="order-items">{formatOrderItems(order.items)}</div>
              <div className="order-price">{order.total_price.toLocaleString()}원</div>
            </div>
            <div className="order-actions">
              {getStatusButton(order)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderStatus

