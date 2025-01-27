import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.scss';
import '../styles/ShowGameDetails.scss';

//TODO: Hacer una llamada a IGDB para BUSCAR un juego que tenga el mismo valor que nuestro campo IGDBID.
function ShowGameDetails(props) {
  const [game, setGame] = useState({});
  const [saveFiles, setSaveFiles] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    /*funcion que carga el juego, su imagen y sus datos del modelo de games */
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await axios.get(`http://localhost:8082/api/games/${id}`);
        setGame(gameResponse.data);
      } catch (err) {
        console.log('Error from ShowGameDetails');
      }
    };//fetchGameDetails

    const fetchSaveFiles = async () => {
      /*lo mismo que arriba pero con los saves de cada juego */
      try {
        const saveFilesResponse = await axios.get(`http://localhost:8082/api/savedatas/game/${id}`);
        setSaveFiles(saveFilesResponse.data);
      } catch (err) {
        console.log('Error fetching game items');
      }
    };//fetchSaveFiles

    fetchGameDetails();
    fetchSaveFiles();

  }, [id]);//useEffect

  return (
    <div className='container'>

      {/* primera seccion - info del juego. Dos columnas, la imagen a la izq, la info a la derecha */}
      <section className="info-section">
        <div className="row">
          {/* Columna de la izquierda: Imagen */}
          <div className="col-md-4 text-center">
            <img
              src={game.imagePath}
              alt={game.name}
              className="img-fluid rounded"
            />
          </div>

          {/* Columna de la derecha: info del juego */}
          <div className="col-md-8">
            <h1>{game.name}</h1>
            <p className="text-muted">
              <strong>Descripción:</strong> {game.description || "Sin descripción disponible"}
            </p>
            <p className="text-muted">
              <strong>Género:</strong> {game.genre || "N/A"}
            </p>
            <p className="text-muted">
              <strong>Fecha de lanzamiento:</strong> {game.releaseDate || "N/A"}
            </p>
            <a href="#" className="btn btn-primary">Install Instructions</a>
          </div>
        </div>
      </section>

      {/* Segunda sección: Grid de archivos guardados */}
      <section className="grid-section">
        <h2>Available savedata</h2>
        <div className="row">
          {/* en lugar de usar un objeto table, creamos diferentes cards para cada elemento, para poder personalizar mas cada fila de la tabla. */}
          {/* hace primero una comprobacion del tamaño para saber si meter una tabla o un mensaje de error */}

          {saveFiles.length > 0 ? (
            saveFiles.map((saveFile, index) => (
              /*en esta funcion estamos transformando los valores del saveFile recogido arriba en un html. */
              /*la funcion map hace que se añada una de estas secciones, que serian las filas, por cada elemento de bbdd */
              <div key={saveFile._id} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">{saveFile.title}</h5>
                    <p className="card-text">
                      <strong>Descripción:</strong> {saveFile.description || "Sin descripción"}
                    </p>
                    <p className="card-text">
                      <strong>Fecha de subida:</strong> {new Date(saveFile.postedDate).toLocaleDateString()}
                    </p>
                    <Link to={`/save/${saveFile._id}`} className="btn btn-outline-primary">
                      Ver archivo
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
              //           /*en caso de no tener un lenght>0, enseñamos una tabla que solo muestra un string de error */
            <div className="col-12">
              <p className="text-muted text-center">No hay archivos de guardado disponibles para este juego.</p>
            </div>
          )}
        </div>
      </section>


    </div>


  );
}

export default ShowGameDetails;