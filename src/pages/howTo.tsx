import React from 'react'
import { useNavigate } from 'react-router-dom'

export const howToPage: React.FC = () => {

  const navigate = useNavigate()
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm hover:underline">
        ← Back to app
      </button>
      {/* Edit from here down */}
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-accent">
        Speakly How To
      </h1>
      <div className="space-y-2">
          <ul className="list-disc list-inside space-y-1">
            <li><strong>High Mobility</strong> — Movement is tactical and cinematic.</li>
            <li><strong>Power Fantasy</strong> — Abilities reshape encounters.</li>
            <li><strong>Modularity</strong> — Customize frames, weapons, and mods.</li>
            <li><strong>Swarm Combat</strong> — Numerous but dangerous enemies.</li>
            <li><strong>Narrative Progression</strong> — Story and upgrades matter.</li>
          </ul>
        </div>
    </main>
  )
}