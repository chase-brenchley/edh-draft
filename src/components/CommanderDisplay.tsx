import React, { useState } from 'react';
import { useDraft } from '../context/DraftContext';
import { motion, AnimatePresence } from 'framer-motion';

const CommanderDisplay: React.FC = () => {
  const { state } = useDraft();
  const { commander } = state;
  const [isExpanded, setIsExpanded] = useState(false);

  if (!commander) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden fixed right-4 top-20 z-50 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 hover:bg-white/20 transition-colors"
        title={isExpanded ? "Hide Commander" : "Show Commander"}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          👑
        </motion.div>
      </button>

      {/* Commander Display */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed right-4 top-20 w-64 bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20 z-40"
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
        )}
      </AnimatePresence>

      {/* Desktop Display */}
      <div className="hidden md:block fixed right-4 top-20 w-64 bg-white/10 backdrop-blur-md rounded-lg p-4 shadow-lg border border-white/20">
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
      </div>
    </>
  );
};

export default CommanderDisplay; 