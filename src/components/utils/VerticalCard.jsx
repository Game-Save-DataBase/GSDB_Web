import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/utils/VerticalCard.scss';

// Props: imagen del juego, titulo del save, inicio de la descripcion, nombre de usuario, link usuario, link del save, rating, plataforma
const VerticalCard = ({ image, title, description, username, cLink, userLink, rating, platform }) => {
  // Usa saveLink si existe; si no, deja el enlace inactivo (fallback a "#")
  const cardLink = cLink || "#";

  return (
    <Link to={cardLink} className="card-container">
      <div className="card">
        {image && <img src={image} className="card-img-top" alt={title || "cover"} />}
        <div className="card-body">
          {title && <h5 className="card-title">{title}</h5>}
          {description && <p className="card-text">{description}</p>}
          {platform && <p className="card-platform"><strong>Plataforma:</strong> {platform}</p>}
          {rating !== undefined && (
            <p className="card-rating"><strong>Rating:</strong> {rating} </p>
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
