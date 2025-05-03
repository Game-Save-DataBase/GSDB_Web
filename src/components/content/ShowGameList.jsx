import config from '../../utils/config.js';
import api from "../../utils/interceptor.js";
import { PLATFORMS } from '../../utils/constants.jsx';
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Common.scss';

function ShowGameList() {

  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [activeCheckboxes, setActiveCheckboxes] = useState({});
  const [enabledCheckboxes, setCheckboxesEnabled] = useState({});

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await api.get(`${config.api.games}`);
        setGames(res.data);
        setFilteredGames(res.data);
        initializeCheckboxes(res.data);
      } catch (err) {
        console.error("Error fetching games:", err);
      }
    };
    fetchGames();
  }, []);


  const initializeCheckboxes = (gamesData) => {
    const platformsWithGames = new Set(
      gamesData.flatMap(game => game.platformsID || [])
    );

    const newEnabledCheckboxes = {};
    const newActiveCheckboxes = {};

    PLATFORMS.forEach(platform => {
      newEnabledCheckboxes[platform.id] = platformsWithGames.has(platform.id);
      newActiveCheckboxes[platform.id] = platformsWithGames.has(platform.id);
    });

    setCheckboxesEnabled(newEnabledCheckboxes);
    setActiveCheckboxes(newActiveCheckboxes);
  };

  useEffect(() => {
    const activePlatforms = Object.keys(activeCheckboxes).filter(platform => activeCheckboxes[platform]).map(Number);
    const filtered = games.filter(game =>
      game.platformsID.some(platform => activePlatforms.includes(platform))
    );

    setFilteredGames(filtered);
  }, [activeCheckboxes, games]);

  const handleCheckboxChange = (platform) => {
    setActiveCheckboxes(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <div>
      <h1>Filtrar por Plataforma</h1>
      <form>
        {PLATFORMS.map((platform) => (
          <div className="form-check form-switch" key={platform.id}>
            <input
              className="form-check-input"
              type="checkbox"
              id={`switch-${platform.id}`}
              checked={activeCheckboxes[platform.id] || false}
              disabled={!enabledCheckboxes[platform.id]}
              onChange={() => handleCheckboxChange(platform.id)}
            />
            <label className="form-check-label" htmlFor={`switch-${platform.id}`}>
              {platform.name}
            </label>
          </div>
        ))}
      </form>

      <h3>Juegos Disponibles</h3>
      <ul>
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => (
            <li key={game._id}>
              <Link to={`/game/${game._id}`}>{game.title}</Link>
            </li>
          ))
        ) : (
          <p>No hay juegos disponibles para las plataformas seleccionadas.</p>
        )}
      </ul>
    </div>
  );
}

export default ShowGameList;
