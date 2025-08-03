// src/components/GridButton.tsx
type GridButtonProps = {
  label: string
  image?: string
  onClick: () => void
}

export const GridButton: React.FC<GridButtonProps> = ({ label, image, onClick }) => (
  <button
    onClick={onClick}
    className="w-full h-full p-4 border rounded-lg bg-white hover:bg-blue-100 text-lg"
  >
    {image && <img src={image} alt={label} className="mb-2 h-12 mx-auto" />}
    <span>{label}</span>
  </button>
)
