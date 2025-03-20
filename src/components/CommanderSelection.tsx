import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';

const CommanderSelection: React.FC = () => {
  const { state, dispatch } = useDraft();
  const [commanders, setCommanders] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommanders = async () => {
    try {
      const response = await axios.get(
        'https://api.scryfall.com/cards/search',
        {
          params: {
            q: 'is:commander legal:commander',
            unique: 'cards',
            page: 1,
            page_size: 100, // Get a larger pool of commanders
          },
        }
      );

      // Randomize the commanders array
      const allCommanders = response.data.data;
      const shuffled = [...allCommanders].sort(() => Math.random() - 0.5);
      const commanderData = shuffled.slice(0, 5);
      setCommanders(commanderData);
    } catch (error) {
      console.error('Error fetching commanders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!state.isCommanderSelected) {
      fetchCommanders();
    }
  }, [state.isCommanderSelected]);

  const handleCommanderSelect = (commander: Card) => {
    dispatch({ type: 'SELECT_COMMANDER', payload: commander });
  };

  const handleReroll = () => {
    if (state.rerollsRemaining > 0) {
      dispatch({ type: 'REROLL_COMMANDER' });
      setLoading(true);
      fetchCommanders();
    }
  };

  if (state.isCommanderSelected) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Select Your Commander</h2>
      <div className="flex justify-center space-x-4">
        {state.rerollsRemaining > 0 && (
          <button
            onClick={handleReroll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reroll ({state.rerollsRemaining} remaining)
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center">Loading commanders...</div>
        ) : (
          commanders.map((commander) => (
            <motion.div
              key={commander.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => handleCommanderSelect(commander)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
                <img
                  src={commander.image_uris?.normal || commander.image_uris?.small}
                  alt={commander.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <h3 className="text-white text-sm font-semibold text-center">
                    {commander.name}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommanderSelection; 