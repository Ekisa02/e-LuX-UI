import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './slices/systemSlice';
import terminalReducer from './slices/terminalSlice';
import aiReducer from './slices/aiSlice';
import networkReducer from './slices/networkSlice';
import authReducer from './slices/authSlice';
import logger from './middleware/logger';

/**
 * Redux Store Configuration
 */
export const store = configureStore({
  reducer: {
    system: systemReducer,
    terminal: terminalReducer,
    ai: aiReducer,
    network: networkReducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['terminal/addOutput'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.data'],
        // Ignore these paths in the state
        ignoredPaths: ['terminal.outputs']
      }
    }).concat(logger),
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;