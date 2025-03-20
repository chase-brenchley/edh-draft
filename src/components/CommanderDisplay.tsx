import React from 'react';
import { useDraft } from '../context/DraftContext';
import { motion } from 'framer-motion';

const CommanderDisplay: React.FC = () => {
  const { state } = useDraft();
  const { commander } = state;

  if (!commander) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed right-4 top-20 w-64 bg-gray-800 rounded-lg p-4 shadow-lg"
    >
      <h3 className="text-lg font-bold mb-3 text-orange-400">Commander</h3>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
        <img
          src={commander.image_uris?.normal || commander.image_uris?.small}
          alt={commander.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-white font-semibold mt-2 text-center">{commander.name}</p>
      <div className="mt-3 flex justify-center gap-2">
        {commander.color_identity?.map((color) => (
          <span
            key={color}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
            style={{
              backgroundColor: color === 'W' ? '#F9D70B' :
                             color === 'U' ? '#0E68AB' :
                             color === 'B' ? '#000000' :
                             color === 'R' ? '#D3202A' :
                             '#00733E',
              color: color === 'B' ? 'white' : 'black'
            }}
          >
            {color}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

export default CommanderDisplay; 