import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const GameCard = ({game}) => {

  return (
    <div className='card-container'>
      <img
        src='https://images.unsplash.com/photo-1495446815901-a7297e633e8d'
        alt='Games'
        height={200}
      />
      <div className='desc'>
        <h2>
          <Link to={`/game/${game._id}`}>{game.name}</Link>
        </h2>
        <h3>{game.platformsID}</h3>
      </div>
    </div>
  );
};
export default GameCard;