import React from 'react';
import { useDraft } from '../context/DraftContext';

const DeckExport: React.FC = () => {
  const { state } = useDraft();

  if (!state.isCommanderSelected || state.deck.length === 0) {
    return null;
  }

  const generateDecklist = () => {
    const commander = state.commander;
    const decklist = state.deck
      .map((card) => `1 ${card.name}`)
      .join('\n');

    return `Commander\n1 ${commander?.name}\n\nDeck\n${decklist}`;
  };

  const handleCopy = () => {
    const decklist = generateDecklist();
    navigator.clipboard.writeText(decklist);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Deck Export</h2>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Copy Decklist
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {generateDecklist()}
        </pre>
      </div>
    </div>
  );
};

export default DeckExport; 