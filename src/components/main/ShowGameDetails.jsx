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
  const { slug } = useParams();


  // Cargar juego
  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const { data } = await api.get(`${config.api.games}?slug=${slug}`);
        setGame(data || null);
      } catch (err) {
        console.error('Error loading game:', err);
      }
    };
    fetchGameDetails();
  }, [slug]);

  useEffect(() => {
    const fetchPlatforms = async () => {
      if (!game?.platformID?.length) return;

      try {
        const { data } = await api.get(`${config.api.platforms}?platformID[in]=${game.platformID.join(',')}`)

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
        let { data } = await api.get(`${config.api.savedatas}?saveID[in]=${game.saveID.join(',')}`);
        if (!data) return;
        data = Array.isArray(data) ? data : [data];
        console.log(data)

        const updated = await Promise.all(
          data.map(async sf => {
            try {
              const { data: user } = await api.get(`${config.api.users}?userID=${sf.userID}`);
              return {
                ...sf,
                platformName: gamePlatforms.find(p => p.platformID === sf.platformID)?.name || `Unknown`,
                alias: user?.alias || user?.userName || "Unknown"
              };
            } catch {
              return {
                ...sf,
                platformName: "Unknown",
                alias: "Unknown"
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
                    onError={(e) => { e.target.src = `${config.api.assets}/default/game-cover`; }}
                  />
                )}
              </div>
              <div className='row-element text-muted'>
                {game && <FavoriteButton gameID={game.gameID} />}
                <p><strong>Available saves:</strong> {saveFiles.length}</p>
                {/* <p><strong>Last update:</strong> {lastUpdate}</p> */}
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        <section className="saves-section">
        
          {saveFiles.length > 0 ? (
            saveFiles.map(save => (
              <div key={save.saveID} className="save">
                <Link to={`/s/${save.saveID}`}><strong>{save.title}</strong></Link>
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
