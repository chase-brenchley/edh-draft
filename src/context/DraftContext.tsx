import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Card } from '../types/card';

interface DraftState {
  commander: Card | null;
  deck: Card[];
  rerollsRemaining: number;
  isCommanderSelected: boolean;
  currentPick: Card[];
  draftComplete: boolean;
  availableCards: Card[];
  landModalShown: boolean;
  showEDHRECRank: boolean;
  showDebugInfo: boolean;
}

type DraftAction =
  | { type: 'SELECT_COMMANDER'; payload: Card }
  | { type: 'REROLL_COMMANDER' }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'REMOVE_CARD'; payload: string }
  | { type: 'SET_CURRENT_PICK'; payload: Card[] }
  | { type: 'COMPLETE_DRAFT' }
  | { type: 'SET_AVAILABLE_CARDS'; payload: Card[] }
  | { type: 'SET_LAND_MODAL_SHOWN'; payload: boolean }
  | { type: 'TOGGLE_EDHREC_RANK' }
  | { type: 'TOGGLE_DEBUG_INFO' };

const initialState: DraftState = {
  commander: null,
  deck: [],
  rerollsRemaining: 2,
  isCommanderSelected: false,
  currentPick: [],
  draftComplete: false,
  availableCards: [],
  landModalShown: false,
  showEDHRECRank: false,
  showDebugInfo: false,
};

const DraftContext = createContext<{
  state: DraftState;
  dispatch: React.Dispatch<DraftAction>;
} | null>(null);

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'SELECT_COMMANDER':
      return {
        ...state,
        commander: action.payload,
        isCommanderSelected: true,
        deck: [...state.deck, action.payload],
      };
    case 'REROLL_COMMANDER':
      return {
        ...state,
        rerollsRemaining: state.rerollsRemaining - 1,
      };
    case 'ADD_CARD':
      return {
        ...state,
        deck: [...state.deck, action.payload],
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        deck: state.deck.filter(card => card.id !== action.payload),
      };
    case 'SET_CURRENT_PICK':
      return {
        ...state,
        currentPick: action.payload,
      };
    case 'COMPLETE_DRAFT':
      return {
        ...state,
        draftComplete: true,
      };
    case 'SET_AVAILABLE_CARDS':
      return {
        ...state,
        availableCards: action.payload,
      };
    case 'SET_LAND_MODAL_SHOWN':
      return {
        ...state,
        landModalShown: action.payload,
      };
    case 'TOGGLE_EDHREC_RANK':
      return {
        ...state,
        showEDHRECRank: !state.showEDHRECRank,
      };
    case 'TOGGLE_DEBUG_INFO':
      return {
        ...state,
        showDebugInfo: !state.showDebugInfo,
      };
    default:
      return state;
  }
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(draftReducer, initialState);

  return (
    <DraftContext.Provider value={{ state, dispatch }}>
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error('useDraft must be used within a DraftProvider');
  }
  return context;
} 