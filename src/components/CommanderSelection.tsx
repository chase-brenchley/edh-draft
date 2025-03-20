import React, { useEffect, useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';
import CardComponent from './CardComponent';

const CommanderSelection: React.FC = () => {
  const { state, dispatch } = useDraft();
  const [commanders, setCommanders] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommanders = async () => {
    try {
      // Make 5 parallel requests to get random commanders
      const requests = Array(5).fill(null).map(() =>
        axios.get('https://api.scryfall.com/cards/random', {
          params: {
            q: 'is:commander legal:commander',
          },
        })
      );

      const responses = await Promise.all(requests);
      const commanderData = responses.map(response => response.data);
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Select Your Commander</h2>
        {state.rerollsRemaining > 0 && (
          <button
            onClick={handleReroll}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Reroll ({state.rerollsRemaining} remaining)
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-300">Finding legendary commanders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {commanders.map((commander) => (
            <CardComponent
              key={commander.id}
              card={commander}
              onClick={() => handleCommanderSelect(commander)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommanderSelection; 