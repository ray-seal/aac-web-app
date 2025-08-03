// src/pages/HomePage.tsx
import { Layout } from '../components/Layout'
import { ImageSelection } from '../components/ImageSelection'
import { CommunicationPanel } from '../components/CommunicationPanel'

export default function HomePage() {
  return (
    <Layout>
      <ImageSelection />
      <CommunicationPanel />
    </Layout>
  )
}
