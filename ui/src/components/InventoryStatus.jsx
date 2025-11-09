import './InventoryStatus.css'

function InventoryStatus({ inventory, onStockChange }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-out' }
    if (stock < 5) return { text: '주의', className: 'status-warning' }
    return { text: '정상', className: 'status-normal' }
  }

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-grid">
        {inventory.map(item => {
          const status = getStockStatus(item.stock)
          return (
            <div key={item.id} className="inventory-card">
              <h3 className="inventory-product-name">{item.name}</h3>
              <div className="inventory-stock-info">
                <span className="inventory-stock-count">{item.stock}개</span>
                <span className={`inventory-status-badge ${status.className}`}>
                  {status.text}
                </span>
              </div>
              <div className="inventory-controls">
                <button 
                  className="stock-button"
                  onClick={() => onStockChange(item.id, -1)}
                  disabled={item.stock === 0}
                >
                  -
                </button>
                <button 
                  className="stock-button"
                  onClick={() => onStockChange(item.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryStatus

