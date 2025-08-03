'use client';

import Image from 'next/image';
import { AacSymbol } from '@/data/aac-symbols';

interface VirtualBoardProps {
  selectedSymbols: AacSymbol[];
  onSymbolAdd: (symbol: AacSymbol) => void;
  onSymbolRemove: (index: number) => void;
  onClearBoard: () => void;
}

export default function VirtualBoard({ 
  selectedSymbols, 
  onSymbolAdd, 
  onSymbolRemove, 
  onClearBoard 
}: VirtualBoardProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const symbolData = e.dataTransfer.getData('application/json');
      const symbol: AacSymbol = JSON.parse(symbolData);
      onSymbolAdd(symbol);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Communication Board</h2>
        <button
          onClick={onClearBoard}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div
        className="min-h-32 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 transition-colors hover:border-blue-400 hover:bg-blue-50"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {selectedSymbols.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-lg">Drop symbols here or click symbols to add them</p>
            <p className="text-sm mt-2">Build your message by arranging symbols</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSymbols.map((symbol, index) => (
              <div
                key={`${symbol.id}-${index}`}
                className="relative group bg-white rounded-lg p-2 border border-gray-200 hover:border-red-400 cursor-pointer transition-colors"
                onClick={() => onSymbolRemove(index)}
              >
                <Image
                  src={symbol.imagePath}
                  alt={symbol.text}
                  width={60}
                  height={60}
                  className="w-12 h-12 sm:w-15 sm:h-15"
                />
                <p className="text-xs text-center mt-1 font-medium">
                  {symbol.text}
                </p>
                <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                  ×
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedSymbols.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Message:</strong> {selectedSymbols.map(s => s.text).join(' ')}
          </p>
        </div>
      )}
    </div>
  );
}