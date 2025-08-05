import { GridButton } from './GridButton'
import { AacSymbol } from '../data/aac-symbols'

type AACGridProps = {
  items: AacSymbol[]
  onSelect: (symbol: AacSymbol) => void
}

export const AACGrid: React.FC<AACGridProps> = ({ items, onSelect }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 w-full max-w-screen-lg">
    {items.map((symbol) => (
      <GridButton key={symbol.id} symbol={symbol} onClick={() => onSelect(symbol)} />
    ))}
  </div>
)