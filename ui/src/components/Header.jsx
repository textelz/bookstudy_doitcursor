import './Header.css'

function Header({ currentPage, onNavigate }) {
  return (
    <header className="header">
      <h1 className="header-logo">COZY</h1>
      <nav className="header-nav">
        <button 
          className={`nav-button ${currentPage === 'order' ? 'active' : ''}`}
          onClick={() => onNavigate('order')}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentPage === 'admin' ? 'active' : ''}`}
          onClick={() => onNavigate('admin')}
        >
          관리자
        </button>
      </nav>
    </header>
  )
}

export default Header

