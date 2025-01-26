import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.scss';
import '../styles/ShowSaveDetails.scss';

function ShowSaveDetails(props) {
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
    <div>
      {/* Seccion previa al encabezado con el enlace y titulo. La dejo fuera del div container de la pagina a proposito.*/}
      <section className='nav-section'>
        <nav>
          <ol>
            <li>
              <Link to={`/`}>Home</Link>
            </li>
            <li>
              {relatedGame && (
                <Link to={`/game/${saveData.gameID}`}>
                  {`${relatedGame.name}` || 'Juego'}
                </Link>
              )}
            </li>
            <li>
              {saveData &&
                saveData.title || 'Archivo de Guardado'}
            </li>
          </ol>
        </nav>
      </section>


      {/* .................AQUI EMPIEZA LA PAGINA */}
      <div className="container">
        {/* ...................................DATA SECTION */}
        <section className="data-section">
          <div className='table-data'>
            <div className="row">
              {/* Columna izquierda: imagen del juego y boton de descarga */}
              <div className="row-element text-center">
                {relatedGame && (
                  <img
                    src={relatedGame.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Celeste_box_art_full.png/220px-Celeste_box_art_full.png'}
                    alt={relatedGame.name}
                  />
                )}
              </div>

              {/* Columna derecha: información del archivo */}
              <div className='row-element text-muted'>
                <p>
                  <strong>Platform:</strong> {saveData.platform || 'Plataforma desconocida'}
                </p>
                <p>
                  <strong>File size:</strong> {saveData.filseSize || 'Tamaño sin determinar'}
                </p>
                <p>
                  <strong>Submitted By:</strong> {saveData.submittedBy || 'Desconocido'}
                </p>
                <p>
                  <strong>Date added:</strong> {new Date(saveData.postedDate).toLocaleDateString() || 'N/A'}
                </p>
                <p>
                  <strong>Downloads:</strong> {saveData.downloads || 'Numero de descargas desconocido'}
                </p>
                {/* <br></br> */}
                <p>
                  <strong>Descripción:</strong> {saveData.description || 'Sin descripción disponible'}
                </p>
              </div>
            </div>

            <div className='row'>
              <div className='row-element text-center'>
                <button type="button" class="gsdb-btn-default">Download</button>
              </div>
            </div>
          </div>
        </section>

        {/* ...................................INFO SECTION */}
        <section className="info-section">

          {/* pestañas de las tabs */}
          <div className='tabs-container'>
            <ul role="tablist">
              <li role="presentation">
                <button class="active" data-bs-toggle="tab" data-bs-target="#comments">Comments</button>
              </li>
              <li role="presentation">
                <button data-bs-toggle="tab" data-bs-target="#screenshots">Screenshots</button>
              </li>
            </ul>
          </div>

          {/* contenido de las tabs */}
          {/* COMENTARIOS */}
          <div class="tabs-content" >
            <div class="gsdbtab show active" id="comments">

              {saveData.comments && saveData.comments.length > 0 ? (
                saveData.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <p><strong>{comment.user}</strong>: {comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay comentarios disponibles para este archivo.</p>
              )}

            </div>

            {/* SCREENSHOTS */}
            <div class="gsdbtab" id="screenshots">
              aqui los screenshots pls</div>
          </div>
        </section>

      </div>

    </div>
  );
}

export default ShowSaveDetails;
