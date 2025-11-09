import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import Cart from '../components/Cart'
import './OrderPage.css'

// 임시 상품 데이터
const initialProducts = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원하고 깔끔한 아이스 아메리카노',
    imageUrl: '/images/americano-ice.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻하고 진한 핫 아메리카노',
    imageUrl: '/images/americano-hot.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드럽고 고소한 카페라떼',
    imageUrl: '/images/caffe-latte.jpg',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 }
    ]
  }
]

function OrderPage() {
  const [cartItems, setCartItems] = useState([])

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

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 주문 처리 (나중에 서버 연동)
    alert('주문이 접수되었습니다!')
    setCartItems([])
  }

  return (
    <div className="order-page">
      <div className="products-section">
        <h2 className="section-title">메뉴</h2>
        <div className="products-grid">
          {initialProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
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

