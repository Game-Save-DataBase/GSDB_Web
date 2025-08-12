import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import config from '../../utils/config';
import api from '../../utils/interceptor';
import ImageCarouselModal from '../utils/ImageCarouselModal';
import '../../styles/user/UploadSave.scss';

function NewSavePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [games, setGames] = useState([]);
  const [selectedGameObj, setSelectedGameObj] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [platformAbbreviation, setPlatformAbbreviation] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const [saveFile, setSaveFile] = useState(null); // archivo save
  const [screenshots, setScreenshots] = useState([]); // archivos screenshots
  const [previewUrls, setPreviewUrls] = useState([]); // URLs para preview + carrusel

  const [showModal, setShowModal] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const searchTimeout = useRef(null);

  useEffect(() => {
    const gameIDFromParam = searchParams.get("gameID");
    if (gameIDFromParam) {
      const fetchGameById = async () => {
        try {
          const { data } = await api.get(`${config.api.games}?gameID=${gameIDFromParam}`);
          if (data) {
            const game = Array.isArray(data) ? data[0] : data;
            setSelectedGameObj(game);
            setSaveFile(prev => ({ ...prev, gameID: game.gameID }));
          }
        } catch (err) {
          console.error("Error fetching game by ID:", err);
        }
      };
      fetchGameById();
    }
  }, [searchParams]);

  // Actualizar URLs de preview cuando cambien screenshots
  useEffect(() => {
    if (screenshots.length === 0) {
      setPreviewUrls([]);
      return;
    }
    const urls = screenshots.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Liberar URLs antiguos cuando cambien screenshots
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [screenshots]);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const { data } = await api.get(`${config.api.platforms}?limit=200`);
        setPlatforms(data);
      } catch (err) {
        console.error("Error fetching platforms", err);
      }
    };

    const fetchTags = async () => {
      try {
        const { data } = await api.get('/api/tags');
        if (Array.isArray(data)) {
          setTags(data);
        }
      } catch (err) {
        console.error("Error fetching tags", err);
      }
    };
    fetchPlatforms();
    fetchTags();

  }, []);

  const getPlatformAbbreviations = (platformIDs) => {
    return platforms
      .filter(p => platformIDs.includes(p.platformID))
      .map(p => p.abbreviation)
      .filter(Boolean)
      .join(", ");
  };

  const fetchGamesByTitle = async (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    try {
      let { data } = await api.get(`${config.api.games}?limit=35&complete=false&title[like]=${encodeURIComponent(query)}`);
      if (!Array.isArray(data)) {
        data = [data];
      }
      const sorted = data.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aIndex = aTitle.indexOf(normalizedQuery);
        const bIndex = bTitle.indexOf(normalizedQuery);

        if (aTitle.startsWith(normalizedQuery) && !bTitle.startsWith(normalizedQuery)) return -1;
        if (!aTitle.startsWith(normalizedQuery) && bTitle.startsWith(normalizedQuery)) return 1;
        if (aIndex !== bIndex) return aIndex - bIndex;
        return aTitle.length - bTitle.length;
      });
      setGames(sorted);
    } catch (err) {
      console.error("Error fetching games", err);
    }
  };

  const handleGameInputChange = (query) => {
    const trimmedQuery = query.trim();
    clearTimeout(searchTimeout.current);
    if (trimmedQuery.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        fetchGamesByTitle(trimmedQuery);
      }, 300);
    } else {
      setGames([]);
    }
  };

  // Actualizar abreviatura y plataforma seleccionada al cambiar el juego
  useEffect(() => {
    if (selectedGameObj) {
      if (selectedGameObj.platformID && selectedGameObj.platformID.length > 0) {
        const abbreviations = getPlatformAbbreviations(selectedGameObj.platformID);
        setPlatformAbbreviation(abbreviations);
      } else {
        setPlatformAbbreviation('');
      }
      // Reiniciar plataforma seleccionada cuando cambie el juego
      setSelectedPlatform(null);
    } else {
      setPlatformAbbreviation('');
      setSelectedPlatform(null);
    }
  }, [selectedGameObj]);

  // Actualizar la abreviatura cuando cambie la plataforma seleccionada
  useEffect(() => {
    if (selectedPlatform) {
      setPlatformAbbreviation(selectedPlatform.abbreviation || '');
    } else if (selectedGameObj) {
      const abbreviations = getPlatformAbbreviations(selectedGameObj.platformID || []);
      setPlatformAbbreviation(abbreviations);
    } else {
      setPlatformAbbreviation('');
    }
  }, [selectedPlatform, selectedGameObj]);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setSaveFile(file);
  };

  const onScreenshotsChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert("You can only select up to 4 screenshots.");
      e.target.value = null;
      setScreenshots([]);
    } else {
      setScreenshots(files);
    }
  };

  const openModalAtIndex = (index) => {
    setActiveIndex(index);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);


  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const messages = [];

      if (!title.trim()) messages.push("You must provide a title for the save file.");
      if (!selectedGameObj || !selectedGameObj.gameID) messages.push("You must select a game.");
      if (!selectedPlatform || !selectedPlatform.platformID) messages.push("You must select a platform.");
      if (!saveFile) messages.push("You must upload a save file.");

      if (messages.length > 0) {
        throw new Error(messages.join(" "));
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("gameID", selectedGameObj.gameID);
      formData.append("platformID", selectedPlatform.platformID);
      formData.append("description", description || "");
      formData.append("file", saveFile);

      screenshots.forEach(img => formData.append("screenshots", img));
      selectedTags.forEach(tag => formData.append("tagID[]", tag.tagID));

      const res = await api.post(`${config.api.savedatas}/async`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Limpiar el formulario tras subir
      setTitle("");
      setSelectedGameObj(null);
      setSelectedPlatform(null);
      setDescription("");
      setSaveFile(null);
      setScreenshots([]);
      setSelectedTags([]);
      setPreviewUrls([]);

      //navigate(`/s/${res.data.saveID}`);
      navigate(`/`);

    } catch (err) {
      console.error("Error in CreateSaveFile!", err);
      alert(err.message || "An error has occurred.");
    }
  };


  return (
    <>
      <h2 style={{ textAlign: "center" }}>Upload save file to GSDB</h2>
      <div className="save-details">
        <header className="save-header">
          <div className="header-left">

            <h3>Save title <span style={{ color: 'red' }}>*</span></h3>
            <Form.Control
              type="text"
              placeholder="Save title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2"
            />

            <h3>Game & platform <span style={{ color: 'red' }}>*</span></h3>
            <div className="subtitle">
              <Typeahead
                id="game-search"
                labelKey="title"
                options={games}
                placeholder="Search for a game..."
                selected={selectedGameObj ? [selectedGameObj] : []}
                onChange={(selected) => {
                  if (selected.length > 0) {
                    setSelectedGameObj(selected[0]);
                  } else {
                    setSelectedGameObj(null);
                  }
                }}
                onInputChange={(text, e) => {
                  if (e && e.type === 'change') {
                    handleGameInputChange(text);
                  }
                }}
                renderMenuItemChildren={(option) => {
                  const year = option.release_date ? new Date(option.release_date).getFullYear() : 'TBD';
                  const platformNames = getPlatformAbbreviations(option.platformID || []);
                  return (
                    <div>
                      <strong>{option.title}</strong>{" "}
                      <span className="text-muted">
                        ({year}{platformNames ? `) [${platformNames}]` : ")"}
                      </span>
                    </div>
                  );
                }}
                emptyLabel="No games found"
                className="mb-2"
                inputProps={{ style: { backgroundColor: 'white', fontSize: '1.1rem' } }}
              />
              {' • '}
              <Typeahead
                id="platform-select"
                labelKey="name"
                options={selectedGameObj?.platformID?.length > 0
                  ? platforms.filter(p => selectedGameObj.platformID.includes(p.platformID))
                  : []
                }
                placeholder="Select a platform..."
                selected={selectedPlatform ? [selectedPlatform] : []}
                onChange={(selected) => {
                  if (selected.length > 0) {
                    setSelectedPlatform(selected[0]);
                  } else {
                    setSelectedPlatform(null);
                  }
                }}
                renderMenuItemChildren={(option) => (
                  <div className="d-flex align-items-center">
                    {option.logo && (
                      <img
                        src={option.logo}
                        alt={`${option.name} logo`}
                        style={{ height: "40px", width: "40px", objectFit: "contain", marginRight: "8px" }}
                      />
                    )}
                    <span>
                      {option.name}
                      {option.abbreviation ? ` [${option.abbreviation}]` : ""}
                    </span>
                  </div>
                )}
                className="mb-2"
                multiple={false}
                disabled={!selectedGameObj} // 🔹 Bloqueado si no hay juego
                inputProps={{ style: { backgroundColor: 'white', fontSize: '1.1rem' } }}
              />
              <div style={{
                height: '40px',
                width: '40px',
                marginLeft: '8px',
                display: 'inline-block',
                verticalAlign: 'middle',
              }}>
                {selectedPlatform ? (
                  <img
                    src={selectedPlatform.logo}
                    alt="Platform logo"
                    style={{ height: '40px', width: '40px', objectFit: 'contain' }}
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', backgroundColor: 'transparent' }} />
                )}
              </div>

            </div>

            <h3>Description</h3>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Save description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
            />


            <h3>Tags</h3>
            <div className="mb-3">
              <Typeahead
                id="tags-select"
                labelKey="name"
                multiple
                options={tags}
                placeholder="Select one or more tags..."
                onChange={(selected) => setSelectedTags(selected)}
                selected={selectedTags}
                renderMenuItemChildren={(option) => (
                  <div>
                    <strong>{option.name}</strong>
                    {option.description && <div className="text-muted small">{option.description}</div>}
                  </div>
                )}
              />
            </div>
          </div>

          <div className="header-right">
            <img
              src={selectedGameObj?.cover || `${config.api.assets}/defaults/game-cover`}
              alt="Game cover"
            />
          </div>

        </header>

        <div className='save-separator'></div>

        <h3>Save file <span style={{ color: 'red' }}>*</span></h3>
        <div className="mb-3">
          <Form.Control
            type="file"
            onChange={onFileChange}
          />
        </div>

        <h3>Screenshots</h3>
        <div className="mb-3">
          <Form.Control
            type="file"
            multiple
            accept="image/*"
            onChange={onScreenshotsChange}
          />
        </div>


        {/* CARRUSEL CON PREVIEW DE IMÁGENES */}
        <div className="carousel-container">
          {previewUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Screenshot preview ${index + 1}`}
              className="carousel-image"
              onClick={() => openModalAtIndex(index)}
              style={{ cursor: 'pointer' }}

            />
          ))}
        </div>

        <ImageCarouselModal
          show={showModal}
          onClose={closeModal}
          images={previewUrls}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
        />

        <div className="mt-4 text-center">
          <Button variant="primary" onClick={onSubmit}>
            Upload Save File
          </Button>
        </div>
      </div>
    </>
  );
}

export default NewSavePage;
