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
      className="fixed right-4 top-20 w-64 bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-bold mb-3 text-orange-400">Commander</h3>
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-white/5">
        <img
          src={commander.image_uris?.normal || commander.image_uris?.small}
          alt={commander.name}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-white/90 font-semibold mt-2 text-center">{commander.name}</p>
      <div className="mt-3 flex justify-center gap-2">
        {commander.color_identity?.map((color) => (
          <span
            key={color}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm backdrop-blur-sm"
            style={{
              backgroundColor: color === 'W' ? 'rgba(249, 215, 11, 0.8)' :
                             color === 'U' ? 'rgba(14, 104, 171, 0.8)' :
                             color === 'B' ? 'rgba(0, 0, 0, 0.8)' :
                             color === 'R' ? 'rgba(211, 32, 42, 0.8)' :
                             'rgba(0, 115, 62, 0.8)',
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