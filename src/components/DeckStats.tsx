import React from 'react';
import { useDraft } from '../context/DraftContext';
import { Card } from '../types/card';

const TARGET_RARITY_DISTRIBUTION = {
  common: 40,
  uncommon: 35,
  rare: 20,
  mythic: 5,
};

const RARITY_COLORS = {
  common: '#C1C1C1',
  uncommon: '#B3C4D3',
  rare: '#F9D70B',
  mythic: '#F9A70B',
};

const DeckStats: React.FC = () => {
  const { state } = useDraft();

  if (!state.isCommanderSelected) {
    return null;
  }

  const calculateStats = () => {
    const commander = state.commander;
    const deck = [...state.deck, state.commander];

    // Calculate card type counts
    const creatures = deck.filter((card): card is Card => card !== null && card.type_line.toLowerCase().includes('creature')).length;
    const lands = deck.filter((card): card is Card => 
      card !== null && (
        card.is_land || 
        card.type_line.toLowerCase().includes('land')
      )
    ).length;
    const artifacts = deck.filter((card): card is Card => card !== null && card.type_line.toLowerCase().includes('artifact')).length;
    const enchantments = deck.filter((card): card is Card => card !== null && card.type_line.toLowerCase().includes('enchantment')).length;
    const instants = deck.filter((card): card is Card => card !== null && card.type_line.toLowerCase().includes('instant')).length;
    const sorceries = deck.filter((card): card is Card => card !== null && card.type_line.toLowerCase().includes('sorcery')).length;

    // Calculate mana curve
    const manaCurve = Array(7).fill(0);
    deck.forEach(card => {
      if (card && !card.is_land) {
        const cmc = card.cmc;
        if (cmc >= 7) {
          manaCurve[6]++;
        } else {
          manaCurve[cmc]++;
        }
      }
    });

    // Calculate rarity distribution
    const rarityDistribution = {
      common: 0,
      uncommon: 0,
      rare: 0,
      mythic: 0,
    };

    deck.forEach(card => {
      if (card) {
        const rarity = card.rarity.toLowerCase();
        if (rarity in rarityDistribution) {
          rarityDistribution[rarity as keyof typeof rarityDistribution]++;
        }
      }
    });

    // Get color identity
    const colors = commander?.color_identity || [];
    const colorNames = {
      W: 'White',
      U: 'Blue',
      B: 'Black',
      R: 'Red',
      G: 'Green',
    };

    return {
      commander,
      colors: colors.map(c => colorNames[c as keyof typeof colorNames]).join(' / '),
      totalCards: deck.length,
      creatures,
      lands,
      artifacts,
      enchantments,
      instants,
      sorceries,
      manaCurve,
      rarityDistribution,
    };
  };

  const stats = calculateStats();

  return (
    <div className="fixed right-0 top-0 h-full w-64 bg-gray-800 p-4 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-2">Commander</h3>
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg">
            <img
              src={stats.commander?.image_uris?.normal || stats.commander?.image_uris?.small}
              alt={stats.commander?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm text-gray-300 mt-2">{stats.commander?.name}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Colors</h3>
          <p className="text-gray-300">{stats.colors}</p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Deck Size</h3>
          <p className="text-gray-300">{stats.totalCards} / 100 cards</p>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Card Types</h3>
          <div className="space-y-1 text-sm text-gray-300">
            <p>Creatures: {stats.creatures}</p>
            <p>Lands: {stats.lands}</p>
            <p>Artifacts: {stats.artifacts}</p>
            <p>Enchantments: {stats.enchantments}</p>
            <p>Instants: {stats.instants}</p>
            <p>Sorceries: {stats.sorceries}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Rarity Distribution</h3>
          <div className="space-y-2">
            {Object.entries(stats.rarityDistribution).map(([rarity, count]) => {
              const percentage = (count / stats.totalCards) * 100;
              const targetPercentage = TARGET_RARITY_DISTRIBUTION[rarity as keyof typeof TARGET_RARITY_DISTRIBUTION];
              const difference = targetPercentage - percentage;
              
              return (
                <div key={rarity} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize" style={{ color: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS] }}>
                      {rarity}
                    </span>
                    <span className="text-gray-300">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: RARITY_COLORS[rarity as keyof typeof RARITY_COLORS],
                      }}
                    />
                  </div>
                  {Math.abs(difference) > 5 && (
                    <div className="text-xs text-gray-400">
                      {difference > 0 ? 'Need more' : 'Need fewer'} {rarity} cards
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-2">Mana Curve</h3>
          <div className="flex items-end h-32 space-x-1">
            {stats.manaCurve.map((count, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(count / Math.max(...stats.manaCurve)) * 100}%` }}
                />
                <span className="text-xs text-gray-300 mt-1">{count}</span>
                <span className="text-xs text-gray-400">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckStats; 