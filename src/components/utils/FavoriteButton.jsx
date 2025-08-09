import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import config from '../../utils/config';
import { UserContext } from "../../contexts/UserContext.jsx";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import '../../styles/utils/FavoriteButton.scss';

const FavoriteButton = ({ gameID, saveID }) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { user: loggedUser, updateUser } = useContext(UserContext);

  const idType = saveID ? 'save' : 'game';
  const idValue = saveID || gameID;

  // Chequear si el usuario ya tiene este favorito
  useEffect(() => {
    if (loggedUser && idValue) {
      if (idType === 'game' && loggedUser.favGames) {
        setIsFavorite(loggedUser.favGames.includes(Number(idValue)));
      } else if (idType === 'save' && loggedUser.favSaves) {
        setIsFavorite(loggedUser.favSaves.includes(Number(idValue)));
      }
    }
  }, [loggedUser, idValue, idType]);

  const handleFavorite = async () => {
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    try {
      const payload = idType === 'game' ? { gameID: idValue } : { saveID: idValue };
      const endpoint = isFavorite ? '/remove-favorite' : '/add-favorite';

      await api.post(`${config.api.users}${endpoint}`, payload);
      setIsFavorite(!isFavorite);
      updateUser();
    } catch (err) {
      console.error('error updating favorites:', err);
      alert('Error updating favorites');
    }
  };

  return (
    <button
      className={`favorite-button ${isFavorite ? 'favorite' : 'not-favorite'}`}
      onClick={handleFavorite}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <FontAwesomeIcon icon={faStar} size="2x" />
    </button>
  );
};

export default FavoriteButton;
