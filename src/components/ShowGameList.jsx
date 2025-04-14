import config from '../utils/config.js';
import api from "../utils/interceptor";
import { PLATFORMS } from '../utils/constants.jsx'
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/Common.scss';

function ShowGameList() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [activeCheckboxes, setActiveCheckboxes] = useState({});
  const [enabledCheckboxes, setCheckboxesEnabled] = useState({});

  // Obtener la lista de juegos desde la API
  useEffect(() => {
    api
      .get(`${config.api.games}`)
      .then((res) => {
        setGames(res.data);
        setFilteredGames(res.data);
        //funcion para inicializar las checkboxes con la info obtenida
        initializeCheckboxes(res.data);
      })
      .catch((err) => {
        console.error('Error fetching games:', err);
      });
  }, []);

  // Inicializar checkboxes basados en los juegos obtenidos
  const initializeCheckboxes = (gamesData) => {
    // Identificar qué plataformas están presentes en los juegos
    const platformsWithGames = new Set(
      gamesData.flatMap(game => game.platformsID || [])
    );

    // Crear estado inicial para checkboxes habilitados y activos
    const newEnabledCheckboxes = {};
    const newActiveCheckboxes = {};

    PLATFORMS.forEach(platform => {
      newEnabledCheckboxes[platform.id] = platformsWithGames.has(platform.id);
      newActiveCheckboxes[platform.id] = platformsWithGames.has(platform.id); // Se activan solo si hay juegos con esa plataforma
    });

    setCheckboxesEnabled(newEnabledCheckboxes);
    setActiveCheckboxes(newActiveCheckboxes);
  };

  // Filtrar juegos cuando cambian los checkboxes activos
  useEffect(() => {
    const activePlatforms = Object.keys(activeCheckboxes).filter(platform => activeCheckboxes[platform]).map(Number); //map para convertir de string a numero
    const filtered = games.filter(game =>
      game.platformsID.some(platform => activePlatforms.includes(platform))
    );

    setFilteredGames(filtered);
  }, [activeCheckboxes, games]);

  // Manejar cambio en los checkboxes
  const handleCheckboxChange = (platform) => {
    setActiveCheckboxes(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };
  return (
    <div>
      <h3>Filtrar por Plataforma</h3>
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