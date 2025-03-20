import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';
import BasicLandSelector from './BasicLandSelector';

// Target rarity distribution (in percentages)
const TARGET_RARITY_DISTRIBUTION = {
  common: 40,
  uncommon: 35,
  rare: 20,
  mythic: 5,
};

// Rarity colors for borders
const RARITY_COLORS = {
  common: '#C1C1C1',
  uncommon: '#B3C4D3',
  rare: '#F9D70B',
  mythic: '#F9A70B',
};

// Add rarity glow effects
const RARITY_GLOW = {
  common: '0 0 10px #C1C1C1',
  uncommon: '0 0 10px #B3C4D3',
  rare: '0 0 15px #F9D70B',
  mythic: '0 0 20px #F9A70B',
};

const DraftInterface: React.FC = () => {
  const { state, dispatch } = useDraft();
  const [loading, setLoading] = useState(false);
  const [currentPick, setCurrentPick] = useState<Card[]>([]);

  // Calculate current deck's rarity distribution
  const calculateCurrentRarityDistribution = useCallback(() => {
    const deck = state.deck;
    const total = deck.length;
    if (total === 0) return TARGET_RARITY_DISTRIBUTION;

    const distribution = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythic: 0,
    };

    deck.forEach(card => {
      const rarity = card.rarity.toLowerCase();
      if (rarity in distribution) {
        distribution[rarity as keyof typeof distribution]++;
      }
    });

    // Convert to percentages
    Object.keys(distribution).forEach(rarity => {
      distribution[rarity as keyof typeof distribution] = 
        (distribution[rarity as keyof typeof distribution] / total) * 100;
    });

    return distribution;
  }, [state.deck]);

  // Calculate which rarities need to be boosted
  const calculateRarityBoosts = useCallback(() => {
    const current = calculateCurrentRarityDistribution();
    const boosts: Record<string, number> = {};

    Object.keys(TARGET_RARITY_DISTRIBUTION).forEach(rarity => {
      const target = TARGET_RARITY_DISTRIBUTION[rarity as keyof typeof TARGET_RARITY_DISTRIBUTION];
      const currentValue = current[rarity as keyof typeof current];
      boosts[rarity] = Math.max(0, target - currentValue);
    });

    return boosts;
  }, [calculateCurrentRarityDistribution]);

  // Balance the card pool based on rarity
  const balanceCardPool = useCallback((cards: Card[]) => {
    const boosts = calculateRarityBoosts();
    const totalBoost = Object.values(boosts).reduce((a, b) => a + b, 0);

    // If no boosts needed, return original cards
    if (totalBoost === 0) return cards;

    // Sort cards by rarity priority (higher boost = higher priority)
    const sortedCards = [...cards].sort((a, b) => {
      const rarityA = a.rarity.toLowerCase();
      const rarityB = b.rarity.toLowerCase();
      const boostA = boosts[rarityA] || 0;
      const boostB = boosts[rarityB] || 0;
      return boostB - boostA;
    });

    // Take more cards from underrepresented rarities
    const balancedCards: Card[] = [];
    const rarityCounts: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythic: 0,
    };

    // First pass: prioritize underrepresented rarities
    sortedCards.forEach(card => {
      const rarity = card.rarity.toLowerCase();
      const boost = boosts[rarity];
      
      if (boost > 0) {
        // Add more cards from underrepresented rarities
        const targetCount = Math.ceil((boost / totalBoost) * 5); // 5 is our target pool size
        if (rarityCounts[rarity] < targetCount) {
          balancedCards.push(card);
          rarityCounts[rarity]++;
        }
      }
    });

    // Second pass: fill remaining slots with any cards
    sortedCards.forEach(card => {
      if (balancedCards.length < 5) {
        const rarity = card.rarity.toLowerCase();
        if (!balancedCards.some(c => c.id === card.id)) {
          balancedCards.push(card);
          rarityCounts[rarity]++;
        }
      }
    });

    return balancedCards;
  }, [calculateRarityBoosts]);

  const fetchNextPick = useCallback(async () => {
    if (!state.isCommanderSelected || state.draftComplete) return;

    setLoading(true);
    try {
      const colorIdentity = state.commander?.color_identity.join('');
      const query = `color<=${colorIdentity} -is:commander -is:land legal:commander`;
      
      const response = await axios.get(
        'https://api.scryfall.com/cards/search',
        {
          params: {
            q: query,
            unique: 'cards',
            page: 1,
            page_size: 100,
          },
        }
      );

      // Get all cards and balance them based on rarity
      const allCards = response.data.data;
      const balancedCards = balanceCardPool(allCards);
      
      // Randomize the balanced cards
      const shuffled = [...balancedCards].sort(() => Math.random() - 0.5);
      const cards = shuffled.slice(0, 5);
      
      setCurrentPick(cards);
      dispatch({ type: 'SET_CURRENT_PICK', payload: cards });
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  }, [state.isCommanderSelected, state.draftComplete, state.commander, dispatch, balanceCardPool]);

  useEffect(() => {
    if (currentPick.length === 0) {
      fetchNextPick();
    }
  }, [currentPick.length, fetchNextPick]);

  const handleCardSelect = (card: Card) => {
    dispatch({ type: 'ADD_CARD', payload: card });
    setCurrentPick([]); // Clear current pick to trigger fetching new cards
  };

  const handleLandCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCount = parseInt(e.target.value);
    if (!isNaN(newCount) && newCount >= 0 && newCount <= 100) {
      dispatch({ type: 'SET_DESIRED_LAND_COUNT', payload: newCount });
    }
  };

  if (!state.isCommanderSelected || state.draftComplete) {
    return null;
  }

  const currentLands = state.deck.filter(card => card.is_land).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Current Pick</h2>
        <div className="flex items-center space-x-4">
          <BasicLandSelector />
          <div className="text-sm text-gray-300">
            Cards in deck: {state.deck.length}
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="landCount" className="text-sm text-gray-300">
              Lands:
            </label>
            <input
              type="number"
              id="landCount"
              min="0"
              max="100"
              value={state.desiredLandCount}
              onChange={handleLandCountChange}
              className="w-16 px-2 py-1 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            <span className="text-sm text-gray-400">
              ({currentLands}/{state.desiredLandCount})
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center">Loading cards...</div>
        ) : (
          currentPick.map((card) => (
            <motion.div
              key={card.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
              onClick={() => handleCardSelect(card)}
            >
              <div 
                className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg"
                style={{
                  border: `2px solid ${RARITY_COLORS[card.rarity.toLowerCase() as keyof typeof RARITY_COLORS]}`,
                  boxShadow: RARITY_GLOW[card.rarity.toLowerCase() as keyof typeof RARITY_GLOW],
                }}
              >
                <div 
                  className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold z-10"
                  style={{
                    backgroundColor: RARITY_COLORS[card.rarity.toLowerCase() as keyof typeof RARITY_COLORS],
                    color: card.rarity.toLowerCase() === 'common' ? '#000000' : '#FFFFFF',
                  }}
                >
                  {card.rarity.toUpperCase()}
                </div>
                <img
                  src={card.image_uris?.normal || card.image_uris?.small}
                  alt={card.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                  <h3 className="text-white text-sm font-semibold text-center">
                    {card.name}
                  </h3>
                  <div className="text-xs text-gray-300 text-center">
                    {card.mana_cost} • {card.type_line}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DraftInterface; 