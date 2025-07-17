// src/contexts/LoadingContext.js
import React, { createContext, useState, useCallback } from 'react';

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const block = useCallback(() => setIsBlocked(true), []);
  const unblock = useCallback(() => setIsBlocked(false), []);
  const markAsLoaded = useCallback(() => setIsInitialLoad(false), []);
  const resetLoad = useCallback(() => setIsInitialLoad(true), []);

  return (
    <LoadingContext.Provider value={{
      isBlocked,
      isInitialLoad,
      block,
      unblock,
      markAsLoaded,
      resetLoad
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
