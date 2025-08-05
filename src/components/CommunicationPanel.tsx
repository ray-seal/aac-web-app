import React, { useState } from 'react'
import { AACGrid } from './AACGrid'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { useNavigate } from 'react-router-dom'

export const CommunicationPanel: React.FC = () => {
  const [selectedSymbols, setSelectedSymbols] = useState<AacSymbol[]>([])

  const handleSelect = (symbol: AacSymbol) => {
    setSelectedSymbols((prev) => [...prev, symbol])
    const utterance = new SpeechSynthesisUtterance(symbol.text)
    speechSynthesis.speak(utterance)
  }

  const handleSpeakMessage = () => {
    if (!selectedSymbols.length) return
    const message = selectedSymbols.map(s => s.text).join(' ')
    const utterance = new SpeechSynthesisUtterance(message)
    speechSynthesis.speak(utterance)
  }

  const handleClear = () => setSelectedSymbols([])

  const navigate = useNavigate()

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4">Communication Board</h1>

      <div className="mb-4 p-3 border rounded-lg bg-gray-100">
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedSymbols.length === 0 ? (
            <em className="text-gray-500">(Tap symbols to build message)</em>
          ) : (
            selectedSymbols.map((symbol, idx) => (
              <span key={idx} className="px-2 py-1 bg-white border rounded flex items-center gap-1">
                <img src={symbol.imagePath} alt={symbol.text} className="w-6 h-6 inline-block" />
                {symbol.text}
              </span>
            ))
          )}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSpeakMessage}
            disabled={selectedSymbols.length === 0}
            aria-label="Speak the full message"
            className={`px-4 py-2 rounded ${
              selectedSymbols.length
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            Speak Message
          </button>
          <button
            onClick={handleClear}
            aria-label="Clear the message"
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Clear
          </button>
          <button
            onClick={() => navigate('/parent')}
            aria-label="Parent area"
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Parent
          </button>
        </div>
      </div>

      <AACGrid items={aacSymbols} onSelect={handleSelect} />
    </section>
  )
}