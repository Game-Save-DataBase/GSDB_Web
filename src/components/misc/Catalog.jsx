import config from '../../utils/config.js';
import api from "../../utils/interceptor.js";
import { PLATFORMS } from '../../utils/constants.jsx';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';

import FilterBar from '../filters/FilterBar.jsx';
import FilterPlatform from '../filters/FilterPlatform.jsx';

import '../../styles/Common.scss';

function Catalog() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [disabledPlatforms, setDisabledPlatforms] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get(`${config.api.games}`);
        const data = res.data || [];
        setGames(data);
        setFilteredGames(data);

        // Determinar plataformas sin juegos
        const platformsUsed = new Set(data.flatMap(game => game.platformsID || []));
        const disabled = PLATFORMS.map(p => p.id).filter(id => !platformsUsed.has(id));
        setDisabledPlatforms(disabled);
      } catch (err) {
        console.error("Error fetching games:", err);
      }
    };
    fetchGames();
  }, []);

  const filters = useMemo(() => [
    {
      type: FilterPlatform,
      props: {
        platforms: PLATFORMS.map(p => p.id),
        disabled: disabledPlatforms,
        mode: 'anyMatch', // Personalizado si quieres expandir FilterPlatform
      }
    },
    {
      type: FilterPlatform,
      props: {
        platforms: PLATFORMS.map(p => p.id),
        disabled: disabledPlatforms,
        mode: 'anyMatch', // Personalizado si quieres expandir FilterPlatform
      }
    }
  ], [disabledPlatforms]);

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
