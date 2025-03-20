import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { DraftProvider, useDraft } from './context/DraftContext';
import CommanderSelection from './components/CommanderSelection';
import DraftInterface from './components/DraftInterface';
import DeckExport from './components/DeckExport';
import DeckStats from './components/DeckStats';

const AppContent = () => {
  const { dispatch } = useDraft();
  const [typedKeys, setTypedKeys] = React.useState('');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const newTypedKeys = (typedKeys + e.key).toLowerCase();
      setTypedKeys(newTypedKeys.slice(-7)); // Keep only the last 7 characters

      if (newTypedKeys.includes('edhrank')) {
        dispatch({ type: 'TOGGLE_EDHREC_RANK' });
        setTypedKeys(''); // Reset the typed keys
      } else if (newTypedKeys.includes('debug')) {
        dispatch({ type: 'TOGGLE_DEBUG_INFO' });
        setTypedKeys(''); // Reset the typed keys
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [typedKeys, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="absolute inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <header className="relative bg-white/10 backdrop-blur-md border-b border-white/20 py-4">
        <h1 className="text-3xl font-bold text-center text-white/90">EDH Draft</h1>
      </header>
      <div className="flex relative">
        <main className="flex-1 container mx-auto px-4 py-8 pr-72">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-12"
          >
            <CommanderSelection />
            <DraftInterface />
            <DeckExport />
          </motion.div>
        </main>
        <DeckStats />
      </div>
    </div>
  );
};

function App() {
  return (
    <DraftProvider>
      <AppContent />
    </DraftProvider>
  );
}

export default App; 