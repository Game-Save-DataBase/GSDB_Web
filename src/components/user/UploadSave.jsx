import config from "../../utils/config";
import React, { useState, useContext, useEffect, useRef } from "react";
import api from "../../utils/interceptor";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import NotificationTemplates from '../utils/NotificationTemplates';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '../../styles/Common.scss';

const UploadSave = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [message, setMessage] = useState('');
  const [saveFile, setSaveFile] = useState({
    title: "",
    gameID: "",
    platformID: "",
    description: "",
    file: null,
    tags: ""
  });

  const [games, setGames] = useState([]);
  const searchTimeout = useRef(null);
  const [selectedGameObj, setSelectedGameObj] = useState(null);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    // Fetch all platforms once at component load
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

  const fetchGamesByTitle = async (query) => {
    const normalizedQuery = query.trim().toLowerCase(); // limpieza
    try {
      let { data } = await api.get(`${config.api.games}?limit=35&complete=false&title[like]=${encodeURIComponent(query)}`);
      if (!Array.isArray(data)) {
        data = [data]
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

  const getPlatformAbbreviations = (platformIDs) => {
    return platforms
      .filter(p => platformIDs.includes(p.IGDB_ID))
      .map(p => p.abbreviation)
      .filter(Boolean);
  };

  const onChange = (e) => {
    setSaveFile({ ...saveFile, [e.target.name]: e.target.value });
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setSaveFile({ ...saveFile, file });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      const messages = [];

      if (saveFile.title === "") messages.push("You must provide a title for the save file.");
      if (saveFile.gameID === "") messages.push("You must select a game.");
      if (!saveFile.file) messages.push("You must upload a save file.");

      if (messages.length > 0) throw new Error(messages.join(" "));

      formData.append("title", saveFile.title);
      formData.append("gameID", saveFile.gameID);
      formData.append("description", saveFile.description);
      formData.append("userID", user.userID);
      formData.append("file", saveFile.file);
      formData.append("platformID", saveFile.platformID);
      console.log(formData)
      selectedTags.forEach(tag => formData.append("tags[]", tag.tagID));

      const res = await api.post(`${config.api.savedatas}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      sendNotifications();

      setSaveFile({ title: "", gameID: "", description: "", file: null, tags: "" });
      setSelectedTags([]);
      setSelectedGameObj(null);
      navigate(`/s/${res.data.saveID}`);

    } catch (err) {
      console.error("Error in CreateSaveFile!", err);
      setMessage(err.message || "An error has occurred.");
    }
  };

  const sendNotifications = async (e) => {

    const { data: game } = await api.get(`${config.api.games}?_id=${saveFile.gameID}`);

    if (game.userFav && Array.isArray(game.userFav) && game.userFav.length > 0) {
      const notification = NotificationTemplates.newSaveForFavorite({ game });
      await Promise.all(game.userFav.map(favUserId =>
        api.post(`/api/users/send-notification`, {
          id: favUserId,
          ...notification
        })
      ));
    }
  };




  return (
    <div className="container mt-5">
      <h2 className="mb-4">Upload Save File</h2>

      {message && (
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 border rounded shadow-sm bg-light">
        <div className="mb-3">
          <label className="form-label">File</label>
          <input type="file" className="form-control" onChange={onFileChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Save Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Name of the save file"
            name="title"
            value={saveFile.title}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Game</label>
          <Typeahead
            id="game-search"
            labelKey="title"
            options={games}
            placeholder="Search for a game..."
            onChange={(selected) => {
              if (selected.length > 0) {
                const game = selected[0];
                setSelectedGameObj(game);
                setSaveFile(prev => ({ ...prev, gameID: game.gameID }));
              } else {
                setSelectedGameObj(null);
                setSaveFile(prev => ({ ...prev, gameID: "" }));
              }
            }}
            onInputChange={(text, e) => {
              if (e && e.type === 'change') {
                handleGameInputChange(text);
              }
            }} renderMenuItemChildren={(option) => {
              const year = option.release_date ? new Date(option.release_date).getFullYear() : 'TBD';
              const platformNames = getPlatformAbbreviations(option.platformID || []).join(", ");
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
          />
        </div>

        {selectedGameObj?.platformID?.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Platform</label>
            <Typeahead
              id="platform-select"
              labelKey="name"
              options={platforms.filter(p => selectedGameObj.platformID.includes(p.IGDB_ID))}
              placeholder="Select a platform..."
              onChange={(selected) => {
                if (selected.length > 0) {
                  const platform = selected[0];
                  setSaveFile(prev => ({ ...prev, platformID: platform.platformID }));
                } else {
                  setSaveFile(prev => ({ ...prev, platformID: "" }));
                }
              }}
              selected={
                platforms
                  .filter(p => selectedGameObj.platformID.includes(p.IGDB_ID))
                  .filter(p => p.platformID === saveFile.platformID)
              }
              multiple={false}
              renderMenuItemChildren={(option) => (
                <div className="d-flex align-items-center">
                  {option.logo && (
                    <img
                      src={option.logo}
                      alt={`${option.name} logo`}
                      style={{ height: "24px", width: "24px", objectFit: "contain", marginRight: "8px" }}
                    />
                  )}
                  <span>
                    {option.name}
                    {option.abbreviation ? ` [${option.abbreviation}]` : ""}
                  </span>
                </div>
              )}
            />
          </div>
        )}



        {selectedGameObj?.cover && (
          <div className="mb-3 text-center">
            <img
              src={selectedGameObj.cover}
              alt={`${selectedGameObj.title} cover`}
              style={{ maxHeight: "250px", objectFit: "contain" }}
              className="img-fluid rounded shadow-sm"
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Tags</label>
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

        <div className="mb-3">
          <label className="form-label">Description (optional)</label>
          <textarea
            className="form-control"
            placeholder="Add a description of the save file"
            name="description"
            value={saveFile.description}
            onChange={onChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Upload</button>
      </form>
    </div>
  );
};

export default UploadSave;
