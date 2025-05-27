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

      if (saveFile.title === "") messages.push("Debes poner un título al archivo de guardado.");
      if (saveFile.gameID === "") messages.push("Debes elegir un juego.");
      if (saveFile.platformID === "") messages.push("Debes seleccionar la plataforma.");
      if (saveFile.file === "") messages.push("Debes subir un archivo de guardado.");

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
      setMessage(err.message || "Ha ocurrido un error.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Subir archivo de guardado</h2>

      {message && (
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4 border rounded shadow-sm bg-light">

        <div className="mb-3">
          <label className="form-label">Archivo</label>
          <input type="file" className="form-control" onChange={onFileChange} />
        </div>

        <div className="mb-3">
          <label className="form-label">Título del archivo</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nombre del archivo"
            name="title"
            value={saveFile.title}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Juego</label>
          <select
            name="gameID"
            className="form-select"
            value={saveFile.gameID}
            onChange={onGameChange}
          >
            <option value="">Selecciona un juego</option>
            {games.map(game => (
              <option key={game._id} value={game._id}>{game.title}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Plataforma</label>
          <select
            name="platformID"
            className="form-select"
            value={saveFile.platformID}
            onChange={onChange}
            disabled={!saveFile.gameID}
          >
            <option value="">Selecciona una plataforma</option>
            {platforms.map((platformID) => (
              <option key={platformID} value={platformID}>
                {getPlatformName(platformID) || `Plataforma desconocida (${platformID})`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción (opcional)</label>
          <textarea
            className="form-control"
            placeholder="Añade una descripción del archivo"
            name="description"
            value={saveFile.description}
            onChange={onChange}
            rows="3"
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Subir</button>
      </form>
    </div>
  );
};

export default UploadSave;
