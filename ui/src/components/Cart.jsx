import './Cart.css'

function Cart({ cartItems, onOrder, onQuantityChange }) {
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)
  }

  const formatItemName = (item) => {
    const optionsText = item.selectedOptions.length > 0
      ? ` (${item.selectedOptions.map(opt => opt.name).join(', ')})`
      : ''
    return `${item.productName}${optionsText}`
  }

  const getItemTotalPrice = (item) => {
    return item.totalPrice * item.quantity
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart">
        <h2 className="cart-title">장바구니</h2>
        <div className="cart-content">
          <div className="cart-left">
            <p className="cart-empty">장바구니가 비어있습니다.</p>
          </div>
          <div className="cart-right">
            <div className="cart-total">
              <span className="cart-total-label">총 금액</span>
              <span className="cart-total-amount">0원</span>
            </div>
            <button className="order-button" onClick={onOrder} disabled>
              주문하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-content">
        <div className="cart-left">
          <div className="cart-items">
            {cartItems.map((item, index) => {
              // 고유한 key 생성 (productId + 옵션 조합)
              const uniqueKey = `${item.productId}-${item.selectedOptions.map(opt => opt.id).sort().join('-')}-${index}`
              return (
              <div key={uniqueKey} className="cart-item">
                <div className="cart-item-info">
                  <span className="cart-item-name">{formatItemName(item)}</span>
                </div>
                <div className="cart-item-controls">
                  <button 
                    className="quantity-button"
                    onClick={() => onQuantityChange(index, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button 
                    className="quantity-button"
                    onClick={() => onQuantityChange(index, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="cart-item-price">{getItemTotalPrice(item).toLocaleString()}원</span>
              </div>
              )
            })}
          </div>
        </div>
        <div className="cart-right">
          <div className="cart-total">
            <span className="cart-total-label">총 금액</span>
            <span className="cart-total-amount">{calculateTotal().toLocaleString()}원</span>
          </div>
          <button className="order-button" onClick={onOrder}>
            주문하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default Cart

