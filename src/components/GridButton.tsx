import { AacSymbol } from '../data/aac-symbols'

type GridButtonProps = {
  symbol: AacSymbol
  onClick: () => void
}

export const GridButton: React.FC<GridButtonProps> = ({ symbol, onClick }) => {
  const { text, imagePath } = symbol

  return (
    <button
      onClick={onClick}
      className="w-full h-full p-4 border rounded-lg bg-white hover:bg-blue-100 text-lg flex flex-col items-center"
    >
      {imagePath && (
        <img src={imagePath} alt={text} className="mb-2 h-16 w-16 object-contain" />
      )}
      <span>{text}</span>
    </button>
  )
}