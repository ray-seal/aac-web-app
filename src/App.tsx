import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { howToPage } from './pages/howTo'
import Parent from './pages/Parent'
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parent" element={<Parent />} />
					<Route path="/pages" element={<howToPage />} />
        {/* Catch-all must go last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App