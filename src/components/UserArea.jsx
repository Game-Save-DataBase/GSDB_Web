import config from "../utils/config"
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/interceptor';

function UserArea() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`${config.api.auth}/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Usuario no autenticado', error);
        navigate('/login'); // o si quieres mostrar mensaje, comenta esta línea
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="user-area">
      {user ? (
        <h2>Hola, {user.alias || user.userName || 'Usuario'}</h2>
      ) : (
        <p>Cargando usuario...</p>
      )}
    </div>
  );
}

export default UserArea;
