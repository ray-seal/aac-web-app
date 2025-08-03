// src/components/ImageSelection.tsx
export const ImageSelection: React.FC = () => {
  return (
    <aside className="w-full sm:w-1/3 lg:w-1/4 bg-white border-r p-4 overflow-auto">
      <h2 className="text-xl font-bold mb-4">Image Selection</h2>
      {/* Replace with actual logic */}
      <div className="grid gap-2">
        <button className="p-2 bg-blue-100 rounded">Select from Gallery</button>
        <button className="p-2 bg-green-100 rounded">Take Photo</button>
        <button className="p-2 bg-purple-100 rounded">AI Generate</button>
      </div>
    </aside>
  )
}
