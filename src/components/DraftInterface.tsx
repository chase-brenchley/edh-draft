import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';
import BasicLandSelector from './BasicLandSelector';
import CardComponent from './CardComponent';

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
  const [showLandModal, setShowLandModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Show land modal on initial mount
  useEffect(() => {
    if (state.isCommanderSelected && !state.landModalShown) {
      setShowLandModal(true);
      dispatch({ type: 'SET_LAND_MODAL_SHOWN', payload: true });
    }
  }, [state.isCommanderSelected, state.landModalShown, dispatch]);

  // Fetch all available cards when commander is selected
  useEffect(() => {
    const fetchAvailableCards = async () => {
      if (!state.isCommanderSelected || state.availableCards.length > 0) return;

      setLoading(true);
      try {
        const colorIdentity = state.commander?.color_identity.join('');
        const query = `color<=${colorIdentity} -is:commander -is:land legal:commander`;
        
        // First, get the total number of cards
        const initialResponse = await axios.get(
          'https://api.scryfall.com/cards/search',
          {
            params: {
              q: query,
              unique: 'cards',
              order: 'released',
              page: 1,
              page_size: 1,
            },
          }
        );

        const totalCards = initialResponse.data.total_cards;
        const totalPages = Math.ceil(totalCards / 175); // Scryfall's max page size is 175

        // Randomly select 3 pages
        const selectedPages = new Set<number>();
        while (selectedPages.size < 3) {
          selectedPages.add(Math.floor(Math.random() * totalPages) + 1);
        }

        // Fetch cards from selected pages
        const pagePromises = Array.from(selectedPages).map(page =>
          axios.get('https://api.scryfall.com/cards/search', {
            params: {
              q: query,
              unique: 'cards',
              order: 'released',
              page,
              page_size: 175,
            },
          })
        );

        const pageResponses = await Promise.all(pagePromises);
        const allCards = pageResponses.flatMap(response => response.data.data);

        // Shuffle the combined results
        const shuffledCards = allCards.sort(() => Math.random() - 0.5);
        
        dispatch({ type: 'SET_AVAILABLE_CARDS', payload: shuffledCards });
      } catch (error) {
        console.error('Error fetching available cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCards();
  }, [state.isCommanderSelected, state.commander, state.availableCards.length, dispatch]);

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

  // Modified balanceCardPool to work with the cached pool
  const balanceCardPool = useCallback((cards: Card[]) => {
    const boosts = calculateRarityBoosts();
    const totalBoost = Object.values(boosts).reduce((a, b) => a + b, 0);

    // If no boosts needed, return random cards from the pool
    if (totalBoost === 0) {
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 5);
    }

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
      if (balancedCards.length >= 5) return;
      
      const rarity = card.rarity.toLowerCase();
      const boost = boosts[rarity];
      
      if (boost > 0) {
        // Add more cards from underrepresented rarities
        const targetCount = Math.ceil((boost / totalBoost) * 5);
        if (rarityCounts[rarity] < targetCount) {
          balancedCards.push(card);
          rarityCounts[rarity]++;
        }
      }
    });

    // Second pass: fill remaining slots with any cards
    sortedCards.forEach(card => {
      if (balancedCards.length >= 5) return;
      
      if (!balancedCards.some(c => c.id === card.id)) {
        balancedCards.push(card);
        rarityCounts[card.rarity.toLowerCase()]++;
      }
    });

    // Ensure we have exactly 5 cards
    return balancedCards.slice(0, 5);
  }, [calculateRarityBoosts]);

  // Modified fetchNextPick to use the cached pool
  const fetchNextPick = useCallback(() => {
    if (!state.isCommanderSelected || state.draftComplete) return;

    setLoading(true);
    try {
      // Filter out cards that are already in the deck
      const availableCards = state.availableCards.filter(
        card => !state.deck.some(deckCard => deckCard.id === card.id)
      );

      // Balance and select cards from the filtered pool
      const balancedCards = balanceCardPool(availableCards);
      setCurrentPick(balancedCards);
      dispatch({ type: 'SET_CURRENT_PICK', payload: balancedCards });
    } catch (error) {
      console.error('Error selecting next pick:', error);
    } finally {
      setLoading(false);
    }
  }, [state.isCommanderSelected, state.draftComplete, state.availableCards, state.deck, dispatch, balanceCardPool]);

  useEffect(() => {
    if (currentPick.length === 0) {
      fetchNextPick();
    }
  }, [currentPick.length, fetchNextPick]);

  const handleCardSelect = (card: Card) => {
    const newDeckSize = state.deck.length + 1; // +1 for the new card
    if (newDeckSize >= 100) {
      return; // Don't add the card if it would exceed 100
    }
    setSelectedCardId(card.id);
    // Wait for animation to complete before adding to deck
    setTimeout(() => {
      dispatch({ type: 'ADD_CARD', payload: card });
      setCurrentPick([]); // Clear current pick to trigger fetching new cards
      setSelectedCardId(null);
    }, 500); // Match the animation duration
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
  const deckSize = state.deck.length;
  const isDeckFull = deckSize >= 99; // 99 + commander = 100

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Current Pick</h2>
        <div className="flex items-center space-x-4">
          <BasicLandSelector showModal={showLandModal} onClose={() => setShowLandModal(false)} />
          <div className={`text-sm ${isDeckFull ? 'text-red-400' : 'text-gray-300'}`}>
            Cards in deck: {deckSize} / 100
            {isDeckFull && <span className="ml-2">(Deck Full!)</span>}
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading || state.availableCards.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-gray-300">Fetching available cards for your commander...</p>
          </div>
        ) : isDeckFull ? (
          <div className="col-span-full text-center text-red-400">
            Your deck is full! You cannot add any more cards.
          </div>
        ) : (
          currentPick.map((card) => (
            <CardComponent
              key={card.id}
              card={card}
              onClick={() => handleCardSelect(card)}
              isSelected={selectedCardId === card.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DraftInterface; 