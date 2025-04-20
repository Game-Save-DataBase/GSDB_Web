import config from '../utils/config.js';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/interceptor.js';
import '../styles/Common.scss';
import '../styles/ShowGameDetails.scss';
import { PLATFORMS, getPlatformName } from '../utils/constants.jsx';
import { LoadingContext } from '../contexts/LoadContext.jsx';

function ShowGameDetails() {
  const [game, setGame] = useState({});
  const [saveFiles, setSaveFiles] = useState([]);
  const [activePlatforms, setActivePlatforms] = useState([]);
  const [enabledPlatforms, setEnabledPlatforms] = useState([]);
  const [filteredSaveFiles, setFilteredSaveFiles] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading, markPageLoaded, isPageLoaded } = useContext(LoadingContext);

  useEffect(() => {
    startLoading();
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await api.get(`${config.api.games}/${id}`);
        setGame(gameResponse.data);
      } catch (err) {
        console.log('Error from ShowGameDetails');
      }
    };
    fetchGameDetails();
  }, [id]);

  useEffect(() => {
    const fetchSaveFiles = async () => {
      if (!game || !game.platformsID) return;
      startLoading();
      try {
        const saveFilesResponse = await api.get(`${config.api.savedatas}/game/${id}`);
        const updatedSaveFiles = await Promise.all(
          saveFilesResponse.data.map(async (sf) => {
            try {
              const userResponse = await api.get(`${config.api.users}/${sf.userID}`);
              if (!userResponse.data) {
                return {
                  ...sf,
                  platformName: getPlatformName(sf.platformID),
                  alias: "Desconocido",
                  pfp: `${config.paths.pfp_default}`
                };
              }
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: userResponse.data.alias || userResponse.data.userName || "Desconocido",
                pfp: userResponse.data.pfp
              };
            } catch (err) {
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: "Desconocido",
                pfp: `${config.paths.pfp_default}`
              };
            }
          })
        );

        const sortedSaveFiles = [...updatedSaveFiles].sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );

        setSaveFiles(sortedSaveFiles);
        setFilteredSaveFiles(sortedSaveFiles);
      } catch (err) {
        console.log('Error fetching save files');
      } finally {
        stopLoading();
        markPageLoaded("ShowGameDetails");
      }
    };
    fetchSaveFiles();
  }, [game, id]);

  useEffect(() => {
    if (!game || !game.platformsID || !saveFiles) return;
    const availablePlatformIDs = [...new Set(saveFiles.map(sf => sf.platformID))];
    setEnabledPlatforms(availablePlatformIDs);
    setActivePlatforms(availablePlatformIDs);
  }, [game, saveFiles]);

  useEffect(() => {
    const filtered = saveFiles.filter(sf => activePlatforms.includes(sf.platformID));
    setFilteredSaveFiles(filtered);
  }, [activePlatforms, saveFiles]);

  const lastUpdate = saveFiles.length > 0 ? new Date(saveFiles[0].postedDate).toLocaleDateString() : "No updates";

  if (!isPageLoaded("ShowGameDetails")) {
    return null;
  }

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

        {/* GAME SECTION */}
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
                <p><strong>Last update:</strong> {lastUpdate}</p>
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        {/* SAVES SECTION */}
        <section className="saves-section">
          <form>
            {game.platformsID && game.platformsID.map((platformID) => {
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
            filteredSaveFiles.map((saveFile) => (
              <div key={saveFile._id} className="save">
                <Link to={`/save/${saveFile._id}`}><strong>{saveFile.title}</strong></Link>
                <p>
                  <small>Uploaded by: {saveFile.alias}</small> - Plataforma: {saveFile.platformName}
                </p>
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
