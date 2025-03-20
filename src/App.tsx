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
    </DraftProvider>
  );
}

export default App; 