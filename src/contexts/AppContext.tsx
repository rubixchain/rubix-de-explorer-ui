import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// Load selected network from local storage or default to testnet
const loadSelectedNetwork = (): string => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_NETWORK);
    return saved || 'testnet';
  } catch (error) {
    console.error('Failed to load network from local storage:', error);
    return 'testnet';
  }
};

const initialState: AppState = {
  searchQuery: '',
  selectedChain: loadSelectedNetwork(),
  isLoading: false,
  error: null,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_CHAIN':
      return { ...state, selectedChain: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  setSearchQuery: (query: string) => void;
  setSelectedChain: (chain: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Save selected network to local storage when it changes
  useEffect(() => {
    try {
      
      localStorage.setItem(STORAGE_KEYS.SELECTED_NETWORK, state.selectedChain);
      
    } catch (error) {
      console.error('Failed to save network to local storage:', error);
    }
  }, [state.selectedChain]);

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setSelectedChain = (chain: string) => {
    
    dispatch({ type: 'SET_SELECTED_CHAIN', payload: chain });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const value: AppContextType = {
    state,
    dispatch,
    setSearchQuery,
    setSelectedChain,
    setLoading,
    setError,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
