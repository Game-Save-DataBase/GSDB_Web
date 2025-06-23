import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';
import normalizeToArray from '../../utils/helpers.js';

import 'bootstrap/dist/css/bootstrap.min.css';

function Catalog() {
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  const fetchGames = async (letter, page) => {
    const offset = (page - 1) * limit;

    try {
      const res = await api.get(`${config.api.games}`, {
        params: {
          searchIGDB: true,
          limit,
          offset,
          'title[like]': letter
        }
      });

      const data = normalizeToArray(res.data || []);
      setFilteredGames(data);
      setTotalResults(data.length < limit && page === 1 ? data.length : 1000); // ← usar un número alto si no tienes total real
    } catch (err) {
      console.error("Error fetching games:", err);
      setFilteredGames([]);
    }
  };

  useEffect(() => {
    fetchGames(selectedLetter, currentPage);
  }, [selectedLetter, currentPage]);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setCurrentPage(1);
  };

  const renderAlphabetControls = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
      <div className="btn-group flex-wrap mb-3" role="group">
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            className={`btn btn-sm ${selectedLetter === letter ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalResults / limit);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav>
        <ul className="pagination">
          {pageNumbers.map((number) => (
            <li
              key={number}
              className={`page-item ${currentPage === number ? 'active' : ''}`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    );
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">GSDB Catalog</h1>

      {renderAlphabetControls()}

      <ul className="list-group mb-3">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <li key={game.IGDB_ID || game._id} className="list-group-item">
              <Link to={`/game/${game._id || game.IGDB_ID}`}>{game.title}</Link>
            </li>
          ))
        ) : (
          <li className="list-group-item text-muted">No games available.</li>
        )}
      </ul>

      {renderPagination()}
    </div>
  );
}

export default Catalog;
