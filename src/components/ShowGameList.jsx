import React, { useState, useEffect } from 'react';
import '../App.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import GameCard from './GameCard';

function ShowGameList() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8082/api/games')
      .then((res) => {
        setGames(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowGameList');
      });
  }, []);

  const gameList =
    games.length === 0
      ? 'there is no game record!'
      : games.map((game, k) => <GameCard game={game} key={k} />);

  return (
    <div className='ShowGameList'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-12'>
            <br />
            <h2 className='display-4 text-center'>Games List</h2>
          </div>

          <div className='col-md-11'>
            <Link
              to='/create-game'
              className='btn btn-outline-warning float-right'
            >
              + Add New Game
            </Link>
            <br />
            <br />
            <hr />
          </div>
        </div>

        <div className='list'>{gameList}</div>
      </div>
    </div>
  );
}

export default ShowGameList;