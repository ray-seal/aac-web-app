// src/pages/HomePage.tsx
import { Layout } from '../components/Layout'
import { AACGrid } from '../components/AACGrid'
import { corePhrases } from '../data/phrases'

export default function HomePage() {
  const handleSelect = (label: string) => {
    // Add to sentence bar or speak directly
    console.log('Selected:', label)
  }

  return (
    <Layout>
      <AACGrid items={corePhrases} onSelect={handleSelect} />
    </Layout>
  )
}
