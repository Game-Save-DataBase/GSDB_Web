import config from '../../utils/config';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import { LoadingContext } from '../../contexts/LoadingContext';
import '../../styles/Common.scss';
import '../../styles/main/ShowSaveDetails.scss';

function ShowSaveDetails() {
  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const [relatedPlatform, setRelatedPlatform] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [screenshots, setScreenshots] = useState([]);
  const [tags, setTags] = useState([]);

  const { id } = useParams();
  const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } = useContext(LoadingContext);

  useEffect(() => {
    const loadAll = async () => {
      try {
        resetLoad();
        block();

        // 1. Guardado principal
        const { data: save } = await api.get(`${config.api.savedatas}?id=${id}`);
        setSaveData(save);

        // 2. Juego relacionado
        if (save.gameID) {
          try {
            const { data: game } = await api.get(`${config.api.games}?gameID=${save.gameID}`);
            setRelatedGame(game);
          } catch {
            console.warn('No se pudo cargar el juego relacionado.');
          }
        }

        // 3. Plataforma relacionada
        if (save.platformID !== undefined && save.platformID !== null) {
          try {
            const { data: platform } = await api.get(`${config.api.platforms}?platformID=${save.platformID}`);
            setRelatedPlatform(platform);
          } catch {
            console.warn('No se pudo cargar la plataforma.');
          }
        }

        // 4. Usuario relacionado
        if (save.userID) {
          try {
            const { data: user } = await api.get(`${config.api.users}?userID=${save.userID}`);
            setRelatedUser(user);
          } catch {
            console.warn('No se pudo cargar el usuario.');
          }
        }

        // 5. Comentarios + usuarios de cada uno
        try {
          const { data: rawComments } = await api.get(`${config.api.comments}?saveID=${id}`);
          let commentsData = rawComments === "" ? [] : Array.isArray(rawComments) ? rawComments : [rawComments];

          const updatedComments = await Promise.all(
            commentsData.map(async (comment) => {
              try {
                const { data: user } = await api.get(`${config.api.users}?id=${comment.userID}`);
                return {
                  ...comment,
                  userName: user?.userName || 'Usuario desconocido',
                  alias: user?.alias || '',
                  pfp: user?.pfp || config.paths.pfp_default
                };
              } catch {
                return {
                  ...comment,
                  userName: 'Usuario desconocido',
                  alias: '',
                  pfp: config.paths.pfp_default
                };
              }
            })
          );

          setComments(updatedComments);
        } catch (err) {
          console.error('Error cargando comentarios:', err);
          setComments([]);
        }

        // 6. Tags (si existen)
        if (save.tags && save.tags.length > 0) {
          try {
            const { data: rawTags } = await api.get(`${config.api.tags}?tagID[in]=${save.tags.join(',')}`);
            setTags(Array.isArray(rawTags) ? rawTags : [rawTags]);
          } catch {
            console.warn('Error cargando tags');
          }
        }

        // 7. Screenshots (en futuro real, aquí harías el fetch a imágenes)
        setScreenshots([]); // Por ahora vacío

      } catch (err) {
        console.error('Error general al cargar el archivo de guardado:', err);
      } finally {
        markAsLoaded();
        unblock();
      }
    };

    loadAll();
  }, [id]);

  if (isInitialLoad) return <p style={{ textAlign: 'center' }}>loading...</p>;


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
              <Link to={`/catalog`}>Catalog</Link>
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
