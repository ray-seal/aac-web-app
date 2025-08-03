'use client';

import { useState } from 'react';
import ImageGallery from '@/components/ImageGallery';
import VirtualBoard from '@/components/VirtualBoard';
import TextToSpeech from '@/components/TextToSpeech';
import CategoryFilter from '@/components/CategoryFilter';
import { aacSymbols, categories, AacSymbol } from '@/data/aac-symbols';

export default function Home() {
  const [selectedSymbols, setSelectedSymbols] = useState<AacSymbol[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredSymbols = selectedCategory === 'all' 
    ? aacSymbols 
    : aacSymbols.filter(symbol => symbol.category === selectedCategory);

  const handleSymbolSelect = (symbol: AacSymbol) => {
    setSelectedSymbols(prev => [...prev, symbol]);
  };

  const handleSymbolRemove = (index: number) => {
    setSelectedSymbols(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearBoard = () => {
    setSelectedSymbols([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AAC Communication Tool
          </h1>
          <p className="text-lg text-gray-600">
            Augmentative and Alternative Communication made simple
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Image Selection */}
          <div className="lg:col-span-2 space-y-6">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
            
            <ImageGallery
              symbols={filteredSymbols}
              onSymbolSelect={handleSymbolSelect}
            />
          </div>

          {/* Right Column - Communication Board and Controls */}
          <div className="space-y-6">
            <VirtualBoard
              selectedSymbols={selectedSymbols}
              onSymbolAdd={handleSymbolSelect}
              onSymbolRemove={handleSymbolRemove}
              onClearBoard={handleClearBoard}
            />
            
            <TextToSpeech symbols={selectedSymbols} />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">How to Use</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🖱️ Click to Add</h3>
              <p>Click on any symbol to add it to your communication board</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🖱️ Drag and Drop</h3>
              <p>Drag symbols from the gallery and drop them on the board</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🔊 Text-to-Speech</h3>
              <p>Click the Play button to hear your message spoken aloud</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">❌ Remove Symbols</h3>
              <p>Click on symbols in the board to remove them</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
