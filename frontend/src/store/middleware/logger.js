/**
 * Redux Logger Middleware
 * Logs actions and state changes in development
 */
const logger = store => next => action => {
  if (process.env.NODE_ENV !== 'development') {
    return next(action);
  }

  console.group(`%c Action: ${action.type}`, 'color: #00ff41');
  console.log('%c Previous State:', 'color: #ff00ff', store.getState());
  console.log('%c Action:', 'color: #00ffff', action);
  
  const result = next(action);
  
  console.log('%c Next State:', 'color: #ffff00', store.getState());
  console.groupEnd();
  
  return result;
};

export default logger;