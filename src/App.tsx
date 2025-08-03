// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ImageGallery from './components/ImageGallery'
import VirtualBoard from './components/VirtualBoard'
import TextToSpeech from './components/TextToSpeech'
import CategoryFilter from './components/CategoryFilter'
import { aacSymbols, categories, AacSymbol } from './data/aac-symbols'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Catch-all must go last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
