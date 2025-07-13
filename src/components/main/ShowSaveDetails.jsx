import config from '../../utils/config';
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import '../../styles/Common.scss';
import '../../styles/main/ShowSaveDetails.scss';

function ShowSaveDetails(props) {
  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const [relatedPlatform, setRelatedPlatform] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [screenshots, setscreenshots] = useState([]);
  const { id } = useParams();
  const [tags, setTags] = useState([]);


  //SAVE
  useEffect(() => {
    // Función para obtener los detalles del archivo de guardado
    const fetchSaveData = async () => {
      try {
        const saveResponse = await api.get(`${config.api.savedatas}?id=${id}`);
        setSaveData(saveResponse.data);
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
        const commentsResponse = await api.get(`${config.api.comments}?saveID=${id}`);
        let commentsData = commentsResponse.data;
        if (commentsData === "") {
          setComments(null)
          return
        }
        commentsData = Array.isArray(commentsData) ? commentsData : [commentsData];

        // Obtener los usernames para cada comentario
        const updatedComments = await Promise.all(
          commentsData.map(async (comment) => {
            try {
              const userResponse = await api.get(`${config.api.users}?id=${comment.userID}`);
              if (!userResponse.data) {
                return {
                  ...comment,
                  userName: 'Usuario desconocido',
                  pfp: `${config.paths.pfp_default}`
                };
              }
              return {
                ...comment,
                userName: userResponse.data.userName,
                alias: userResponse.data.alias,
                pfp: userResponse.data.pfp
              };
            } catch (err) {
              console.log(`Error fetching user for comment ${comment._id}:`, err);
              return {
                ...comment,
                userName: 'Usuario desconocido',
                pfp: `${config.paths.pfp_default}`
              };
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
          const gameResponse = await api.get(`${config.api.games}?gameID=${saveData.gameID}`);
          setRelatedGame(gameResponse.data);
        } catch (err) {
          console.log('Error fetching game data:', err);
        }
      };

      fetchGameData();
    }
  }, [saveData.gameID]); // Este useEffect se activa cuando saveData.gameID cambia

  useEffect(() => {
    if (saveData.platformID !== undefined && saveData.platformID !== null) {
      const fetchPlatformData = async () => {
        try {
          const response = await api.get(`${config.api.platforms}?platformID=${saveData.platformID}`);
          setRelatedPlatform(response.data);
        } catch (err) {
          console.error('Error fetching platform data:', err);
        }
      };

      fetchPlatformData();
    }
  }, [saveData.platformID]);


  useEffect(() => {
    // Solo ejecutar si userID está disponible
    if (saveData.userID) {
      const fetchUserData = async () => {
        try {
          const userResponse = await api.get(`${config.api.users}?userID=${saveData.userID}`);
          setRelatedUser(userResponse.data);
        } catch (err) {
          console.log('Error fetching user:', err);
        }
      };

      fetchUserData();
    }
  }, [saveData.userID]); // Este useEffect se activa cuando saveData.gameID cambia



  // TAGS
  useEffect(() => {
    if (saveData.tags && saveData.tags.length > 0) {
      const fetchTags = async () => {
        try {
          const response = await api.get(`${config.api.tags}?tagID[in]=${saveData.tags.join(',')}`);
          const fetched = Array.isArray(response.data) ? response.data : [response.data];
          setTags(fetched);
        } catch (err) {
          console.log('Error fetching tags:', err);
        }
      };

      fetchTags();
    }
  }, [saveData.tags]);

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
                <Link to={`/g/${relatedGame.slug}`}>
                  {`${relatedGame.title}` || 'Juego'}
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
              {/* Columna izquierda: screenshotn del juego y boton de descarga */}
              <div className="row-element text-center">
                {relatedGame && (
                  <img
                    src={`${relatedGame.cover}`}
                    alt={relatedGame.title}
                    onError={(e) => { e.target.src = `${config.connection}${config.paths.gameCover_default}`; }}
                  />
                )}
              </div>

              {/* Columna derecha: información del archivo */}
              <div className='row-element text-muted'>
                <p>
                  <strong>Platform:</strong>{' '}
                  {relatedPlatform ? relatedPlatform.name || 'Plataforma desconocida' : 'Plataforma desconocida'}
                </p>

                <p>
                  <strong>File size:</strong> {saveData.filseSize || 'Tamaño sin determinar'}
                </p>
                <p>
                  <strong>Submitted By:</strong> {' '}
                  {relatedUser ? (
                    <Link to={`/u/${relatedUser.userName}`}>
                      {`@${relatedUser.userName}` || 'Desconocido'}
                    </Link>
                  ) : (
                    'Desconocido'
                  )}
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
                {tags.length > 0 && (
                  <div className="tags-container">
                    {tags.map(tag => (
                      <span key={tag._id} className="tag-badge" data-tooltip={tag.description}>{tag.name}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='row'>
              <div className='row-element text-center'>
                <button type="button" className="gsdb-btn-default"
                  onClick={() => {
                    window.location.href = `${config.api.assets}/savedata/${id}`;
                  }}>
                  Download</button>
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
                <button className={`${screenshots.length <= 0 ? 'disabled' : ''}`} data-bs-toggle="tab" data-bs-target="#screenshots">Screenshots</button>
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
                      src={`${config.connection}${comment.pfp}`}
                      alt={comment.alias || comment.userName}
                      onError={(e) => { e.target.src = `${config.connection}${config.paths.pfp_default}`; }}
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
              {screenshots.length > 0 ? (
                screenshots.map((screenshot, index) => (
                  <img key={index}
                    src={`${config.connection}${screenshot}`}
                    //src={`/src/${screenshot}`} //DEBERIA COGER ESTO DE BASE DE DATOS, PERO AUN NO SE HACERLO BIEN. HASTA QUE SE ARREGLE LO COGEMOS DE LA WEB PARA EVITAR ERRORES EN CONSOLA
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
