import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.scss';
import '../styles/ShowGameDetails.scss';

function ShowGameDetails(props) {
  const [game, setGame] = useState({});
  const [saveFiles, setSaveFiles] = useState([]);
  const [checkboxesEnabled, setcheckboxesEnabled] = useState({});  // Estado de los checkboxes

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    /*funcion que carga el juego, su imagen y sus datos del modelo de games */
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await axios.get(`http://localhost:8082/api/games/${id}`);
        setGame(gameResponse.data);
        setGameLoaded(true); // Marcar que el juego se ha cargado correctamente
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
        const saveFilesResponse = await axios.get(`http://localhost:8082/api/savedatas/game/${id}`);

        const updatedSaveFiles = await Promise.all(
          saveFilesResponse.data.map(async (sf) => {
            try {
              const userResponse = await axios.get(`http://localhost:8082/api/users/${sf.userID}`);
              return {
                ...sf,
                platformName: game.platformsID[sf.platformID], //datos añadidos para tener un savedata con esteroides
                userName: userResponse.data.handleName || userResponse.data.name || "Desconocido",
                userAvatar: userResponse.data.avatar
              };
            } catch (err) {
              console.log(`Error fetching user for savefile ${sf._id}:`, err);
              return { ...sf, userName: 'Usuario desconocido' };
            }
          })
        );
        setSaveFiles(updatedSaveFiles);
      } catch (err) {
        console.log('Error fetching game items');
      }
    };//fetchSaveFiles

    fetchSaveFiles();

  }, [game, id]); // Dependencia en `game` para que se ejecute cuando `game` cambie


  useEffect(() => {
    if (!game || !game.platformsID || !saveFiles) {
      return;
    }
    // Obtener plataformas únicas de los archivos de guardado    
    //las checkboxes se inicializan a n plataformas segun el juego y todas a false
    const availablePlatforms = [...new Set(saveFiles.map(sf => sf.platformID))]
    const newcheckboxesEnabled = {};
    for (let i = 0; i < game.platformsID.length; i++) {
      newcheckboxesEnabled[i] = availablePlatforms.includes(i);
    }

    setcheckboxesEnabled(newcheckboxesEnabled);
  }, [game, saveFiles]);  // Se ejecuta cada vez que `saveFiles` o "game" cambie


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
                game.name || 'Juego sin título'}
            </li>
          </ol>
        </nav>
      </section>


      <div className='container'>
        {/* ...................................GAME SECTION */}
        <section className="game-section">
          <div className='table-data'>
            <div className="row">
              {/* Columna izquierda: imagen del juego */}
              <div className="row-element text-center">
                {game && (
                  <img
                    src={game.imagePath}
                    alt={game.name}
                  />
                )}
              </div>

              {/* Columna derecha: información del juego */}
              <div className='row-element text-muted'>

                <button type="button" className="gsdb-btn-default">Install instructions</button>
              </div>
            </div>
          </div>
        </section>

        {/* ...................................SAVES SECTION */}
        <section className="saves-section">
          {game && game.platformsID && game.platformsID.map((platform, index) => {
            const isDisabled = !checkboxesEnabled[index]; // Si no está habilitado en `checkboxesEnabled`, deshabilitar
            return (
              < div key={platform} className="form-check" >
                <input
                  className="form-check-input"
                  type="checkbox"
                  value={platform}
                  id={`flexCheck${platform}`}
                  disabled={isDisabled}
                  checked={!isDisabled}
                />
                <label className="form-check-label" htmlFor={`flexCheck${platform}`}>
                  {platform}
                </label>
              </div>
            );
          })}

          {saveFiles.length > 0 ? (
            saveFiles.map((saveFile) => (
              <div key={saveFile._id} className="save">
                <Link to={`/save/${saveFile._id}`}><strong>{saveFile.title}</strong></Link>
                <p>
                  <small>Uploaded by: {saveFile.userName}</small> - Plataforma: {saveFile.platformName}
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