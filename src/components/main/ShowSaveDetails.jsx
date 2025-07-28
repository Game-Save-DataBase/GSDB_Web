import config from '../../utils/config';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate,  useLocation} from 'react-router-dom';
import api from '../../utils/interceptor';
import { LoadingContext } from '../../contexts/LoadingContext';
import '../../styles/Common.scss';
import '../../styles/main/ShowSaveDetails.scss';
import {
  Row,
  Col,
  Modal, Carousel,
} from 'react-bootstrap';
function ShowSaveDetails() {
  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const [relatedPlatform, setRelatedPlatform] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const location = useLocation();

  const carouselImages = relatedGame ? [
    'https://static1.pocketlintimages.com/wordpress/wp-content/uploads/141774-games-news-feature-best-screenshots-image3-fanipzqw5s.jpg',
    'https://singleplayer.org/wp-content/uploads/2024/02/image-10.png',
    'https://gamingbolt.com/wp-content/uploads/2013/12/1.-Assassins-Creed-4.jpg',
    'https://interfaceingame.com/wp-content/uploads/taxonomies/genres/genres-adventure-500x281.jpg',
  ] : [];

  const { id } = useParams();
  const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } = useContext(LoadingContext);
  useEffect(() => {
    setRelatedGame(null);
    setRelatedPlatform(null);
    setRelatedUser(null);
    setTags([]);
    setSaveData({});
  }, [id, location.key]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        resetLoad();
        block();
        console.log("loading...")
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

        // 6. Tags (si existen)
        if (save.tags && save.tags.length > 0) {
          try {
            const { data: rawTags } = await api.get(`${config.api.tags}?tagID[in]=${save.tags.join(',')}`);
            setTags(Array.isArray(rawTags) ? rawTags : [rawTags]);
          } catch {
            console.warn('Error cargando tags');
          }
        }

      } catch (err) {
        console.error('Error general al cargar el archivo de guardado:', err);
      } finally {
        markAsLoaded();
        unblock();
        console.log("loaded...")
      }

    };
    loadAll();
  }, [id, location.key]);
  // Función para abrir modal y establecer imagen activa
  const openModalAtIndex = (index) => {
    setActiveIndex(index);
    setShowModal(true);
  };

  // Función para cerrar modal
  const closeModal = () => setShowModal(false);
  if (isInitialLoad) return <p style={{ textAlign: 'center' }}>loading...</p>;

  function formatFileSize(bytes) {
    const size = bytes / 1024 / 1024;
    return size < 1
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${size.toFixed(1)} MB`;
  }

  function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  }

  return (
    <>
      {/* Breadcrumb */}
      <Row>
        <Col>
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
                  <Link to={`/g/${relatedGame.slug}`}>{relatedGame.title}</Link>
                </li>
                <li>  </li>
              </ol>
            </nav>
          </section>

        </Col>
      </Row>
      <div className="save-details">

        {/* Parte superior: Título, subtítulo y descripción */}
        <header className="save-header">
          <div className="header-left">
            <h1>{saveData.title || 'Untitled Save'}</h1>
            {relatedGame && relatedPlatform && (
              <h2 className="subtitle">
                <Link to={`/g/${relatedGame.slug}`}>{relatedGame.title}</Link>
                {' • '}
                {relatedPlatform.abbreviation}
                <img
                  src={relatedPlatform.logo}
                  alt={relatedPlatform.name}
                  className="platform-logo"
                />
              </h2>
            )}
            <p className="description">
              {saveData.description || 'No description provided.'}
            </p>
          </div>

          <div className="header-right">
            <button
              className="download-button"
              onClick={() => {
                window.location.href = `${config.api.assets}/savedata/${id}`;
              }}
            >
              Download
            </button>
            <div className="download-info">
              <span className="file-size">
                {saveData.fileSize !== undefined
                  ? (saveData.fileSize >= 1048576
                    ? `${(saveData.fileSize / 1048576).toFixed(2)} MB`
                    : `${(saveData.fileSize / 1024).toFixed(2)} KB`)
                  : 'Unknown size'}
              </span>
              <span className="download-count">⬇️ {saveData.nDownloads || 0}</span>
            </div>
          </div>
        </header>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="tags-container">
            {tags.map(tag => (
              <span key={tag._id} className="tag-badge" data-tooltip={tag.description}>{tag.name}</span>
            ))}
          </div>
        )}

        {/* Miniaturas */}
        <div className="carousel-container">
          {carouselImages.map((imgSrc, index) => (
            <img
              key={index}
              src={imgSrc}
              alt={`Thumbnail ${index + 1}`}
              className="carousel-image"
              onClick={() => openModalAtIndex(index)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>

        {/* Modal con carrusel */}
        <Modal show={showModal} onHide={closeModal} size="lg" centered>
          <Modal.Header closeButton />
          <Modal.Body>
            <Carousel activeIndex={activeIndex} onSelect={setActiveIndex} interval={null}>
              {carouselImages.map((imgSrc, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={imgSrc}
                    alt={`Slide ${idx + 1}`}
                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          </Modal.Body>
        </Modal>


        <div className="save-separator" />
        {/* Información inferior */}
        <div className="save-footer">
          {/* Uploaded by */}
          <div className="block uploaded-by">
            <div className="label">Uploaded by:</div>
            <div className="content">
              <img
                src={'https://i.pinimg.com/236x/ac/d1/c1/acd1c1059f69113985d167a8c1a2ecf9.jpg'}
                alt="Uploader"
                className="uploader-avatar"
              />
              <Link to={`/u/${relatedUser?.userName || ''}`} className="uploader-name">
                @{relatedUser?.userName || 'Unknown'}
              </Link>
            </div>
          </div>

          {/* Posted date */}
          <div className="block posted-date">
            <div className="label">Posted date:</div>
            <div className="content">
              {formatDate(saveData.postedDate)}
            </div>
          </div>

          {/* Likes */}
          <div className="block likes-block">
            <div className="label">Rating:</div>
            <div className="content">
              <button className="like-button">
                👍 <span className="like-count">12</span>
              </button>
              <button className="dislike-button">
                👎 <span className="dislike-count">3</span>
              </button>
            </div>
          </div>
        </div>


      </div>

    </>

  );
}

export default ShowSaveDetails;
