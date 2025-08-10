import React from 'react'
import { useNavigate } from 'react-router-dom'

const HowToPage: React.FC = () => {
  const navigate = useNavigate()
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-sm hover:underline">
        ← Back to app
      </button>
      {/* Edit from here down */}
      <h1>
        Speakly How To
      </h1>
      <div>
        <p>
          Welcome to Speakly. The voice given to those who cannot speak for themselves.
        </p>
        <ul>
          <li>
            <strong>Home Page</strong> — 
            <img src="images/SShome.jpeg" style={{ width: '25%' }} alt="Home Page" />
            <figcaption>
              On the homepage select the image you want to say and it will be added to the communication
              panel at the top of the screen.
            </figcaption>
            <img src="images/SSspeak.jpeg" style={{ width: '25%' }} alt="Speak Feature" />
            <figcaption>
              Press "speak" after adding to the communication panel to say your request out loud.
            </figcaption>
          </li>
          {/* Remove or edit unrelated items below as needed */}
          <li><strong>Power Fantasy</strong> — Abilities reshape encounters.</li>
          <li><strong>Modularity</strong> — Customize frames, weapons, and mods.</li>
          <li><strong>Swarm Combat</strong> — Numerous but dangerous enemies.</li>
          <li><strong>Narrative Progression</strong> — Story and upgrades matter.</li>
        </ul>
      </div>
    </main>
  )
}

export default HowToPage