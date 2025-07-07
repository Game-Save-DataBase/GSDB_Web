import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';

import '../../styles/Common.scss';
import '../../styles/main/ShowGameDetails.scss';

import FavoriteButton from '../utils/FavoriteButton';

function ShowGameDetails() {
  const [game, setGame] = useState(null);
  const [saveFiles, setSaveFiles] = useState([]);
  const [gamePlatforms, setGamePlatforms] = useState([]);
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

  useEffect(() => {
    const fetchPlatforms = async () => {
      if (!game?.platformsID?.length) return;

      try {
        const { data } = await api.post(`${config.api.platforms}/by-id`, {
          ids: game.platformsID
        });

        const platforms = Array.isArray(data) ? data : [data];
        setGamePlatforms(platforms);
      } catch (err) {
        console.error("Error fetching platforms by IDs:", err);
      }
    };

    fetchPlatforms();
  }, [game]);

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
                platformName: gamePlatforms.find(p => p.IGDB_ID === sf.platformID)?.name || `Unknown`,
                alias: user?.alias || user?.userName || "Desconocido",
                pfp: user?.pfp || config.paths.pfp_default,
              };
            } catch {
              return {
                ...sf,
                platformName: "",
                alias: "Desconocido",
                pfp: config.paths.pfp_default,
              };
            }
          })
        );

        const sorted = updated.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        setSaveFiles(sorted);
      } catch (err) {
        console.error('Error loading save files:', err);
      }
    };
    fetchSaveFiles();
  }, [gamePlatforms]);


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
                    src={`${game.cover}`}
                    alt={game.title}
                    onError={(e) => { e.target.src = `${config.connection}${config.paths.gameCover_default}`; }}
                  />
                )}
              </div>
              <div className='row-element text-muted'>
                {game && <FavoriteButton gameID={game._id} />}
                <p><strong>Available saves:</strong> {saveFiles.length}</p>
                <p><strong>Last update:</strong> {lastUpdate}</p>
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        <section className="saves-section">
        
          {saveFiles.length > 0 ? (
            saveFiles.map(save => (
              <div key={save._id} className="save">
                <Link to={`/save/${save._id}`}><strong>{save.title}</strong></Link>
                <p>
                  <small>Uploaded by: {save.alias} - Platform: {save.platformName} </small>
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
