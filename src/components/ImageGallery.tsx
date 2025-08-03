'use client';

import Image from 'next/image';
import { AacSymbol } from '@/data/aac-symbols';

interface ImageGalleryProps {
  symbols: AacSymbol[];
  onSymbolSelect: (symbol: AacSymbol) => void;
}

export default function ImageGallery({ symbols, onSymbolSelect }: ImageGalleryProps) {
  const handleDragStart = (e: React.DragEvent, symbol: AacSymbol) => {
    e.dataTransfer.setData('application/json', JSON.stringify(symbol));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">AAC Symbols</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {symbols.map((symbol) => (
          <div
            key={symbol.id}
            className="relative group cursor-pointer transform transition-transform duration-200 hover:scale-105"
            draggable
            onDragStart={(e) => handleDragStart(e, symbol)}
            onClick={() => onSymbolSelect(symbol)}
          >
            <div className="bg-gray-50 rounded-lg p-2 border-2 border-gray-200 hover:border-blue-400 transition-colors">
              <Image
                src={symbol.imagePath}
                alt={symbol.text}
                width={80}
                height={80}
                className="w-full h-auto"
              />
              <p className="text-xs font-medium text-gray-700 text-center mt-1 capitalize">
                {symbol.text}
              </p>
            </div>
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}