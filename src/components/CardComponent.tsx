import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types/card';
import { useDraft } from '../context/DraftContext';

// Rarity colors for borders
const RARITY_COLORS = {
  common: '#C1C1C1',
  uncommon: '#B3C4D3',
  rare: '#F9D70B',
  mythic: '#F9A70B',
};

// Add rarity glow effects with increasing size and intensity
const RARITY_GLOW = {
  common: '0 0 10px #C1C1C1',
  uncommon: '0 0 15px #B3C4D3, 0 0 30px rgba(179, 196, 211, 0.3)',
  rare: '0 0 20px #F9D70B, 0 0 40px rgba(249, 215, 11, 0.4)',
  mythic: '0 0 25px #F9A70B, 0 0 50px rgba(249, 167, 11, 0.5), 0 0 75px rgba(249, 167, 11, 0.3)',
};

// Rarity-based scale factors for hover effect
const RARITY_SCALE = {
  common: 1.05,
  uncommon: 1.07,
  rare: 1.09,
  mythic: 1.11,
};

// Rarity-based rotation for hover effect
const RARITY_ROTATE = {
  common: 0,
  uncommon: 1,
  rare: 2,
  mythic: 3,
};

interface CardComponentProps {
  card: Card;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({ 
  card, 
  onClick, 
  className = '',
  isSelected = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { state } = useDraft();
  const rarity = card.rarity?.toLowerCase() || 'common';
  const borderColor = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
  const glowEffect = RARITY_GLOW[rarity as keyof typeof RARITY_GLOW] || RARITY_GLOW.common;
  const hoverScale = RARITY_SCALE[rarity as keyof typeof RARITY_SCALE] || RARITY_SCALE.common;
  const hoverRotate = RARITY_ROTATE[rarity as keyof typeof RARITY_ROTATE] || RARITY_ROTATE.common;

  const handleDebugClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card selection
    window.open(card.uri, '_blank');
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isSelected ? 0.5 : 1,
        opacity: isSelected ? 0 : 1,
        x: isSelected ? '100vw' : 0,
        y: isSelected ? '-50vh' : 0,
        rotate: isSelected ? 360 : 0,
      }}
      whileHover={{ 
        scale: isSelected ? 0.5 : hoverScale,
        rotate: isSelected ? 360 : hoverRotate,
        y: isSelected ? '-50vh' : -10,
        transition: {
          duration: 0.2,
          ease: "easeOut"
        }
      }}
      transition={{ 
        duration: isSelected ? 0.5 : 0.2,
        ease: isSelected ? "easeIn" : "easeOut"
      }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="relative aspect-[2/3] rounded-lg shadow-lg"
        style={{
          border: `2px solid ${borderColor}`,
          boxShadow: glowEffect,
          transform: `translateZ(0)`, // Force GPU acceleration
        }}
        whileHover={{
          boxShadow: isSelected ? glowEffect : `${glowEffect}, 0 0 30px ${borderColor}`,
          transition: {
            duration: 0.2,
            ease: "easeOut"
          }
        }}
      >
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <motion.img
            src={card.image_uris?.normal || card.image_uris?.small}
            alt={card.name}
            className="w-full h-full object-cover"
            whileHover={{
              scale: isSelected ? 1 : 1.05,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
          />
        </div>

        <AnimatePresence>
          {isHovered && !isSelected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 rounded-lg z-20"
              style={{
                boxShadow: `inset 0 0 20px ${borderColor}`,
                border: `2px solid ${borderColor}`,
              }}
            >
              {/* Blurred background layer */}
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg" />
              
              {/* Scrollable content container */}
              <div className="absolute inset-0 overflow-y-auto">
                {/* Sharp text content layer */}
                <div className="relative z-30 p-4">
                  <div className="space-y-2">
                    <h3 className="text-white font-bold text-lg tracking-tight">{card.name}</h3>
                    <p className="text-white/90 text-sm tracking-wide">{card.mana_cost}</p>
                    <p className="text-white/90 text-sm font-semibold tracking-tight">{card.type_line}</p>
                    <div className="border-t border-white/20 my-2"></div>
                    <p className="text-white/90 text-sm tracking-tight leading-snug whitespace-pre-wrap" style={{ textRendering: 'geometricPrecision' }}>{card.oracle_text}</p>
                    {(card.power || card.toughness) && (
                      <p className="text-white/90 text-sm mt-2 tracking-tight">
                        Power/Toughness: {card.power}/{card.toughness}
                      </p>
                    )}
                    {card.loyalty && (
                      <p className="text-white/90 text-sm mt-2 tracking-tight">
                        Loyalty: {card.loyalty}
                      </p>
                    )}
                    {state.showEDHRECRank && card.edhrec_rank && (
                      <p className="text-white/90 text-sm mt-2 tracking-tight">
                        EDHREC Rank: #{card.edhrec_rank.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 z-10">
          <h3 className="text-white text-sm font-semibold text-center">
            {card.name}
          </h3>
          <div className="text-xs text-gray-300 text-center">
            {card.mana_cost} • {card.type_line}
          </div>
        </div>
        <motion.div 
          className="absolute -bottom-3 left-1/2 px-1.5 py-0.5 rounded-full text-[10px] font-bold z-10"
          style={{
            backgroundColor: borderColor,
            color: rarity === 'mythic' ? '#FFFFFF' : '#000000',
            boxShadow: `0 0 10px ${borderColor}`,
            textShadow: rarity === 'mythic' ? '0 0 5px rgba(0,0,0,0.5)' : 'none',
          }}
          layout
          initial={{ x: '-50%' }}
          animate={{ x: '-50%' }}
          whileHover={{
            scale: isSelected ? 1 : 1.1,
            transition: {
              duration: 0.2,
              ease: "easeOut"
            }
          }}
        >
          {card.rarity?.toUpperCase()}
        </motion.div>
        {state.showEDHRECRank && card.edhrec_rank && (
          <motion.div 
            className="absolute -top-3 left-1/2 px-2 py-1 rounded-full text-[10px] font-bold z-10 bg-gradient-to-r from-cyan-500/30 to-teal-500/30 backdrop-blur-md border border-cyan-300/30 text-white/90"
            style={{
              boxShadow: '0 4px 6px -1px rgba(6, 182, 212, 0.2), 0 2px 4px -2px rgba(20, 184, 166, 0.1)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
            layout
            initial={{ x: '-50%', opacity: 0, y: -5 }}
            animate={{ x: '-50%', opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            whileHover={{
              scale: isSelected ? 1 : 1.1,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
          >
            #{card.edhrec_rank.toLocaleString()}
          </motion.div>
        )}

        {state.showDebugInfo && (
          <motion.button
            className="absolute -right-3 top-1/2 px-2 py-1 rounded-full text-[10px] font-bold z-10 bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-md border border-orange-300/30 text-white/90 transform -translate-y-1/2"
            style={{
              boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.2), 0 2px 4px -2px rgba(239, 68, 68, 0.1)',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={handleDebugClick}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            whileHover={{
              scale: 1.1,
              transition: {
                duration: 0.2,
                ease: "easeOut"
              }
            }}
          >
            🔗
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default CardComponent; 