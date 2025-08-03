// src/components/AACGrid.tsx
import { GridButton } from './GridButton'

type AACGridProps = {
  items: { label: string; image?: string }[]
  onSelect: (label: string) => void
}

export const AACGrid: React.FC<AACGridProps> = ({ items, onSelect }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full max-w-screen-lg">
    {items.map(({ label, image }) => (
      <GridButton key={label} label={label} image={image} onClick={() => onSelect(label)} />
    ))}
  </div>
)
