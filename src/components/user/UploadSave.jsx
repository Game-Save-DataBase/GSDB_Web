import config from "../../utils/config";
import React, { useState, useEffect, useContext } from "react";
import api from "../../utils/interceptor";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext";
import { PLATFORMS, getPlatformName } from '../../utils/constants';
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
    file: ""
  });

  const [games, setGames] = useState([]);
  const [platforms, setPlatforms] = useState([]);

  useEffect(() => {
    api.get(`${config.api.games}`)
      .then(response => setGames(response.data))
      .catch(error => console.log("Error fetching games", error));
  }, []);

  const onChange = (e) => {
    setSaveFile({ ...saveFile, [e.target.name]: e.target.value });
  };

  const onGameChange = (e) => {
    const value = e.target.value;
    setSaveFile({ ...saveFile, gameID: value, platformID: "" });

    const selectedGame = games.find(game => game._id === value);
    setPlatforms(selectedGame ? selectedGame.platformsID || [] : []);
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    setSaveFile({ ...saveFile, file: file });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const messages = [];

      if (saveFile.title === "") messages.push("You must provide a title for the save file.");
      if (saveFile.gameID === "") messages.push("You must select a game.");
      if (saveFile.platformID === "") messages.push("You must choose a platform.");
      if (saveFile.file === "") messages.push("You must upload a save file.");

      if (messages.length > 0) throw new Error(messages.join(" "));

      formData.append("title", saveFile.title);
      formData.append("gameID", saveFile.gameID);
      formData.append("platformID", saveFile.platformID);
      formData.append("description", saveFile.description);
      formData.append("userID", user._id);
      formData.append("file", saveFile.file);

      const res = await api.post(`${config.api.savedatas}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSaveFile({ title: "", gameID: "", platformID: "", description: "", file: null });
      navigate(`/save/${res.data._id}`);

    } catch (err) {
      console.log("Error in CreateSaveFile!", err);
      setMessage(err.message || "An error has occurred.");
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
          <select
            name="gameID"
            className="form-select"
            value={saveFile.gameID}
            onChange={onGameChange}
          >
            <option value="">Select a game</option>
            {games.map(game => (
              <option key={game._id} value={game._id}>{game.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Platform</label>
          <select
            name="platformID"
            className="form-select"
            value={saveFile.platformID}
            onChange={onChange}
            disabled={!saveFile.gameID}
          >
            <option value="">Select a platform</option>
            {platforms.map((platformID) => (
              <option key={platformID} value={platformID}>
                {getPlatformName(platformID) || `Unknown platform (${platformID})`}
              </option>
            ))}
          </select>
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
