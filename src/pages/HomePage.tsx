// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import React from 'react';

const panels = [
  {
    title: 'A',
    description: 'A',
    icon: '📚',
    to: '/a',
    style: 'bg-opacity-10 border-accent'
  }
]

export const HomePage: React.FC = () => {
  return (
    <main className="p-6 sm:p-12">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-accent">AAC Communication Tool</h1>
      <p className="mb-8 text-lg text-muted">Description coming soon ...</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {panels.map((panel, index) => (
          <Link
            key={index}
            to={panel.to}
            className={`
              group relative rounded-xl p-6 border text-left transition-all duration-300
              backdrop-blur-md bg-white/3 dark:bg-black/6 shadow-md
              hover:bg-accent/10 hover:border-accent hover:shadow-[0_0_12px_var(--color-accent),0_0_24px_var(--color-accent)]
              hover:ring-2 hover:ring-[var(--color-accent)] hover:scale-[1.02]
              ${panel.style}
              ${index % 2 === 0 ? 'sm:translate-y-2' : 'sm:-translate-y-2'}
              bg-[rgba(255,255,255,0.02)]
            `}
          >
            <div className="text-2xl mb-2">{panel.icon}</div>
            <h2 className="text-xl font-semibold text-accent">{panel.title}</h2>
            <p className="text-sm opacity-75">{panel.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
