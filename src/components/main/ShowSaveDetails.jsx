import config from '../../utils/config';
import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/interceptor';
import { LoadingContext } from '../../contexts/LoadingContext';
import JSZip from "jszip";
import '../../styles/Common.scss';
import '../../styles/main/ShowSaveDetails.scss';
import '../../styles/utils/FavoriteButton.scss';

import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';

import { UserContext } from '../../contexts/UserContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsDown, faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import ImageCarouselModal from '../utils/ImageCarouselModal';
import FavoriteButton from '../utils/FavoriteButton';

function ShowSaveDetails() {
  const [saveData, setSaveData] = useState({});
  const [relatedGame, setRelatedGame] = useState(null);
  const [relatedPlatform, setRelatedPlatform] = useState(null);
  const [relatedUser, setRelatedUser] = useState(null);
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [comments, setComments] = useState([]);
  const [isLike, setIsLike] = useState(false);
  const [isDislike, setIsDislike] = useState(false);
  const [carouselImages, setCarouselImages] = useState([]);

  const { id } = useParams();
  const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } = useContext(LoadingContext);
  const { user } = useContext(UserContext);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [usersMap, setUsersMap] = useState({}); // <-- mapa userID => userInfo
  const [replyingTo, setReplyingTo] = useState(null); // commentID al que se responde
  const [replyText, setReplyText] = useState('');
  const isUploader = user && saveData.userID === user.userID;
  const [hiddenReplies, setHiddenReplies] = useState({});

  const navigate = useNavigate();


  useEffect(() => {
    const loadAll = async () => {
      try {
        resetLoad();
        block();
        // 1. Guardado principal
        const { data: save } = await api.get(`${config.api.savedatas}?id=${id}`);
        setSaveData(save);
        if (!save) {
          navigate('/notfound?s', { replace: true });
          return;
        }

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
        if (save.tagID && save.tagID.length > 0) {
          try {
            const { data: rawTags } = await api.get(`${config.api.tags}?tagID[in]=${save.tagID.join(',')}`);
            setTags(Array.isArray(rawTags) ? rawTags : [rawTags]);
          } catch {
            console.warn('Error cargando tags');
          }
        }
        // Cargar imágenes del ZIP
        try {
          const res = await api.get(`${config.api.assets}/savedata/${id}/scr`, { responseType: "arraybuffer" });
          const zip = await JSZip.loadAsync(res.data);

          const imagePromises = Object.keys(zip.files).map(async (filename) => {
            const blob = await zip.files[filename].async("blob");
            return URL.createObjectURL(blob);
          });

          const images = await Promise.all(imagePromises);
          setCarouselImages(images);
        } catch (err) {
          console.warn("No se pudieron cargar las imágenes del carrusel:", err);
        }


        // Cargar comentarios y usuarios de comentarios
        const loadCommentsAndUsers = async () => {
          try {
            const { data } = await api.get(`${config.api.comments}?saveID=${save.saveID}`);
            const commentList = Array.isArray(data) ? data : [data];
            setComments(commentList);

            // Extraer userIDs únicos de comentarios
            const uniqueUserIDsSet = new Set(commentList.map(c => c.userID).filter(Boolean));
            let uniqueUserIDs = Array.from(uniqueUserIDsSet);

            // Añadir usuario logueado al inicio si existe y no está ya
            if (user && !uniqueUserIDs.includes(user.userID)) {
              uniqueUserIDs.unshift(user.userID);
            }

            if (uniqueUserIDs.length === 0) {
              setUsersMap({});
              return;
            }

            // Fetch info usuarios
            const { data: usersData } = await api.get(`${config.api.users}?userID[in]=${uniqueUserIDs.join(',')}`);
            const usersArray = Array.isArray(usersData) ? usersData : [usersData];

            // Crear mapa userID => userInfo
            const map = {};
            usersArray.forEach(u => {
              if (u.userID) map[u.userID] = u;
            });
            setUsersMap(map);

          } catch (error) {
            console.warn('Error loading comments or users:', error);
          }
        };

        await loadCommentsAndUsers();


        if (user && saveData) {
          if (saveData.likes?.includes(user.userID)) { setIsDislike(false); setIsLike(true); }
          else if (saveData.dislikes?.includes(user.userID)) { setIsDislike(true); setIsLike(false); }
          else { setIsDislike(false); setIsLike(false); }
        }

      } catch (err) {
        console.error('Error general al cargar el archivo de guardado:', err);
      } finally {
        markAsLoaded();
        unblock();
      }

    };
    loadAll();
  }, [id, user, resetLoad, block, unblock, markAsLoaded]);
  // Función para abrir modal y establecer imagen activa
  const openModalAtIndex = (index) => {
    setActiveIndex(index);
    setShowModal(true);
  };
  const toggleReplies = (commentID) => {
    setHiddenReplies(prev => ({
      ...prev,
      [commentID]: !prev[commentID],
    }));
  };

  // Función para cerrar modal
  const closeModal = () => setShowModal(false);
  if (isInitialLoad) return <p style={{ textAlign: 'center' }}></p>;

  function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES');
  }

  const postComment = async (isReply = false, parentID = null) => {
    const text = isReply ? replyText : newComment;
    if (!text.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setPosting(true);
    setPostError(null);

    try {
      const payload = {
        text,
        userID: user.userID,
        saveID: saveData.saveID,
        postedDate: new Date().toISOString(),
        ...(isReply && parentID ? { previousComment: parentID } : {}),
      };

      await api.post(`${config.api.comments}`, payload);

      // Reset
      if (isReply) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      const { data } = await api.get(`${config.api.comments}?saveID=${saveData.saveID}`);
      const commentList = Array.isArray(data) ? data : [data];
      setComments(commentList);
    } catch (err) {
      setPostError('Failed to post comment. Try again later.');
    } finally {
      setPosting(false);
    }
  };


  const groupedComments = comments.reduce((acc, c) => {
    const parent = c.previousComment || 'root';
    acc[parent] = acc[parent] || [];
    acc[parent].push(c);
    return acc;
  }, {});


  const handleLike = async (like) => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      //reseteamos el estado (dar like o dislike dos veces) o si o hacemos like
      if (isLike && like || isDislike && !like) {
        const res = await api.put(`${config.api.savedatas}/reset-rating?id=${saveData.saveID}`);
      } else {
        const res = await api.put(`${config.api.savedatas}/update-rating?mode=${like ? 'like' : 'dislike'}&id=${saveData.saveID}`);
      }
      // Volver a obtener datos actualizados del guardado
      const { data: updatedSave } = await api.get(`${config.api.savedatas}?id=${saveData.saveID}`);
      setSaveData(updatedSave);
      // Establecer estados visuales de nuevo
      if (updatedSave.likes?.includes(user.userID)) {
        setIsLike(true);
        setIsDislike(false);
      } else if (updatedSave.dislikes?.includes(user.userID)) {
        setIsLike(false);
        setIsDislike(true);
      } else {
        setIsLike(false);
        setIsDislike(false);
      }


    } catch (error) {
      console.error('Error updating rating:', error.response?.data || error.message);
    }
  };
  const renderComments = (parentID = 'root', depth = 0) => {
    const commentList = groupedComments[parentID] || [];

    return commentList.map((comment, index) => {
      const u = usersMap[comment.userID];
      const alias = u ? (u.alias?.trim() || u.userName) : 'Unknown';
      const username = u ? u.userName : 'unknown';

      const hasReplies = (groupedComments[comment.commentID] || []).length > 0;
      const repliesHidden = hiddenReplies[comment.commentID];

      return (
        <div
          key={comment.commentID || `${comment.userID}-${index}`}
          className="mb-3"
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="comment-item d-flex">
            <img
              src={`${config.api.assets}/user/${comment.userID}/pfp`}
              alt="User profile"
              width={40}
              height={40}
              className="me-2"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/default-avatar.png'; }}
            />
            <div>
              <div className="comment-header mb-1">
                <Link to={`/u/${username}`} className="comment-user-link">
                  <strong>{alias}</strong> <span className="text-muted">(@{username})</span>
                </Link>
                <span className="comment-date ms-2 text-muted">
                  {comment.postedDate ? new Date(comment.postedDate).toLocaleDateString('es-ES') : ''}
                </span>
              </div>
              <div className="comment-text" style={{ whiteSpace: 'pre-wrap' }}>
                {comment.text}
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setReplyingTo(comment.commentID)}
                className="mt-1 p-0"
              >
                Reply
              </Button>

              {hasReplies && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => toggleReplies(comment.commentID)}
                  className="mt-1 p-0 ms-2"
                >
                  {repliesHidden ? 'Show replies' : 'Hide replies'}
                </Button>
              )}

              {replyingTo === comment.commentID && (
                <Form
                  onSubmit={e => {
                    e.preventDefault();
                    postComment(true, comment.commentID);
                  }}
                  className="mt-2 reply-form"
                >
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Escribe tu respuesta..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    disabled={posting}
                  />
                  <div className="mt-1">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={posting || !replyText.trim()}
                    >
                      {posting ? 'Sending...' : 'Reply'}
                    </Button>{' '}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </div>
          </div>

          {/* Renderizar hijos solo si no están ocultos */}
          {!repliesHidden && renderComments(comment.commentID, depth + 1)}
        </div>
      );
    });
  };


  if (isInitialLoad || !relatedGame || !saveData) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FavoriteButton saveID={saveData.saveID} style={{ width: '24px', height: '24px' }} />
              <h1 style={{ margin: 0 }}>{saveData.title || 'Untitled Save'}</h1>
            </div>
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

        <ImageCarouselModal
          show={showModal}
          onClose={closeModal}
          images={carouselImages}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />


        <div className="save-separator" />
        {/* Información inferior */}
        <div className="save-footer">
          {/* Uploaded by */}
          <div className="block uploaded-by">
            <div className="label">Uploaded by:</div>
            <div className="content">
              <img
                src={`${config.api.assets}/user/${saveData.userID}/pfp`}
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
            <div className="label">Community rating:</div>
            <div className="content">
              <button
                className={`favorite-button ${isLike ? 'favorite' : 'not-favorite'} ${user?.userID === saveData.userID ? 'disabled' : ''}`}
                onClick={() => user?.userID !== saveData.userID && handleLike(true)}
                aria-label={isLike ? 'Dislike upload' : 'Like upload'}
                disabled={user?.userID === saveData.userID}
              >
                <FontAwesomeIcon icon={faThumbsUp} size="2x" />
              </button>
              <span>{saveData.likes.length}</span>
              <button
                className={`favorite-button ${isDislike ? 'favorite' : 'not-favorite'} ${user?.userID === saveData.userID ? 'disabled' : ''}`}
                onClick={() => user?.userID !== saveData.userID && handleLike(false)}
                aria-label={isDislike ? 'Dislike upload' : 'Like upload'}
                disabled={user?.userID === saveData.userID}
              >
                <FontAwesomeIcon icon={faThumbsDown} size="2x" />
              </button>
              <span>{saveData.dislikes.length}</span>

            </div>
          </div>
        </div>
      </div >
      <div className="comments-section mt-4">
        <h3>Comments</h3>

        {comments.length === 0 || comments.filter(c => c.text && c.text.trim() !== '').length === 0 ? (
          <p>No comments yet. Be the first one to comment!</p>
        ) : (
          <div className="comments-list">
            {renderComments()}
          </div>
        )}

        <div className="save-separator" />

        <Form
          onSubmit={e => {
            e.preventDefault();
            postComment();
          }}
          className="mb-4"
        >
          <Form.Group controlId="commentTextArea" className="mb-2">
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Say something!..."
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={posting}
            />
          </Form.Group>
          {postError && <Alert variant="danger">{postError}</Alert>}
          <Button type="submit" disabled={posting || !newComment.trim()}>
            {posting ? (<><Spinner animation="border" size="sm" /> Posting...</>) : 'Post Comment'}
          </Button>
        </Form>
      </div>



    </>

  );
}

export default ShowSaveDetails;
