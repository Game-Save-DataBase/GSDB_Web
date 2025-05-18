import config from "../../utils/config"
import React, { useState, useContext,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import { UserContext } from '../../contexts/UserContext.jsx';

function UserArea() {
  const navigate = useNavigate();
  const { user: loggedUser } = useContext(UserContext);

  useEffect(() => {
    if (!loggedUser) {
      // console.error('Usuario no autenticado', error);
      navigate('/login'); 
    }
  }, [navigate]);

  return (
    <div className="user-area">
      {loggedUser ? (
        <h2>Hola, {loggedUser.alias || loggedUser.userName || 'Usuario'}</h2>
      ) : (
        <p>Cargando usuario...</p>
      )}
    </div>
  );
}

export default UserArea;
