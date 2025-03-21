import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';
import BasicLandSelector from './BasicLandSelector';
import CardComponent from './CardComponent';
import CommanderDisplay from './CommanderDisplay';

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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
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
        setError('Failed to fetch available cards. This might be due to network issues or Scryfall being temporarily unavailable.');
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

  // Calculate subtype distribution and check for new tribal synergies
  const checkForTribalSynergies = useCallback(async () => {
    const deck = state.deck;
    const subtypeDistribution = deck.reduce((acc: Record<string, number>, card) => {
      const parts = card.type_line?.split('—') || [];
      if (parts.length > 1) {
        const subtypes = parts[1].trim().split(' ');
        subtypes.forEach(subtype => {
          acc[subtype] = (acc[subtype] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Check for new tribal synergies (subtypes with > 2 cards)
    for (const [subtype, count] of Object.entries(subtypeDistribution)) {
      if (count > 2 && !state.tribalSynergies[subtype]) {
        try {
          const colorIdentity = state.commander?.color_identity.join('');
          const query = `t:${subtype} color<=${colorIdentity} -is:commander -is:land legal:commander`;
          
          const response = await axios.get('https://api.scryfall.com/cards/search', {
            params: {
              q: query,
              unique: 'cards',
              order: 'edhrec',
              page: 1,
              page_size: 20,
            },
          });

          const tribalCards = response.data.data.filter((card: Card) => 
            !deck.some(deckCard => deckCard.id === card.id)
          );

          if (tribalCards.length > 0) {
            dispatch({ 
              type: 'ADD_TRIBAL_SYNERGY', 
              payload: { 
                subtype,
                cards: tribalCards
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching ${subtype} tribal cards:`, error);
        }
      }
    }
  }, [state.deck, state.commander?.color_identity, state.tribalSynergies, dispatch]);

  // Modified balanceCardPool to include tribal synergy cards
  const balanceCardPool = useCallback((cards: Card[]) => {
    const boosts = calculateRarityBoosts();
    const totalBoost = Object.values(boosts).reduce((a, b) => a + b, 0);

    // Get one random tribal synergy card for each active tribe
    const tribalCards: Card[] = [];
    Object.entries(state.tribalSynergies).forEach(([subtype, synergycards]) => {
      const availableSynergyCards = synergycards.filter(card => 
        !state.deck.some(deckCard => deckCard.id === card.id)
      );
      if (availableSynergyCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSynergyCards.length);
        tribalCards.push(availableSynergyCards[randomIndex]);
      }
    });

    // If we have tribal cards, include one and reduce the number of other cards accordingly
    const regularPickSize = 5;

    // Sort regular cards by rarity priority
    const sortedCards = [...cards].sort((a, b) => {
      const rarityA = a.rarity.toLowerCase();
      const rarityB = b.rarity.toLowerCase();
      const boostA = boosts[rarityA] || 0;
      const boostB = boosts[rarityB] || 0;
      return boostB - boostA;
    });

    // Take more cards from underrepresented rarities
    const balancedCards: Card[] = [...tribalCards];
    const rarityCounts: Record<string, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythic: 0,
    };

    // First pass: prioritize underrepresented rarities
    sortedCards.forEach(card => {
      if (balancedCards.length >= regularPickSize) return;
      
      const rarity = card.rarity.toLowerCase();
      const boost = boosts[rarity];
      
      if (boost > 0) {
        const targetCount = Math.ceil((boost / totalBoost) * regularPickSize);
        if (rarityCounts[rarity] < targetCount && !balancedCards.some(c => c.id === card.id)) {
          balancedCards.push(card);
          rarityCounts[rarity]++;
        }
      }
    });

    // Second pass: fill remaining slots with any cards
    sortedCards.forEach(card => {
      if (balancedCards.length >= regularPickSize) return;
      
      if (!balancedCards.some(c => c.id === card.id)) {
        balancedCards.push(card);
        rarityCounts[card.rarity.toLowerCase()]++;
      }
    });

    // Shuffle the final selection
    return balancedCards.sort(() => Math.random() - 0.5);
  }, [calculateRarityBoosts, state.tribalSynergies, state.deck]);

  // Modified fetchNextPick to check for tribal synergies
  const fetchNextPick = useCallback(() => {
    if (!state.isCommanderSelected || state.draftComplete) return;

    setLoading(true);
    try {
      // Check for new tribal synergies
      checkForTribalSynergies();

      // Filter out cards that are already in the deck or have ever been presented as picks
      const availableCards = state.availableCards.filter(
        card => !state.deck.some(deckCard => deckCard.id === card.id) &&
                !state.presentedCards.includes(card.id)
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
  }, [state.isCommanderSelected, state.draftComplete, state.availableCards, state.deck, state.presentedCards, dispatch, balanceCardPool, checkForTribalSynergies]);

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

  if (!state.isCommanderSelected || state.draftComplete) {
    return null;
  }

  const currentLands = state.deck.filter(card => card.is_land).length;
  const deckSize = state.deck.length;
  const isDeckFull = deckSize >= 99; // 99 + commander = 100

  return (
    <div className="space-y-6">
      <CommanderDisplay />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white/90">Current Pick</h2>
        <div className="flex items-center space-x-4">
          <BasicLandSelector showModal={showLandModal} onClose={() => setShowLandModal(false)} />
          <div className={`text-sm ${isDeckFull ? 'text-red-400' : 'text-white/70'}`}>
            Cards in deck: {deckSize} / 100
            {isDeckFull && <span className="ml-2">(Deck Full!)</span>}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {loading || state.availableCards.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-white/70">Fetching available cards for your commander...</p>
          </div>
        ) : error ? (
          <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-12">
            <div className="text-red-400 text-center max-w-md bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
              <p className="mb-4">{error}</p>
              <p className="text-sm text-white/70 mb-4">Please try the following:</p>
              <ul className="text-sm text-white/70 list-disc list-inside space-y-2">
                <li>Check your internet connection</li>
                <li>Wait a few moments and try again</li>
                <li>If the problem persists, try refreshing the page</li>
              </ul>
              <button
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchNextPick();
                }}
                className="btn-glass-blue"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : isDeckFull ? (
          <div className="col-span-full text-center text-red-400 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
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