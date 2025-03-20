import React from 'react';
import { motion } from 'framer-motion';
import { DraftProvider } from './context/DraftContext';
import CommanderSelection from './components/CommanderSelection';
import DraftInterface from './components/DraftInterface';
import DeckExport from './components/DeckExport';
import DeckStats from './components/DeckStats';

function App() {
  return (
    <DraftProvider>
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 py-4">
          <h1 className="text-3xl font-bold text-center">EDH Draft</h1>
        </header>
        <div className="flex">
          <main className="flex-1 container mx-auto px-4 py-8 pr-72">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CommanderSelection />
              <DraftInterface />
              <DeckExport />
            </motion.div>
          </main>
          <DeckStats />
        </div>
      </div>
    </DraftProvider>
  );
}

export default App; 