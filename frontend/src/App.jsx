import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import MainDashboardPage from './pages/MainDashboardPage';
import { checkAuthStatus } from './store/slices/authSlice';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

/**
 * Main App Component
 * Handles routing between login and dashboard based on auth state
 */
function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const [initialized, setInitialized] = useState(false);

  // Check authentication status on app start
  useEffect(() => {
    const init = async () => {
      await dispatch(checkAuthStatus());
      setInitialized(true);
    };
    
    init();
  }, [dispatch]);

  if (!initialized || loading) {
    return <Loader fullScreen text="Initializing e-LuX-UI..." />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {isAuthenticated ? (
          <MainDashboardPage key="dashboard" />
        ) : (
          <LoginPage key="login" />
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;