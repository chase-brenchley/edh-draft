import React from 'react';
import { useDraft } from '../context/DraftContext';
import { motion } from 'framer-motion';

const DeckStats: React.FC = () => {
  const { state } = useDraft();
  const { deck } = state;

  // Calculate mana curve
  const manaCurve = deck.reduce((acc: Record<number, number>, card) => {
    const cmc = card.cmc || 0;
    acc[cmc] = (acc[cmc] || 0) + 1;
    return acc;
  }, {});

  // Calculate color distribution
  const colorDistribution = deck.reduce((acc: Record<string, number>, card) => {
    if (card.color_identity) {
      card.color_identity.forEach(color => {
        acc[color] = (acc[color] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Calculate card type distribution
  const typeDistribution = deck.reduce((acc: Record<string, number>, card) => {
    const types = card.type_line?.split('—')[0].trim().split(' ') || [];
    types.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {});

  // Calculate rarity distribution
  const rarityDistribution = deck.reduce((acc: Record<string, number>, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    return acc;
  }, {});

  // Calculate average CMC
  const averageCMC = deck.reduce((acc, card) => acc + (card.cmc || 0), 0) / deck.length;

  // Color mapping
  const colorMap: Record<string, { color: string; symbol: string }> = {
    W: { color: '#F9D70B', symbol: '⚪' },
    U: { color: '#0E68AB', symbol: '🔵' },
    B: { color: '#000000', symbol: '⚫' },
    R: { color: '#D3202A', symbol: '🔴' },
    G: { color: '#00733E', symbol: '🟢' },
  };

  // Rarity colors
  const rarityColors: Record<string, string> = {
    common: '#C1C1C1',
    uncommon: '#B3C4D3',
    rare: '#F9D70B',
    mythic: '#F9A70B',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Deck Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-base font-bold mb-3 text-blue-400">Overview</h3>
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Cards:</span>
                  <span className="text-white font-semibold">{deck.length}/100</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${((deck.length + 1) / 100) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg CMC:</span>
                <span className="text-white font-semibold">{averageCMC.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Mana Curve Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-base font-bold mb-3 text-green-400">Mana Curve</h3>
            <div className="space-y-2">
              {Object.entries(manaCurve)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([cmc, count]) => (
                  <div key={cmc} className="flex items-center space-x-2">
                    <span className="text-gray-300 w-6">{cmc}</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(count / deck.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-white w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Color Distribution Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-base font-bold mb-3 text-purple-400">Colors</h3>
            <div className="space-y-2">
              {Object.entries(colorDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([color, count]) => (
                  <div key={color} className="flex items-center space-x-2">
                    <span className="text-gray-300 w-6">{colorMap[color]?.symbol || color}</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(count / deck.length) * 100}%`,
                          backgroundColor: colorMap[color]?.color || '#gray',
                        }}
                      />
                    </div>
                    <span className="text-white w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </motion.div>

          {/* Card Types Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-base font-bold mb-3 text-yellow-400">Types</h3>
            <div className="space-y-2">
              {Object.entries(typeDistribution)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <span className="text-gray-300 flex-1 truncate">{type}</span>
                    <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${(count / deck.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-white w-6 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DeckStats; 