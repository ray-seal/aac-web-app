import React, { useState } from 'react'
import { AACGrid } from './AACGrid'
import { aacSymbols } from '../data/aac-symbols'
import { useNavigate } from 'react-router-dom'

export const CommunicationPanel: React.FC = () => {
  const [message, setMessage] = useState<string>('')

  const handleSelect = (text: string) => {
    setMessage((prev) => (prev ? `${prev} ${text}` : text))

    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }

  const handleSpeakMessage = () => {
    if (!message) return
    const utterance = new SpeechSynthesisUtterance(message)
    speechSynthesis.speak(utterance)
  }

  const handleClear = () => setMessage('')

  const navigate = useNavigate()

  return (
    <section className="p-4">
      <h1 className="text-2xl font-bold mb-4">Communication Board</h1>

      <div className="mb-4 p-3 border rounded-lg bg-gray-100">
        <p className="text-lg font-medium">
          Message: {message || <em>(Tap symbols to build message)</em>}
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSpeakMessage}
            disabled={!message}
            aria-label="Speak the full message"
            className={`px-4 py-2 rounded ${
              message
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