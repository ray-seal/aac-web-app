// src/components/Layout.tsx
import React from 'react'

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-neutral-100 text-black">
      {children}
    </div>
  )
}
