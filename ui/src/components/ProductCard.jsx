import { useState } from 'react'
import './ProductCard.css'

function ProductCard({ product, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOptionChange = (optionId) => {
    setSelectedOptions(prev => {
      if (prev.includes(optionId)) {
        return prev.filter(id => id !== optionId)
      } else {
        return [...prev, optionId]
      }
    })
  }

  const handleAddToCart = () => {
    const selectedOptionsData = product.options.filter(opt => 
      selectedOptions.includes(opt.id)
    )
    onAddToCart(product, selectedOptionsData)
    setSelectedOptions([])
  }

  const calculatePrice = () => {
    const basePrice = product.price
    const optionsPrice = product.options
      .filter(opt => selectedOptions.includes(opt.id))
      .reduce((sum, opt) => sum + opt.price, 0)
    return basePrice + optionsPrice
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">{product.price.toLocaleString()}원</p>
        <p className="product-description">{product.description}</p>
        <div className="product-options">
          {product.options.map(option => (
            <label key={option.id} className="option-label">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
              />
              <span>
                {option.name} {option.price > 0 ? `(+${option.price.toLocaleString()}원)` : '(+0원)'}
              </span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-button"
          onClick={handleAddToCart}
        >
          담기
        </button>
      </div>
    </div>
  )
}

export default ProductCard

