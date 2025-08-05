// ...other imports
import { aacSymbols } from '../data/aac-symbols'
import { getImageUrl } from '../utils/uploadImage'

// ...inside the parent component (replace the favourites grid section)

{/* 3. Favourites grid (NO speak button here) */}
<div>
  <h3 className="font-bold mb-2">Your Favourites</h3>
  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
    {favourites.length === 0 && (
      <p className="col-span-full text-gray-600 text-center">(No favourites yet)</p>
    )}
    {favourites.map(fav => (
      <div key={fav.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
        <img
          src={fav.type === 'aac' ? fav.image_url : getImageUrl(fav.image_url)}
          alt={fav.label}
          className="w-16 h-16 object-cover rounded mb-2"
        />
        <div className="text-center text-xs font-medium mb-1">{fav.label}</div>
        <button
          onClick={() => handleRemoveFavourite(fav.id)}
          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
        >
          Remove
        </button>
      </div>
    ))}
  </div>
</div>