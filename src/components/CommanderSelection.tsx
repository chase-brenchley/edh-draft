import React, { useEffect, useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';
import CardComponent from './CardComponent';

const CommanderSelection: React.FC = () => {
  const { state, dispatch } = useDraft();
  const [commanders, setCommanders] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommanders = async () => {
    try {
      setError(null);
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
      setError('Failed to fetch commanders. This might be due to network issues or Scryfall being temporarily unavailable.');
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
      setError(null);
      fetchCommanders();
    }
  };

  if (state.isCommanderSelected) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white/90">Select Your Commander</h2>
        {state.rerollsRemaining > 0 && (
          <button
            onClick={handleReroll}
            className="btn-glass-blue"
          >
            Reroll ({state.rerollsRemaining} remaining)
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-white/70">Finding legendary commanders...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <div className="text-red-400 text-center max-w-md bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <p className="mb-4">{error}</p>
            <p className="text-sm text-white/70 mb-4">Please try the following:</p>
            <ul className="text-sm text-white/70 list-disc list-inside space-y-2">
              <li>Check your internet connection</li>
              <li>Wait a few moments and try again</li>
              <li>If the problem persists, try refreshing the page</li>
            </ul>
            <button
              onClick={fetchCommanders}
              className="btn-glass-blue"
            >
              Try Again
            </button>
          </div>
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