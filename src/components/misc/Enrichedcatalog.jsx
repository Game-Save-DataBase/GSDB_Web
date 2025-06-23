import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';
import normalizeToArray from '../../utils/helpers.js';

import 'bootstrap/dist/css/bootstrap.min.css';

function Catalog() {
  const PAGE_FETCH_LIMIT = 100; // cantidad a traer por fetch para cachear
  const DISPLAY_LIMIT = 10;     // cantidad que mostramos por página

  const [cachedGamesByLetter, setCachedGamesByLetter] = useState({});
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState('A');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Función que hace fetch para una letra y offset específicos
  const fetchPage = async (letter, offset) => {
    // Si ya tenemos datos cacheados, no hacemos nada
    if (cachedGamesByLetter[letter]?.[offset]) return;

    try {
      const res = await api.get(`${config.api.games}`, {
        params: {
          searchIGDB: true,
          limit: PAGE_FETCH_LIMIT,
          offset,
          'title[like]': letter,
        },
      });

      const data = normalizeToArray(res.data || []);

      setCachedGamesByLetter((prev) => ({
        ...prev,
        [letter]: {
          ...(prev[letter] || {}),
          [offset]: data,
        },
      }));
    } catch (err) {
      console.error(`Error fetching games for ${letter} offset ${offset}:`, err);
    }
  };

  // Cuando cambia la letra seleccionada, precargamos varias páginas
  useEffect(() => {
    const preloadOffsets = [0, 100, 200]; // precarga hasta 3 bloques (ajustable)

    preloadOffsets.forEach((offset) => {
      fetchPage(selectedLetter, offset);
    });

    setCurrentPage(1);
  }, [selectedLetter]);

  // Cuando cambian cache, letra o página, extraemos los juegos para mostrar
  useEffect(() => {
    const letterPages = cachedGamesByLetter[selectedLetter] || {};

    // Combina todos los arrays cacheados para esta letra en uno solo
    const flatGames = Object.values(letterPages).flat();

    // Si la página que quieres mostrar está fuera de los datos cacheados, intenta cargarla
    const maxCachedIndex = Math.max(...Object.keys(letterPages).map(Number), 0);
    const neededOffset = Math.floor((currentPage - 1) * DISPLAY_LIMIT / PAGE_FETCH_LIMIT) * PAGE_FETCH_LIMIT;

    if (neededOffset > maxCachedIndex) {
      fetchPage(selectedLetter, neededOffset);
    }

    const start = (currentPage - 1) * DISPLAY_LIMIT;
    const end = start + DISPLAY_LIMIT;

    setFilteredGames(flatGames.slice(start, end));
    setTotalResults(flatGames.length);
  }, [cachedGamesByLetter, selectedLetter, currentPage]);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
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
    const totalPages = Math.ceil(totalResults / DISPLAY_LIMIT);
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
