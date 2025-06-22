import { React, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/utils/VerticalCard.scss';
import config from '../../utils/config'
import api from '../../utils/interceptor';


// Props: imagen del juego, titulo del save, inicio de la descripcion, nombre de usuario, link usuario, link del save, rating, plataforma
const VerticalCard = ({ image, image_default, title, description, username, cLink, userLink, rating, platformsID }) => {
  const [platformNames, setPlatformNames] = useState([]);

  useEffect(() => {
    const fetchPlatformNames = async () => {
      try {
        const res = await api.get(config.api.platforms);
        const platformsDB = Array.isArray(res.data) ? res.data : [res.data];
        const names = platformsDB
          .filter(p => platformsID?.includes(p.IGDB_ID))
          .map(p => p.name);
        setPlatformNames(names);
      } catch (err) {
        console.error("Error fetching platform names on vertical card:", err);
      }
    };

    if (Array.isArray(platformsID) && platformsID.length > 0) {
      fetchPlatformNames();
    }
  }, [platformsID]);


  // Usa saveLink si existe; si no, deja el enlace inactivo (fallback a "#")
  const cardLink = cLink || "#";
  return (
    <Link to={cardLink} className="card-container">
      <div className="card">
        {image && (
          <img
            src={image}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = image_default;
            }}
            className="card-img-top"
            alt={title || "cover"}
          />
        )}
        <div className="card-body">
          {title && <h5 className="card-title">{title}</h5>}
          {description && <p className="card-text">{description}</p>}
          {platformNames.length > 0 && (
            <p className="card-platform">
              <strong>Platforms:</strong> {platformNames.join(', ')}
            </p>
          )}
          {rating !== undefined && (
            <p className="card-rating"><strong>Rating:</strong> {rating}</p>
          )}
          {username && userLink && (
            <Link to={userLink} className="card-username">@{username}</Link>
          )}
        </div>
      </div>
    </Link>
  );
};

export default VerticalCard;
