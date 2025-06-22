import config from '../../utils/config.js';
import api from "../../utils/interceptor.js";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import normalizeToArray from '../../utils/helpers.js'

import FilterBar from '../filters/FilterBar.jsx';
import FilterPlatform from '../filters/FilterPlatform.jsx';

import '../../styles/Common.scss';

function Catalog() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await api.get(`${config.api.platforms}`);
        const data = normalizeToArray(res.data || []);
        setPlatforms(data);
      } catch (err) {
        console.error("Error fetching platforms:", err);
      }
    };

    const fetchGames = async () => {
      try {
        const res = await api.get(`${config.api.games}`);
        const data = normalizeToArray(res.data || []);
        setGames(data);
        setFilteredGames(data);
      } catch (err) {
        console.error("Error fetching games:", err);
      }
    };

    // Ejecutar primero plataformas, luego juegos
    const init = async () => {
      await fetchPlatforms();
      await fetchGames();
    };

    init();
  }, []);


  const filters = useMemo(() => [
    {
      type: FilterPlatform,
      props: {
        platforms: platforms, // array completo con id, nombre y abbreviation
        disabled: [],
        mode: 'anyMatch',
      }
    }
  ], [platforms]);


  const handleFilteredChange = useCallback(filtered => {
    setFilteredGames(filtered);
  }, []);

  return (
    <div>
      <h1>GSDB Catalog</h1>

      <FilterBar
        data={games}
        filters={filters}
        onFilteredChange={handleFilteredChange}
      />

      <ul>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <li key={game._id}>
              <Link to={`/game/${game._id}`}>{game.title}</Link>
            </li>
          ))
        ) : (
          <p>No games available.</p>
        )}
      </ul>
    </div>
  );
}

export default Catalog;
