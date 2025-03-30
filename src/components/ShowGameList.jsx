import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.scss';
import { PLATFORMS } from '../components/constants.jsx'
import Form from 'react-bootstrap/Form';

function ShowGameList() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [activeCheckboxes, setActiveCheckboxes] = useState({});
  const [enabledCheckboxes, setCheckboxesEnabled] = useState({});

  // Obtener la lista de juegos desde la API
  useEffect(() => {
    axios
      .get('http://localhost:8082/api/games')
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
    const activePlatforms = Object.keys(activeCheckboxes).filter(platform => activeCheckboxes[platform]);

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
      <Form>
        {PLATFORMS.map((platform) => (
          <Form.Check
            key={platform.id}
            type="switch"
            id={`switch-${platform.id}`}
            label={platform.name}
            checked={activeCheckboxes[platform.id] || false}
            disabled={!enabledCheckboxes[platform.id]}
            onChange={() => handleCheckboxChange(platform.id)}
          />
        ))}
      </Form>

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