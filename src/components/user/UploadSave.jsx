import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Form, Button, Accordion } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import config from '../../utils/config';
import api from '../../utils/interceptor';
import ImageCarouselModal from '../utils/ImageCarouselModal';
import '../../styles/user/UploadSave.scss';
import { UserContext } from "../../contexts/UserContext.jsx";

function NewSavePage() {
  const navigate = useNavigate();
  const { user: loggedUser, loading } = useContext(UserContext);
  useEffect(() => {
    if (!loading && !loggedUser) {
      navigate('/login', { replace: true });
    }
  }, [loading, loggedUser, navigate]);

  const [searchParams] = useSearchParams();
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

  // Estados para metadata
  const [sugestedMetadata, setSugestedMetadata] = useState([{ key: 'play_time', description: 'Play time', type: 'Time', value: "00:00:00", sugested: true },
  { key: 'difficulty', description: 'Game difficulty', type: 'Text', value: '', sugested: true },
  { key: 'completition_perc', description: 'Completion percentage', type: '%', value: -1, sugested: true },
  // { key: 'finished', description: 'Finished main game', type: 'Boolean', value: false, sugested: true },
  // { key: 'completed', description: 'Completed main game + extras', type: 'Boolean', value: false, sugested: true },
  { key: 'level', description: 'Actual level', type: 'Number', value: 0, sugested: true },
  { key: 'chapter', description: 'Actual chapter', type: 'Text', value: "", sugested: true },
  { key: 'saveState', description: 'Is save state', type: 'Boolean', value: false, sugested: true },
  { key: 'libretro_core', description: 'Libretro core used', type: 'Text', value: "", sugested: true },
  { key: 'mods', description: 'Mods used', type: 'Text', value: "", sugested: true },
  { key: 'character', description: 'Character, class...', type: 'Text', value: "", sugested: true },
  { key: 'seed', description: 'Seed', type: 'Text', value: "", sugested: true }
  ]);
  const [metadataList, setMetadataList] = useState([]);

  const [newMetaKey, setNewMetaKey] = useState('');
  const [newMetaDescription, setNewMetaDescription] = useState('');
  const [newMetaType, setNewMetaType] = useState('Number');
  const [newMetaValue, setNewMetaValue] = useState('');

  // Array de tipos de valor
  const metaTypes = ['Number', '%', 'Text', 'Time', 'Boolean'];

  const removeMetadata = (key) => {
    setMetadataList(prev => {
      const metaToRemove = prev.find(meta => meta.key === key);
      if (metaToRemove && metaToRemove.sugested) {
        // Añadir de nuevo a la lista de sugeridos
        setSugestedMetadata(prevSugested => [...prevSugested, metaToRemove]);
      }
      // Filtrar de la lista principal
      return prev.filter(meta => meta.key !== key);
    });
  };

  const validateMetadataValue = (type, value) => {
    switch (type) {
      case 'Number':
        return !isNaN(Number(value));
      case '%':
        const num = Number(value);
        return !isNaN(num) && num >= 0 && num <= 200;
      case 'Text':
        return typeof value === 'string';
      case 'Time':
        // Formato HHHH:MM:SS (horas 0-9999, minutos 0-59, segundos 0-59)
        return /^(\d{1,4}):([0-5]?\d):([0-5]?\d)$/.test(value);
      case 'Boolean':
        return value === true || value === false || value === 'true' || value === 'false';
      default:
        return false;
    }
  };
  const handleMetadataChange = (key, field, newValue) => {
    setMetadataList(prev =>
      prev.map(meta => {
        if (meta.key !== key) return meta;
        // Solo actualiza el valor sin validar
        return { ...meta, [field]: newValue };
      })
    );
  };

  const handleMetadataBlur = (key, field, value) => {
    setMetadataList(prev =>
      prev.map(meta => {
        if (meta.key !== key) return meta;

        if (field === 'value') {
          if (!validateMetadataValue(meta.type, value)) {
            console.log("alerta", key, field, value)
            alert(`Value does not match type ${meta.type}`);
            return meta; // no cambia si es inválido
          }
        }

        return meta; // ya está actualizado en handleMetadataChange
      })
    );
  };

  // Función para añadir un metadata sugerido
  const handleAddSugested = (key) => {
    const metaToAdd = sugestedMetadata.find(meta => meta.key === key);

    if (!metaToAdd) return;

    if (metadataList.some(meta => meta.key === key)) return;

    setMetadataList(prev => [...prev, metaToAdd]);
    setSugestedMetadata(prev => prev.filter(meta => meta.key !== key));
  };

  const handleAddMetadata = () => {
    if (!newMetaKey || !newMetaType || !newMetaDescription || (newMetaType != 'Boolean' && !newMetaValue)) {
      alert("All fields are required.");
      return;
    }
    if (metadataList.some(meta => meta.key === newMetaKey) || sugestedMetadata.some(meta => meta.key === newMetaKey)) {
      alert(`Metadata key "${newMetaKey}" already exists.`);
      return;
    }

    if (!/^[a-z-_]+$/.test(newMetaKey)) {
      alert("Key must be lowercase letters only, no spaces, numbers or special chars.");
      return;
    }

    console.log(newMetaType, newMetaValue)
    if (!validateMetadataValue(newMetaType, newMetaValue)) {
      alert(`Value does not match type ${newMetaType}`);
      return;
    }

    setMetadataList(prev => [
      ...prev,
      { key: newMetaKey, description: newMetaDescription, type: newMetaType, value: newMetaValue, sugested: false }
    ]);

    // Limpiar inputs
    setNewMetaKey('');
    setNewMetaDescription('');
    setNewMetaValue('');
    setNewMetaType(metaTypes[0]);
  };


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

      const metadataObj = {};
      const metadataDescObj = {};

      metadataList.forEach(meta => {
        metadataObj[meta.key] = meta.value;
        metadataDescObj[meta.key] = meta.description;
      });

      formData.append("metadata", JSON.stringify(metadataObj));
      formData.append("metadataDesc", JSON.stringify(metadataDescObj));


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

            <h3>
              Metadata
            </h3>
            {metadataList.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Value</th>
                      <th> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metadataList.map(meta => (
                      <tr key={meta.key}>
                        <td>{meta.key}</td>
                        {meta.sugested ? (
                          <td>
                            {meta.description}
                          </td>) : (
                          <td>
                            <Form.Control
                              type="text"
                              value={meta.description}
                              onChange={(e) => handleMetadataChange(meta.key, 'description', e.target.value)}
                              onBlur={(e) => handleMetadataBlur(meta.key, 'description', e.target.value)}
                            />
                          </td>
                        )}
                        <td>{meta.type}</td>
                        <td>
                          <Form.Control
                            type="text"
                            value={meta.value}
                            onChange={(e) => handleMetadataChange(meta.key, 'value', e.target.value)}
                            onBlur={(e) => handleMetadataBlur(meta.key, 'value', e.target.value)}
                          />
                        </td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => removeMetadata(meta.key)}>Delete</Button>
                        </td>

                      </tr>

                    ))}
                  </tbody>
                </table>
              </div>
            ) :
              (<p>No metadata</p>)}

            {/* añadir sugested */}
            {sugestedMetadata.length > 0 && (
              <Accordion className="mb-3 small-accordion">
                <Accordion.Item eventKey="0">
                  <Accordion.Header >add sugested metadata</Accordion.Header>
                  <Accordion.Body>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Key</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th> </th>
                          </tr>
                        </thead>
                        <tbody>
                          {sugestedMetadata.map(meta => (
                            <tr key={meta.key}>
                              <td>{meta.key}</td>
                              <td>{meta.description}</td>
                              <td>{meta.type}</td>
                              <td>
                                <Button variant="success" onClick={() => handleAddSugested(meta.key)}>Add</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
            <Accordion className="mb-3 small-accordion">
              <Accordion.Item eventKey="0">
                <Accordion.Header >add custom metadata</Accordion.Header>
                <Accordion.Body>

                  <div className="mb-3">
                    <Form>
                      <div className="d-flex gap-2 mb-2">
                        <Form.Control
                          type="text"
                          placeholder="Key"
                          value={newMetaKey}
                          onChange={(e) => setNewMetaKey(e.target.value)}
                        />
                        <Form.Control
                          type="text"
                          placeholder="Description"
                          value={newMetaDescription}
                          onChange={(e) => setNewMetaDescription(e.target.value)}
                        />
                        <Form.Select value={newMetaType} onChange={(e) => {
                          const selectedType = e.target.value;
                          setNewMetaType(selectedType);
                          if (selectedType === 'Boolean') {
                            setNewMetaValue(false);
                          } else {
                            setNewMetaValue('');
                          }
                        }}>
                          {metaTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </Form.Select>
                        {newMetaType != 'Boolean' ? (
                          <>
                            <Form.Control
                              type="text"
                              placeholder={
                                newMetaType === "Text"
                                  ? "insert text..."
                                  : newMetaType === "Number"
                                    ? "insert number..."
                                    : newMetaType === "%"
                                      ? "[0-200]"
                                      : "HHHH:MM:SS"
                              } value={newMetaValue}
                              onChange={(e) => setNewMetaValue(e.target.value)}
                            />
                          </>
                        ) : (
                          <Form.Check
                            type="checkbox"
                            checked={newMetaValue === true}
                            onChange={(e) => setNewMetaValue(e.target.checked)}
                          />

                        )

                        }

                        <Button variant="success" onClick={handleAddMetadata}>Add</Button>
                      </div>
                    </Form>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>

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
