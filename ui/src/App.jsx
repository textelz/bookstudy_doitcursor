import { useState } from 'react'
import Header from './components/Header'
import OrderPage from './pages/OrderPage'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('order')

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <div className="App">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="App-main">
        {currentPage === 'order' && <OrderPage />}
        {currentPage === 'admin' && (
          <div className="coming-soon">
            <p>관리자 화면은 준비 중입니다.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

