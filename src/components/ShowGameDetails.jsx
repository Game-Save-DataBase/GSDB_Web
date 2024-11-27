import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.css';


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
    <div>
      {/* titulo */}
      <h1>{game.name}</h1>
      <img src={"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Celeste_box_art_full.png/220px-Celeste_box_art_full.png"}
        alt={game.title}/>
      
      {/* tabla con los saves */}
      <br></br>
      <br></br>
      
      <h2>Available savedata</h2>
      {/* hacerle una clase en el .css */}
      <table>
        {/* thead es la primera fila, osea, los nombres de cada columna.
        aqui añadimos mas columnas si se desea */}
        <thead>
          <tr>
            <th>#</th>
            <th>Descripción</th>
            <th>Fecha de subida</th>
          </tr>
        </thead>
        {/* tbody es lo que rellena la tabla */}
        <tbody>
          {/* hace primero una comprobacion del tamaño para saber si meter una tabla o un mensaje de error */}
          {saveFiles.length > 0 ? (
            saveFiles.map((saveFile, index) => (
              /*en esta funcion estamos transformando los valores del saveFile recogido arriba en un html. Hay una linea por cada columna de la tabla definida en thead */
              /*la funcion map hace que se añada una de estas tr por cada elemento */
              <tr key={saveFile._id}>
                <td><Link to={`/save/${saveFile._id}`}>{index + 1}</Link></td>
                <td>{saveFile.description}</td>
                <td>{new Date(saveFile.postedDate).toLocaleDateString()}</td>
              </tr>
            ))
          ) : (
            /*en caso de no tener un lenght>0, enseñamos una tabla que solo muestra un string de error */
            <tr>
              <td>No hay archivos de guardado disponibles para este juego.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

  );
}

export default ShowGameDetails;