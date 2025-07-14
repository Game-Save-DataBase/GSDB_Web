import { useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import config from '../../utils/config'
import { UserContext } from "../../contexts/UserContext.jsx";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import '../../styles/utils/FavoriteButton.scss';


const FavoriteButton = ({ gameID}) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const { user: loggedUser, updateUser } = useContext(UserContext);

  // Verificamos si ya es favorito
  useEffect(() => {
    if (loggedUser && loggedUser.favGames) {
      const alreadyFavorited = loggedUser.favGames.includes(gameID);
      setIsFavorite(alreadyFavorited);
    }
  }, [loggedUser, gameID]);

   const handleFavorite = async () => {
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    try {
      if (!isFavorite) {
        // Unfavorite
        
        await api.post(`${config.api.users}/favorite-game-toggle`, { gameID, action: "favorite" });
        setIsFavorite(false);
      } else {
        // Favorite
        await api.post(`${config.api.users}/favorite-game-toggle`, { gameID, action: "unfavorite" });
        setIsFavorite(true);
      }
      updateUser();
    } catch (err) {
      console.error('Error al actualizar favoritos:', err);
      alert('Hubo un error al actualizar tus favoritos.');
    }
  };

  return (
    <button
      className={`favorite-button ${isFavorite ? 'favorite' : 'not-favorite'}`}
      onClick={handleFavorite}
      aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <FontAwesomeIcon icon={faStar} size="2x" />
    </button>
  );
};

export default FavoriteButton;