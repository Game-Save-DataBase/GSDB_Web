import config from "../utils/config"
import { createContext, useState, useEffect } from "react";
import api from "../utils/interceptor";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // usuario activo
  const [loading, setLoading] = useState(true); // flag para saber si aún se está comprobando sesión

  // comprobamos la sesión activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get(`${config.api.auth}/me`);
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false); // terminamos la comprobación
      }
    };

    checkSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
