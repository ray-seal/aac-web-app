// src/components/Layout.tsx
import React from 'react'
import { SentenceBar } from './SentenceBar'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 text-black">
      <SentenceBar />
      <main className="flex-1 p-4 grid place-items-center">{children}</main>
    </div>
  )
}
