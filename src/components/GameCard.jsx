import React from 'react';
import { Link } from 'react-router-dom';

const GameCard = ({ game }) => {

  return (
    <div>
      <img
        src='https://i0.wp.com/bossrush.net/wp-content/uploads/2022/07/retro-1.jpg?resize=1200%2C1080&ssl=1'
        alt='Games'
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