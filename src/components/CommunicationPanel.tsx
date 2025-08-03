// src/components/CommunicationPanel.tsx
import { SentenceBar } from './SentenceBar'
import { AACGrid } from './AACGrid'
import { corePhrases } from '../data/phrases'

export const CommunicationPanel: React.FC = () => {
  const handleSelect = (label: string) => {
    // Send to global sentence state/context
    console.log('Selected:', label)
  }

  return (
    <section className="flex-1 flex flex-col p-4 space-y-4">
      <SentenceBar />
      <AACGrid items={corePhrases} onSelect={handleSelect} />
    </section>
  )
}
