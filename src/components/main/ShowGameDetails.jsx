import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';
import { getPlatformName } from '../../utils/constants.jsx';

import FilterBar from '../filters/FilterBar.jsx';
import FilterPlatform from '../filters/FilterPlatform.jsx';

import '../../styles/Common.scss';
import '../../styles/main/ShowGameDetails.scss';

function ShowGameDetails() {
  const [game, setGame] = useState(null);
  const [saveFiles, setSaveFiles] = useState([]);
  const [filteredSaveFiles, setFilteredSaveFiles] = useState([]);
  const [disabledPlatforms, setDisabledPlatforms] = useState([]);
  const { id } = useParams();

  // Cargar juego
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data } = await api.get(`${config.api.games}?_id=${id}`);
        setGame(data || null);
      } catch (err) {
        console.error('Error loading game:', err);
      }
    };
    fetchGameDetails();
  }, [id]);

  // Cargar saves
  useEffect(() => {
    const fetchSaveFiles = async () => {
      if (!game) return;

      try {
        let { data } = await api.get(`${config.api.savedatas}?gameID=${id}`);
        if (!data) return;

        data = Array.isArray(data) ? data : [data];

        const updated = await Promise.all(
          data.map(async sf => {
            try {
              const { data: user } = await api.get(`${config.api.users}?_id=${sf.userID}`);
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: user?.alias || user?.userName || "Desconocido",
                pfp: user?.pfp || config.paths.pfp_default,
              };
            } catch {
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: "Desconocido",
                pfp: config.paths.pfp_default,
              };
            }
          })
        );

        const sorted = updated.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        setSaveFiles(sorted);
        setFilteredSaveFiles(sorted);
      } catch (err) {
        console.error('Error loading save files:', err);
      }
    };
    fetchSaveFiles();
  }, [game, id]);
  useEffect(() => {
    if (!game) {
      setDisabledPlatforms([]);
      return;
    }

    const disabled = (game.platformsID || []).filter(
      p => !saveFiles.some(sf => sf.platformID === p)
    );

    setDisabledPlatforms(disabled);
  }, [saveFiles, game]);

  const filters = useMemo(() => [
    {
      type: FilterPlatform,
      props: {
        platforms: game?.platformsID || [],
        disabled: disabledPlatforms,
      }
    }
  ], [game?.platformsID, disabledPlatforms]);

  const handleFilteredChange = useCallback(filtered => {
    setFilteredSaveFiles(filtered);
  }, []);
  const lastUpdate = saveFiles.length > 0
    ? new Date(saveFiles[0].postedDate).toLocaleDateString()
    : "No updates";

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
                <p><strong>Last update:</strong> {lastUpdate}</p>
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        <section className="saves-section">
          <FilterBar
            data={saveFiles}
            filters={filters}
            onFilteredChange={setFilteredSaveFiles}
          />

          {filteredSaveFiles.length > 0 ? (
            filteredSaveFiles.map(save => (
              <div key={save._id} className="save">
                <Link to={`/save/${save._id}`}><strong>{save.title}</strong></Link>
                <p>
                  <small>Uploaded by: {save.alias}</small> - Plataforma: {save.platformName}
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
