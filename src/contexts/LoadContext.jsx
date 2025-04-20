import React, { createContext, useState, useCallback } from "react";

export const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [pagesLoaded, setPagesLoaded] = useState([]);

  const startLoading = useCallback(() => {
    setLoadingCount(count => count + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount(count => Math.max(0, count - 1));
  }, []);

  const markPageLoaded = useCallback((pageName) => {
    setPagesLoaded(prev => [...prev, pageName]);
  }, []);

  const clearPagesLoaded = useCallback(() => {
    setPagesLoaded([]);
  }, []);

  const isPageLoaded = (pageName) => pagesLoaded.includes(pageName);
  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ 
      startLoading, 
      stopLoading, 
      markPageLoaded, 
      clearPagesLoaded, 
      isPageLoaded, 
      isLoading 
    }}>
      {children}
    </LoadingContext.Provider>
  );
}
