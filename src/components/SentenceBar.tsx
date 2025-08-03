// src/components/SentenceBar.tsx
import React, { useState } from 'react'
import { speak } from '../utils/speak'

export const SentenceBar: React.FC = () => {
  const [sentence, setSentence] = useState<string[]>([])

  const handleSpeak = () => speak(sentence.join(' '))
  const handleClear = () => setSentence([])

  return (
    <div className="flex items-center gap-2 bg-white p-4 shadow-md">
      <div className="flex-1 text-xl font-medium">
        {sentence.join(' ') || 'Tap to speak'}
      </div>
      <button onClick={handleSpeak} className="btn">Speak</button>
      <button onClick={handleClear} className="btn btn-outline">Clear</button>
    </div>
  )
}
