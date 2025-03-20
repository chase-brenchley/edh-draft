import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';
import axios from 'axios';

const CardSplitAnimation: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="relative w-64 h-96">
        <motion.div
          initial={{ rotate: 0, x: 0 }}
          animate={{ rotate: -5, x: -100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="relative w-[200%] h-full">
            <img
              src={card.image_uris?.normal || card.image_uris?.small}
              alt={card.name}
              className="w-full h-full object-cover"
              style={{ transform: 'translateX(-50%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              <h3 className="text-white text-sm font-semibold text-center">
                {card.name}
              </h3>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ rotate: 0, x: 0 }}
          animate={{ rotate: 5, x: 100 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 overflow-hidden"
        >
          <div className="relative w-[200%] h-full">
            <img
              src={card.image_uris?.normal || card.image_uris?.small}
              alt={card.name}
              className="w-full h-full object-cover"
              style={{ transform: 'translateX(-50%)' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
              <h3 className="text-white text-sm font-semibold text-center">
                {card.name}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CardDestructionAnimation: React.FC<{ card: Card }> = ({ card }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <motion.div
        initial={{ scale: 1, opacity: 1 }}
        animate={{ 
          scale: [1, 1.2, 0],
          opacity: [1, 1, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 1,
          times: [0, 0.3, 1],
          ease: "easeInOut"
        }}
        className="relative w-64 h-96"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
          <img
            src={card.image_uris?.normal || card.image_uris?.small}
            alt={card.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
            <h3 className="text-white text-sm font-semibold text-center">
              {card.name}
            </h3>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ConfirmationDialog: React.FC<{ card: Card; onConfirm: () => void; onCancel: () => void }> = ({ card, onConfirm, onCancel }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
      >
        <h3 className="text-xl font-bold mb-4">Confirm Card Removal</h3>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg mb-4">
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
        <p className="text-gray-300 mb-6">
          This card will be randomly removed to make room for the basic land. Continue?
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="btn-glass"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn-glass-red"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface BasicLandSelectorProps {
  showModal?: boolean;
  onClose?: () => void;
}

const BasicLandSelector: React.FC<BasicLandSelectorProps> = ({ showModal = false, onClose }) => {
  const { state, dispatch } = useDraft();
  const [isOpen, setIsOpen] = useState(showModal);
  const [basicLands, setBasicLands] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardToRemove, setCardToRemove] = useState<Card | null>(null);
  const [showSplitAnimation, setShowSplitAnimation] = useState(false);
  const [selectedLand, setSelectedLand] = useState<Card | null>(null);

  // Update isOpen when showModal prop changes
  useEffect(() => {
    setIsOpen(showModal);
  }, [showModal]);

  // Call onClose when modal is closed
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const getLandCount = (landName: string) => {
    return state.deck.filter(card => card?.name === landName).length;
  };

  const isDeckFull = state.deck.length >= 99; // 99 + commander = 100

  // Get non-land cards that can be removed
  const removableCards = state.deck.filter(card => 
    !card.is_land && 
    !card.type_line.toLowerCase().includes('land')
  );

  useEffect(() => {
    const fetchBasicLands = async () => {
      setLoading(true);
      try {
        const colorIdentity = state.commander?.color_identity || [];
        const basicLandNames = colorIdentity.map(color => {
          switch (color) {
            case 'W': return 'Plains';
            case 'U': return 'Island';
            case 'B': return 'Swamp';
            case 'R': return 'Mountain';
            case 'G': return 'Forest';
            default: return 'Wastes';
          }
        }).filter(Boolean);
        basicLandNames.push('Wastes');

        const query = basicLandNames.map(name => `!${name}`).join(' OR ');
        
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

        setBasicLands(response.data.data);
      } catch (error) {
        console.error('Error fetching basic lands:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBasicLands();
    }
  }, [isOpen, state.commander]);

  const handleAddLand = (land: Card) => {
    if (isDeckFull) {
      // Only select a random card if one hasn't been selected yet
      if (!cardToRemove) {
        const randomIndex = Math.floor(Math.random() * removableCards.length);
        const randomCard = removableCards[randomIndex];
        setCardToRemove(randomCard);
      }
      setSelectedLand(land);
    } else {
      dispatch({ type: 'ADD_CARD', payload: land });
    }
  };

  const handleConfirmRemoval = () => {
    if (cardToRemove && selectedLand) {
      setShowSplitAnimation(true);
      setTimeout(() => {
        dispatch({ type: 'REMOVE_CARD', payload: cardToRemove.id });
        dispatch({ type: 'ADD_CARD', payload: selectedLand });
        setShowSplitAnimation(false);
        setCardToRemove(null);
        setSelectedLand(null);
      }, 1000);
    }
  };

  const handleCancelRemoval = () => {
    setSelectedLand(null);
  };

  if (!state.isCommanderSelected) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-glass-blue"
      >
        Add Basic Lands
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white/90">Add Basic Lands</h2>
                <button
                  onClick={handleClose}
                  className="text-white/70 hover:text-white/90"
                >
                  ✕
                </button>
              </div>

              {isDeckFull && (
                <div className="mb-4 p-4 bg-yellow-500/20 text-yellow-400 rounded-lg border border-yellow-500/30">
                  Your deck is full! A random non-land card will be removed to make room for basic lands.
                </div>
              )}

              {loading ? (
                <div className="text-center text-white/70">Loading basic lands...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {basicLands.map((land) => (
                    <motion.div
                      key={land.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: isDeckFull ? 1 : 1.05 }}
                      className={`cursor-pointer ${isDeckFull && !selectedLand ? 'opacity-50' : ''}`}
                      onClick={() => handleAddLand(land)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-white/5">
                        <img
                          src={land.image_uris?.normal || land.image_uris?.small}
                          alt={land.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                          {getLandCount(land.name)}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 backdrop-blur-sm">
                          <h3 className="text-white text-sm font-semibold text-center">
                            {land.name}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cardToRemove && selectedLand && (
          <ConfirmationDialog
            card={cardToRemove}
            onConfirm={handleConfirmRemoval}
            onCancel={handleCancelRemoval}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSplitAnimation && cardToRemove && (
          <CardDestructionAnimation card={cardToRemove} />
        )}
      </AnimatePresence>
    </>
  );
};

export default BasicLandSelector;