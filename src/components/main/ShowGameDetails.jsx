import config from '../../utils/config.js';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../utils/interceptor.js';
import '../../styles/Common.scss';
import '../../styles/main/ShowGameDetails.scss';
import { getPlatformName } from '../../utils/constants.jsx';

function ShowGameDetails() {
  const [game, setGame] = useState(null); // mejor iniciar null para distinguir "no cargado"
  const [saveFiles, setSaveFiles] = useState([]);
  const [activePlatforms, setActivePlatforms] = useState([]);
  const [enabledPlatforms, setEnabledPlatforms] = useState([]);
  const [filteredSaveFiles, setFilteredSaveFiles] = useState([]);

  const { id } = useParams();

  // Carga los detalles del juego
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data } = await api.get(`${config.api.games}?_id=${id}`);
        if (!data) {
          console.warn(`Game with ID ${id} not found.`);
          setGame(null);
          return;
        }
        setGame(data);
      } catch (err) {
        console.error('Failed to load game details:', err.response?.data?.msg || err.message || err);
        setGame(null);
      }
    };
    fetchGameDetails();
  }, [id]);

  // Carga los archivos de guardado asociados
  useEffect(() => {
    const fetchSaveFiles = async () => {
      if (!game || !game.platformsID) return;

      try {
        const { data } = await api.get(`${config.api.savedatas}?gameID=${id}`);

        // Si no hay datos (array vacío) no es error, limpiamos estado
        if (!data || data.length === 0) {
          console.info(`No save files found for game ID ${id}.`);
          setSaveFiles([]);
          setFilteredSaveFiles([]);
          return;
        }

        // Completar con datos de usuario
        const updatedSaveFiles = await Promise.all(
          data.map(async (sf) => {
            try {
              const { data: userData } = await api.get(`${config.api.users}?_id=${sf.userID}`);
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: userData?.alias || userData?.userName || "Desconocido",
                pfp: userData?.pfp || config.paths.pfp_default,
              };
            } catch (err) {
              // Log interno y devolvemos con alias/pfp por defecto
              console.warn(`Failed to load user for savefile ${sf._id}:`, err.message || err);
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: "Desconocido",
                pfp: config.paths.pfp_default,
              };
            }
          })
        );

        const sortedSaveFiles = updatedSaveFiles.sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );

        setSaveFiles(sortedSaveFiles);
        setFilteredSaveFiles(sortedSaveFiles);

      } catch (err) {
        if (err.response?.status === 404) {
          // No es error, simplemente no hay saves
          setSaveFiles([]);
          setFilteredSaveFiles([]);
          return;
        }
        console.error('Failed to fetch save files:', err.response?.data?.msg || err.message || err);
      }
    };

    fetchSaveFiles();
  }, [game, id]);

  // Determinar plataformas habilitadas y activas según saves
  useEffect(() => {
    if (!game || !game.platformsID || !saveFiles) return;

    const availablePlatformIDs = [...new Set(saveFiles.map(sf => sf.platformID))];
    setEnabledPlatforms(availablePlatformIDs);
    setActivePlatforms(availablePlatformIDs);
  }, [game, saveFiles]);

  // Filtrar saves según plataformas activas
  useEffect(() => {
    const filtered = saveFiles.filter(sf => activePlatforms.includes(sf.platformID));
    setFilteredSaveFiles(filtered);
  }, [activePlatforms, saveFiles]);

  const lastUpdate = saveFiles.length > 0 ? new Date(saveFiles[0].postedDate).toLocaleDateString() : "No updates";

  return (
    <div>
      <section className='nav-section'>
        <nav>
          <ol>
            <li><Link to={`/`}>Home</Link></li>
            <li>{game?.title || 'Juego sin título'}</li>
          </ol>
        </nav>
      </section>

      <div className='container'>
        <section className="game-section">
          <div className='table-data'>
            <div className="row">
              <div className="row-element text-center">
                {game && (
                  <img
                    src={`${config.connection}${game.cover}`}
                    alt={game.title}
                    onError={(e) => { e.target.src = `${config.connection}${config.paths.gameCover_default}`; }}
                  />
                )}
              </div>

              <div className='row-element text-muted'>
                <p><strong>Available saves:</strong> {saveFiles.length}</p>
                <p><strong>Last update: </strong>{lastUpdate}</p>
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        <section className="saves-section">
          <form>
            {game?.platformsID?.map(platformID => {
              const platformName = getPlatformName(platformID);
              const isEnabled = enabledPlatforms.includes(platformID);
              const isChecked = activePlatforms.includes(platformID);

              return (
                <div className="form-check form-switch" key={platformID}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`switch-${platformID}`}
                    checked={isChecked}
                    disabled={!isEnabled}
                    onChange={() => {
                      if (isChecked) {
                        setActivePlatforms(prev => prev.filter(id => id !== platformID));
                      } else {
                        setActivePlatforms(prev => [...prev, platformID]);
                      }
                    }}
                  />
                  <label className="form-check-label" htmlFor={`switch-${platformID}`}>
                    {platformName}
                  </label>
                </div>
              );
            })}
          </form>

          {filteredSaveFiles.length > 0 ? (
            filteredSaveFiles.map(saveFile => (
              <div key={saveFile._id} className="save">
                <Link to={`/save/${saveFile._id}`}><strong>{saveFile.title}</strong></Link>
                <p><small>Uploaded by: {saveFile.alias}</small> - Plataforma: {saveFile.platformName}</p>
              </div>
            ))
          ) : (
            <p>No hay archivos de guardado disponibles.</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default ShowGameDetails;
