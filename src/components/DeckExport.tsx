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
      .filter(card => card.id !== commander?.id)
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
        <h2 className="text-2xl font-bold text-white/90">Deck Export</h2>
        <button
          onClick={handleCopy}
          className="btn-glass-green"
        >
          Copy Decklist
        </button>
      </div>
      
      <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
        <pre className="text-sm text-white/70 whitespace-pre-wrap">
          {generateDecklist()}
        </pre>
      </div>
    </div>
  );
};

export default DeckExport; 