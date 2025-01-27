import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Common.scss';


const GameCard = ({ game }) => {

  return (
    <div>
      <img
        src={game.imagePath}
        alt={game.name}
        height={200}
      />
      <h2>
        <Link to={`/game/${game._id}`}>{game.name}</Link>
      </h2>
      <h3>{game.platformsID}</h3>
    </div>
  );
};
export default GameCard;