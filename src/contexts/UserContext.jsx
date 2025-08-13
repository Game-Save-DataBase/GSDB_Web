import config from "../utils/config"
import { createContext, useState, useEffect } from "react";
import api from "../utils/interceptor";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const printuser = async () => {
      console.log("USER AHORA MISMO ES:", user)
      const res = await api.get(`${config.api.auth}/me`);
      console.log("RESULTADO AUTH/ME:", res.data)
    };
    printuser();
  }, [user]);

  const updateUser = async () => {
    try {
      const res = await api.get(`${config.api.auth}/me`);
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      await updateUser();
      setLoading(false);
    };

    checkSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};
