import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'
import { menuAPI, orderAPI } from '../services/api'
import './OrderPage.css'

function OrderPage() {
  const [products, setProducts] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 메뉴 목록 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true)
        const response = await menuAPI.getMenus()
        setProducts(response.data.menus)
        setError(null)
      } catch (err) {
        console.error('메뉴 로드 실패:', err)
        setError('메뉴를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadMenus()
  }, [])

  const findCartItem = (product, selectedOptions) => {
    return cartItems.find(item => {
      if (item.productId !== product.id) return false
      if (item.selectedOptions.length !== selectedOptions.length) return false
      
      const itemOptionIds = item.selectedOptions.map(opt => opt.id).sort()
      const selectedOptionIds = selectedOptions.map(opt => opt.id).sort()
      
      return itemOptionIds.every((id, index) => id === selectedOptionIds[index])
    })
  }

  const handleAddToCart = (product, selectedOptions) => {
    const basePrice = product.price
    const optionsPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
    const totalPrice = (basePrice + optionsPrice)

    const existingItem = findCartItem(product, selectedOptions)

    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item === existingItem
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      const newItem = {
        productId: product.id,
        productName: product.name,
        basePrice: basePrice,
        selectedOptions: selectedOptions,
        quantity: 1,
        totalPrice: totalPrice
      }
      setCartItems([...cartItems, newItem])
    }

    // 성공 피드백 (간단한 알림)
    alert(`${product.name}이(가) 장바구니에 추가되었습니다.`)
  }

  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity <= 0) {
      const item = cartItems[index]
      const confirmDelete = window.confirm('메뉴를 삭제하시겠습니까?')
      
      if (confirmDelete) {
        setCartItems(cartItems.filter((_, i) => i !== index))
      } else {
        // '아니오'를 누르면 수량을 1로 설정
        setCartItems(cartItems.map((item, i) => 
          i === index ? { ...item, quantity: 1 } : item
        ))
      }
    } else {
      setCartItems(cartItems.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    try {
      // 주문 데이터 생성
      const totalPrice = cartItems.reduce((sum, item) => sum + (item.totalPrice * item.quantity), 0)
      const orderItems = cartItems.map(item => ({
        menu_id: item.productId,
        quantity: item.quantity,
        option_ids: item.selectedOptions.map(opt => opt.id),
        item_price: item.totalPrice
      }))

      // API로 주문 생성
      const response = await orderAPI.createOrder({
        items: orderItems,
        total_price: totalPrice
      })

      // 관리자 화면에 주문 추가를 알리는 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('orderAdded'))

      alert('주문이 접수되었습니다!')
      setCartItems([])
    } catch (err) {
      console.error('주문 실패:', err)
      alert(err.message || '주문에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="order-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>메뉴를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-page">
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>다시 시도</button>
        </div>
      </div>
    )
  }

  return (
    <div className="order-page">
      <div className="products-section">
        <h2 className="section-title">메뉴</h2>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                description: product.description || '',
                imageUrl: product.image_url || '',
                options: product.options || []
              }}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
      <div className="cart-section">
        <Cart 
          cartItems={cartItems} 
          onOrder={handleOrder}
          onQuantityChange={handleQuantityChange}
        />
      </div>
    </div>
  )
}

export default OrderPage

