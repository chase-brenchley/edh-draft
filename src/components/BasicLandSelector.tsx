import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';

const BasicLandSelector: React.FC = () => {
  const { state, dispatch } = useDraft();
  const [isOpen, setIsOpen] = useState(false);
  const [basicLands, setBasicLands] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  const getLandCount = (landName: string) => {
    return state.deck.filter(card => card?.name === landName).length;
  };

  const isDeckFull = state.deck.length >= 99; // 99 + commander = 100

  useEffect(() => {
    const fetchBasicLands = async () => {
      setLoading(true);
      try {
        const colorIdentity = state.commander?.color_identity || [];
        const basicLandNames = colorIdentity.map(color => {
          switch (color) {
            case 'W': return 'Plains';
            case 'U': return 'Island';
            case 'B': return 'Swamp';
            case 'R': return 'Mountain';
            case 'G': return 'Forest';
            default: return '';
          }
        }).filter(Boolean);

        const query = basicLandNames.map(name => `!${name}`).join(' OR ');
        
        const response = await axios.get(
          'https://api.scryfall.com/cards/search',
          {
            params: {
              q: query,
              unique: 'cards',
              page: 1,
              page_size: 100,
            },
          }
        );

        setBasicLands(response.data.data);
      } catch (error) {
        console.error('Error fetching basic lands:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBasicLands();
    }
  }, [isOpen, state.commander]);

  const handleAddLand = (land: Card) => {
    if (isDeckFull) return;
    dispatch({ type: 'ADD_CARD', payload: land });
  };

  if (!state.isCommanderSelected) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isDeckFull}
        className={`px-4 py-2 rounded transition-colors ${
          isDeckFull 
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        Add Basic Lands
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Add Basic Lands</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {isDeckFull && (
                <div className="mb-4 p-4 bg-red-900/50 text-red-400 rounded-lg">
                  Your deck is full! You cannot add any more cards, including basic lands.
                </div>
              )}

              {loading ? (
                <div className="text-center">Loading basic lands...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {basicLands.map((land) => (
                    <motion.div
                      key={land.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: isDeckFull ? 1 : 1.05 }}
                      className={`cursor-pointer ${isDeckFull ? 'opacity-50' : ''}`}
                      onClick={() => !isDeckFull && handleAddLand(land)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                        <img
                          src={land.image_uris?.normal || land.image_uris?.small}
                          alt={land.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {getLandCount(land.name)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                          <h3 className="text-white text-sm font-semibold text-center">
                            {land.name}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BasicLandSelector; 