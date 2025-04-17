import config from '../utils/config.js';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../utils/interceptor.js';
import '../styles/Common.scss';
import '../styles/ShowGameDetails.scss';
import { PLATFORMS, getPlatformName } from '../utils/constants.jsx'


function ShowGameDetails(props) {
  const [game, setGame] = useState({}); //objeto con el juego
  const [saveFiles, setSaveFiles] = useState([]); //array que almacena todos los savefiles del juego 
  //checkboxes: creamos una por plataforma del juego y deshabilitamos las que no tengan saves. Ademas, debemos saber 
  //cuales se estan usando para filtrar y cuales no
  const [activePlatforms, setActivePlatforms] = useState([]); // plataformas activas (por id)
  const [enabledPlatforms, setEnabledPlatforms] = useState([]); //plataformas disponibles (por id)
  const [filteredSaveFiles, setFilteredSaveFiles] = useState([]); //array que almacena los savefiles a mostrar (filtrados)

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    /*funcion que carga el juego, su caratula y sus datos del modelo de games */
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await api.get(`${config.api.games}/${id}`);
        setGame(gameResponse.data);
      } catch (err) {
        console.log('Error from ShowGameDetails');
      }
    };//fetchGameDetails

    fetchGameDetails();

  }, [id]); // Solo se ejecuta cuando cambia el `id`

  useEffect(() => {
    /* Solo obtener los archivos de guardado cuando `game` y `platformsID` estén disponibles */
    const fetchSaveFiles = async () => {
      if (!game || !game.platformsID) {
        return;
      }

      try {
        //obtenemos los archivos de guardado
        const saveFilesResponse = await api.get(`${config.api.savedatas}/game/${id}`);
        //les añadimos más datos que salen de la base de datos de usuarios
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
                }
              }
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID), //datos añadidos para tener un savedata con esteroides
                alias: userResponse.data.alias || userResponse.data.userName || "Desconocido",
                pfp: userResponse.data.pfp
              };

            } catch (err) {
              console.log(`Error fetching user for savefile ${sf._id}:`, err);
              return {
                ...sf,
                platformName: getPlatformName(sf.platformID),
                alias: "Desconocido",
                pfp: `${config.paths.pfp_default}`
              };
            }
          })
        );
        //ademas ordenamos por fecha de subida. to do cambiar a fecha de ultima actualizacion
        const sortedSaveFiles = [...updatedSaveFiles].sort(
          (a, b) => new Date(b.postedDate) - new Date(a.postedDate)
        );
        //inicializamos los dos arrays
        setSaveFiles(sortedSaveFiles);
        setFilteredSaveFiles(sortedSaveFiles);
      } catch (err) {
        console.log('Error fetching game items');
      }
    };//fetchSaveFiles

    fetchSaveFiles();

  }, [game, id]); // Dependencia en `game` para que se ejecute cuando `game` cambie

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

  //Nos guardamos ademas la ultima actualizacion de todos los saves
  const lastUpdate = saveFiles.length > 0 ? new Date(saveFiles[0].postedDate).toLocaleDateString() : "No updates";

  return (
    <div>
      {/* Seccion previa al encabezado con el enlace y titulo. La dejo fuera del div container de la pagina a proposito.*/}
      <section className='nav-section'>
        <nav>
          <ol>
            <li>
              <Link to={`/`}>Home</Link>
            </li>
            <li>
              {game &&
                game.title || 'Juego sin título'}
            </li>
          </ol>
        </nav>
      </section>


      <div className='container'>
        {/* ...................................GAME SECTION */}
        <section className="game-section">
          <div className='table-data'>
            <div className="row">
              {/* Columna izquierda: caratula del juego */}
              <div className="row-element text-center">
                {game && (
                  <img
                    src={`${config.connection}${game.cover}`} //guarda la ruta entera en bbdd
                    alt={game.title}
                    onError={(e) => { e.target.src = `${config.connection}${config.paths.gameCover_default}`; }}
                  />
                )}
              </div>

              {/* Columna derecha: información del juego */}
              <div className='row-element text-muted'>
                <p><strong>Available saves:</strong> {saveFiles.length}</p>
                <p><strong>Last update: </strong>{lastUpdate} </p>
                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        {/* ...................................SAVES SECTION */}
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



      </div >
    </div >





  );
}

export default ShowGameDetails;