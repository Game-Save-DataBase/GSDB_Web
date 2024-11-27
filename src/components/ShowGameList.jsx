import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GameCard from './GameCard';
import '../styles/Common.css';


function ShowGameList() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8082/api/games')
      .then((res) => {
        setGames(res.data);
      })
      .catch((err) => {
      });
  }, []);

  const gameList =
    games.length === 0
      ? 'there is no game record in the database!'
      : games.map((game, k) => <GameCard game={game} key={k} />);

  return (
    <div>
      <h2>Games List</h2>
      <div>{gameList}</div>
    </div>

  );
}

export default ShowGameList;