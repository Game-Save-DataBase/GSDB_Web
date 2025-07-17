import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';

import '../../styles/Common.scss';
import '../../styles/main/ShowGameDetails.scss';

import FavoriteButton from '../utils/FavoriteButton';
import { LoadingContext } from '../../contexts/LoadingContext';

function ShowGameDetails() {
  const navigate = useNavigate();
  const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } = useContext(LoadingContext);
  const [game, setGame] = useState(null);
  const [saveFiles, setSaveFiles] = useState([]);
  const [gamePlatforms, setGamePlatforms] = useState([]);
  const { slug } = useParams();
  useEffect(() => {
    const loadAll = async () => {
      try {
        resetLoad();
        block();

        // Redirección si el slug tiene mayúsculas
        if (slug.toLowerCase() !== slug) {
          navigate(`/g/${slug.toLowerCase()}`, { replace: true });
          return;
        }

        // 1. Cargar el juego
        const { data: gameData } = await api.get(`${config.api.games}?slug=${slug}`);
        if (!gameData) throw new Error('Juego no encontrado');
        setGame(gameData);

        // 2. Cargar plataformas si existen
        let platforms = [];
        if (gameData.platformID?.length) {
          const { data: platformsData } = await api.get(`${config.api.platforms}?platformID[in]=${gameData.platformID.join(',')}`);
          platforms = Array.isArray(platformsData) ? platformsData : [platformsData];
          setGamePlatforms(platforms);
        }

        // 3. Cargar saves
        let { data: saves } = await api.get(`${config.api.savedatas}?saveID[in]=${gameData.saveID.join(',')}`);
        if (!saves) saves = [];
        saves = Array.isArray(saves) ? saves : [saves];

        const updated = await Promise.all(
          saves.map(async sf => {
            try {
              const { data: user } = await api.get(`${config.api.users}?userID=${sf.userID}`);
              return {
                ...sf,
                platformName: platforms.find(p => p.platformID === sf.platformID)?.name || `Unknown`,
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

      } catch (error) {
        console.error("Error durante la carga de la página:", error);
      } finally {
        markAsLoaded();
        unblock();
      }
    };

    loadAll();
  }, [slug]);



  if (isInitialLoad) return <p style={{ textAlign: 'center' }}>loading...</p>;

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
