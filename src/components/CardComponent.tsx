import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types/card';

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
  const rarity = card.rarity?.toLowerCase() || 'common';
  const borderColor = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] || RARITY_COLORS.common;
  const glowEffect = RARITY_GLOW[rarity as keyof typeof RARITY_GLOW] || RARITY_GLOW.common;
  const hoverScale = RARITY_SCALE[rarity as keyof typeof RARITY_SCALE] || RARITY_SCALE.common;
  const hoverRotate = RARITY_ROTATE[rarity as keyof typeof RARITY_ROTATE] || RARITY_ROTATE.common;

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
    >
      <motion.div 
        className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg"
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
        <motion.div 
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold z-10"
          style={{
            backgroundColor: borderColor,
            color: rarity === 'mythic' ? '#FFFFFF' : '#000000',
            boxShadow: `0 0 10px ${borderColor}`,
            textShadow: rarity === 'mythic' ? '0 0 5px rgba(0,0,0,0.5)' : 'none',
          }}
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
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
          <h3 className="text-white text-sm font-semibold text-center">
            {card.name}
          </h3>
          <div className="text-xs text-gray-300 text-center">
            {card.mana_cost} • {card.type_line}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CardComponent; 