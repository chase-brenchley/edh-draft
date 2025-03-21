import React, { useState, useEffect, useRef } from 'react';
import { useDraft } from '../context/DraftContext';
import { motion, AnimatePresence } from 'framer-motion';

const DeckStats: React.FC = () => {
  const { state } = useDraft();
  const { deck } = state;
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldAutoCollapseRef = useRef(true);
  const [collapseTimeout, setCollapseTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsExpanded(true);
    shouldAutoCollapseRef.current = false;
    if (collapseTimeout) {
      clearTimeout(collapseTimeout);
    }
  };

  const handleMouseLeave = () => {
    shouldAutoCollapseRef.current = true;
    // Start a timer to collapse after 2 seconds
    const timeout = setTimeout(() => {
      if (shouldAutoCollapseRef.current) {
        setIsExpanded(false);
      }
    }, 2000);
    setCollapseTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (collapseTimeout) {
        clearTimeout(collapseTimeout);
      }
    };
  }, [collapseTimeout]);

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

  // Calculate card type distribution (before the "—")
  const typeDistribution = deck.reduce((acc: Record<string, number>, card) => {
    const types = card.type_line?.split('—')[0].trim().split(' ') || [];
    types.forEach(type => {
      acc[type] = (acc[type] || 0) + 1;
    });
    return acc;
  }, {});

  // Calculate subtype distribution (after the "—")
  const subtypeDistribution = deck.reduce((acc: Record<string, number>, card) => {
    const parts = card.type_line?.split('—') || [];
    if (parts.length > 1) {
      const subtypes = parts[1].trim().split(' ');
      subtypes.forEach(subtype => {
        acc[subtype] = (acc[subtype] || 0) + 1;
      });
    }
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
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20"
      initial={false}
      animate={{ height: isExpanded ? "auto" : "40px" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Preview Bar (always visible) */}
      <div className="h-10 px-4 flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute inset-0 bg-white/5" />
        {/* Progress bar fill */}
        <motion.div
          className="absolute inset-0 bg-blue-500/20"
          initial={false}
          animate={{ width: `${(deck.length / 100) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
        {/* Content */}
        <div className="relative flex items-center space-x-4">
          <span className="text-white/70">Cards: {deck.length}/100</span>
          <span className="text-white/70">Avg CMC: {averageCMC.toFixed(2)}</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white/70 relative"
        >
          ▼
        </motion.div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Deck Overview Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-blue-400">Overview</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Cards:</span>
                        <span className="text-white/90 font-semibold">{deck.length}/100</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500/80 rounded-full transition-all duration-300"
                          style={{ width: `${((deck.length + 1) / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Avg CMC:</span>
                      <span className="text-white/90 font-semibold">{averageCMC.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Mana Curve Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-green-400">Mana Curve</h3>
                  <div className="space-y-2">
                    {Object.entries(manaCurve)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([cmc, count]) => (
                        <div key={cmc} className="flex items-center space-x-2">
                          <span className="text-white/70 w-6">{cmc}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500/80 rounded-full"
                              style={{ width: `${(count / deck.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-white/90 w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Color Distribution Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-purple-400">Colors</h3>
                  <div className="space-y-2">
                    {Object.entries(colorDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([color, count]) => (
                        <div key={color} className="flex items-center space-x-2">
                          <span className="text-white/70 w-6">{colorMap[color]?.symbol || color}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(count / deck.length) * 100}%`,
                                backgroundColor: `${colorMap[color]?.color}80`,
                              }}
                            />
                          </div>
                          <span className="text-white/90 w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Card Types Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-yellow-400">Card Types</h3>
                  <div className="space-y-2">
                    {Object.entries(typeDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => (
                        <div key={type} className="flex items-center space-x-2">
                          <span className="text-white/70 w-20">{type}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500/80 rounded-full"
                              style={{ width: `${(count / deck.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-white/90 w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Subtypes Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-orange-400">Subtypes</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(subtypeDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .filter(([, count]) => count > 1)
                      .map(([subtype, count]) => (
                        <div key={subtype} className="flex items-center space-x-2">
                          <span className="text-white/70 w-20">{subtype}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500/80 rounded-full"
                              style={{ width: `${(count / deck.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-white/90 w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>

                {/* Rarity Distribution Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isExpanded ? 1 : 0, y: isExpanded ? 0 : 20 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
                >
                  <h3 className="text-base font-bold mb-3 text-pink-400">Rarity</h3>
                  <div className="space-y-2">
                    {Object.entries(rarityDistribution)
                      .sort(([, a], [, b]) => b - a)
                      .map(([rarity, count]) => (
                        <div key={rarity} className="flex items-center space-x-2">
                          <span className="text-white/70 w-20 capitalize">{rarity}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(count / deck.length) * 100}%`,
                                backgroundColor: `${rarityColors[rarity.toLowerCase()]}80`,
                              }}
                            />
                          </div>
                          <span className="text-white/90 w-6 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DeckStats; 