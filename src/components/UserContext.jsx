//esto ira por encima del layout, para poder comprobar usuarios

import config from "../utils/config"
import { createContext, useState, useEffect } from "react";
import api from "../utils/interceptor";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); //usuario activo

  // comprobamos la sesion activa al cargar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await api.get(`${config.api.auth}/me`);
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    };

    checkSession();
  }, []);

  return (
    //devolvemos el provider creado con el usuario que haya activo y todo lo que tenga debajo (el layout)
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
