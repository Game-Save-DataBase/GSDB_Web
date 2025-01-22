import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.css';
import '../styles/ShowSaveDetails.css';

function ShowSaveDetails(props) {
  //comentado por ahora por si peta, ya que esta pagina no hace na
  //   const [saveFile, setSaveFiles] = useState([]);

  //   const { id } = useParams();
  //   const navigate = useNavigate();

  //   useEffect(() => {
  //     const fetchSaveFile = async () => {
  //       /*lo mismo que arriba pero con los saves de cada juego */
  //       try {
  //         const saveFileResponse = await axios.get(`http://localhost:8082/api/savedatas/${id}`);
  //         setSaveFiles(saveFileResponse.data);
  //       } catch (err) {
  //         console.log('Error fetching savedata');
  //       }
  //     };//fetchSaveFile

  //     fetchSaveFile();

  //   }, [id]);//useEffect

  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Función para obtener los detalles del archivo de guardado
    const fetchSaveData = async () => {
      try {
        const saveResponse = await axios.get(`http://localhost:8082/api/savedatas/${id}`);
        setSaveData(saveResponse.data);
      } catch (err) {
        console.log('Error fetching save data:', err);
      }
    };

    fetchSaveData();
  }, [id]);

  useEffect(() => {
    // Solo ejecutar si gameID está disponible
    if (saveData.gameID) {
      const fetchGameData = async () => {
        try {
          const gameResponse = await axios.get(`http://localhost:8082/api/games/${saveData.gameID}`);
          setRelatedGame(gameResponse.data);
        } catch (err) {
          console.log('Error fetching game data:', err);
        }
      };

      fetchGameData();
    }
  }, [saveData.gameID]); // Este useEffect se activa cuando saveData.gameID cambia



  return (
    <div className="container">

      {/* Seccion previa al encabezado con el enlace y titulo */}

      <section className='title-section'>
        {/* Enlace para volver al juego */}
        <div className="link-to-game">
          {relatedGame && (
            <Link to={`/game/${saveData.gameID}`}>{`Back to ${relatedGame.name}`}</Link>
          )}
        </div>

        {/* Titulo del save */}
        <h1>{saveData.title || 'Archivo de Guardado'}</h1>
      </section>

      {/* Encabezado con detalles del archivo guardado */}
      <section className="info-section">
        <div className="row">
          {/* Columna izquierda: imagen del juego y boton de descarga */}
          <div className="col-md-4 text-center">
            {relatedGame && (
              <img
                src={relatedGame.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Celeste_box_art_full.png/220px-Celeste_box_art_full.png'}
                alt={relatedGame.name}
                className="img-fluid rounded"
              />
            )}

            <a href={saveData.downloadLink || '#'} className="btn btn-primary" download>
              Download
            </a>
          </div>

          {/* Columna derecha: información del archivo */}
          <div className="col-md-8">
          <p className="text-muted">
              <strong>Platform:</strong> {saveData.platform || 'Plataforma desconocida'}
            </p>
            <p className="text-muted">
              <strong>File size:</strong> {saveData.filseSize || 'Tamaño sin determinar'}
            </p>
            <p className="text-muted">
              <strong>Submitted By:</strong> {saveData.submittedBy || 'Desconocido'}
            </p>
            <p className="text-muted">
              <strong>Date added:</strong> {new Date(saveData.postedDate).toLocaleDateString() || 'N/A'}
            </p>
            <p className="text-muted">
              <strong>Downloads:</strong> {saveData.downloads || 'Numero de descargas desconocido'}
            </p>
            <br></br>
            <p className="text-muted">
              <strong>Descripción:</strong> {saveData.description || 'Sin descripción disponible'}
            </p>
            
          </div>
        </div>
      </section>

      {/* Comentarios o detalles adicionales */}
      <section className="comments-section">
        <h2>Comentarios</h2>
        {saveData.comments && saveData.comments.length > 0 ? (
          saveData.comments.map((comment, index) => (
            <div key={index} className="comment">
              <p><strong>{comment.user}</strong>: {comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-muted">No hay comentarios disponibles para este archivo.</p>
        )}
      </section>
    </div>
  );
}

export default ShowSaveDetails;
