import { createContext, useState } from "react";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(1); //empezamos con un estado "loading" que pondremos invisible nada mas cargar la primera vez

  const startLoading = () => setLoadingCount(prev => prev + 1);
  const stopLoading = () => setLoadingCount(prev => Math.max(prev - 1, 0));

  return (
    <LoadingContext.Provider value={{ loading: loadingCount > 0, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
