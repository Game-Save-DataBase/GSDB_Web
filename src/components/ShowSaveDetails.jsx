import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.scss';
import '../styles/ShowSaveDetails.scss';

function ShowSaveDetails(props) {
  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [imagePaths, setImagePaths] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  // Función para obtener las imágenes desde el servidor
  const fetchImages = async (saveId) => {
    try {
      const response = await axios.get(`http://localhost:8082/api/savedatas/${id}/images`); setImagePaths(response.data);  // Aquí se actualizan las rutas de las imágenes
      setImagePaths(response.data.images);
      // console.log(response.data.images)
    } catch (err) {
      console.log('Error fetching images:', err);
    }
  };

  useEffect(() => {
    // Función para obtener los detalles del archivo de guardado
    const fetchSaveData = async () => {
      try {
        const saveResponse = await axios.get(`http://localhost:8082/api/savedatas/${id}`);
        setSaveData(saveResponse.data);
        fetchImages(id)
      } catch (err) {
        console.log('Error fetching save data:', err);
      }
    };

    fetchSaveData();
  }, [id]);

  useEffect(() => {
    // Obtener comentarios y añadir usernames
    const fetchComments = async () => {
      try {
        const commentsResponse = await axios.get(`http://localhost:8082/api/comments/entry/${id}`);
        const commentsData = commentsResponse.data;

        // Obtener los usernames para cada comentario
        const updatedComments = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userResponse = await axios.get(`http://localhost:8082/api/users/${comment.userID}`);
              return { ...comment, userName: userResponse.data.userName, alias: userResponse.data.alias, pfp: userResponse.data.pfp };
            } catch (err) {
              console.log(`Error fetching user for comment ${comment._id}:`, err);
              return { ...comment, userName: 'Usuario desconocido' };
            }
          })
        );

        setComments(updatedComments);
      } catch (err) {
        console.log('Error fetching comments:', err);
      }
    };

    fetchComments();
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

  useEffect(() => {
    // Solo ejecutar si userID está disponible
    if (saveData.userID) {
      const fetchUserData = async () => {
        try {
          const userResponse = await axios.get(`http://localhost:8082/api/users/${saveData.userID}`);
          setRelatedUser(userResponse.data);
        } catch (err) {
          console.log('Error fetching user:', err);
        }
      };

      fetchUserData();
    }
  }, [saveData.userID]); // Este useEffect se activa cuando saveData.gameID cambia



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
                    src={relatedGame.imagePath}
                    alt={relatedGame.name}
                  />
                )}
              </div>

              {/* Columna derecha: información del archivo */}
              <div className='row-element text-muted'>
                <p>
                  <strong>Platform:</strong>{' '}
                  {relatedGame && relatedGame.platformsID && saveData.platformID !== undefined
                    ? relatedGame.platformsID[saveData.platformID] || 'Plataforma desconocida'
                    : 'Plataforma desconocida'}
                </p>
                <p>
                  <strong>File size:</strong> {saveData.filseSize || 'Tamaño sin determinar'}
                </p>
                <p>
                  <strong>Submitted By:</strong> {' '}
                  {relatedUser
                    ? relatedUser.alias || relatedUser.name || 'Desconocido'
                    : 'Desconocido'}
                </p>
                <p>
                  <strong>Date added:</strong> {saveData.postedDate || 'N/A'}
                </p>
                <p>
                  <strong>Downloads:</strong> {saveData.nDownloads || 0}
                </p>
                {/* <br></br> */}
                <p>
                  <strong>Descripción:</strong> {saveData.description || 'Sin descripción disponible'}
                </p>
              </div>
            </div>

            <div className='row'>
              <div className='row-element text-center'>
                <button type="button" className="gsdb-btn-default">Download</button>
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
                <button className="active" data-bs-toggle="tab" data-bs-target="#comments">Comments</button>
              </li>
              <li role="presentation">
                <button className={`${imagePaths.length <= 0 ? 'disabled' : ''}`} data-bs-toggle="tab" data-bs-target="#screenshots">Screenshots</button>
              </li>
            </ul>
          </div>

          {/* contenido de las tabs */}
          {/* COMENTARIOS */}
          <div className="tabs-content" >
            <div className="gsdbtab show active" id="comments">

              {comments && comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <p>
                      <small>{comment.postedDate}</small>
                    </p>
                    <img
                      src={comment.pfp}
                      alt={comment.alias || comment.userName}
                    />
                    <p>
                      <strong>{comment.alias || comment.userName}</strong>: {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted">No hay comentarios para este archivo.</p>
              )}
            </div>

            {/* SCREENSHOTS */}
            <div className="gsdbtab" id="screenshots">
              {imagePaths.length > 0 ? (
                imagePaths.map((imagePath, index) => (
                  <img key={index}
                    // src={`http://localhost:8082${imagePath}`} 
                    src={`/src/${imagePath}`} //DEBERIA COGER ESTO DE BASE DE DATOS, PERO AUN NO SE HACERLO BIEN. HASTA QUE SE ARREGLE LO COGEMOS DE LA WEB PARA EVITAR ERRORES EN CONSOLA
                    alt={`Screenshot ${index + 1}`} className="screenshot" />

                ))
              ) : (
                <p>No hay imágenes disponibles para este guardado.</p>
              )}

            </div>


          </div>
        </section>

      </div>
      {/* TO DO: AÑADIR MODAL PARA LAS SCREENSHOTS */}
    </div>
  );
}

export default ShowSaveDetails;
