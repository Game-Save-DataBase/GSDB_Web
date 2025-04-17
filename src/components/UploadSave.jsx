import config from "../utils/config";
import React, { useState, useEffect, useContext } from "react";
import api from "../utils/interceptor";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import '../styles/Common.scss';
import { PLATFORMS, getPlatformName } from '../utils/constants'

const UploadSave = (props) => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // ← obtenemos el usuario del contexto
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

  //Ahora mismo el file no se guarda (no tenemos nada implementado para ello) y guarda un string para que no se quede vacío
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
      if (saveFile.platformID === "") messages.push("Debes seleccionar la plataforma a la que corresponde tu archivo de guardado.");
      if (saveFile.file === "") messages.push("Debes subir un archivo de guardado.");

      if (messages.length > 0) {
        throw new Error(messages.join(" "));
      }

      formData.append("title", saveFile.title);
      formData.append("gameID", saveFile.gameID);
      formData.append("platformID", saveFile.platformID);
      formData.append("description", saveFile.description);
      formData.append("userID", user.user._id);
      formData.append("file", saveFile.file);
      // Realizar el POST al backend
      await api.post(`${config.api.savedatas}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Resetear el formulario
      setSaveFile({
        title: "",
        gameID: "",
        platformID: "",
        description: "",
        file: null
      });
      navigate("/"); // Redirigir después de que se haya creado el savedata
    } catch (err) {
      console.log("Error in CreateSaveFile!", err);
      setMessage(err.message || "Ha ocurrido un error.");
    }
  };


  return (
    <div>
      <h2>Add Save File to Database</h2>
      <form noValidate onSubmit={onSubmit}>
        <input type="file" onChange={onFileChange} />
        <br />
        <input
          type="text"
          placeholder="Save File Name"
          name="title"
          value={saveFile.title}
          onChange={onChange}
        />
        <br />
        <select name="gameID" value={saveFile.gameID} onChange={onGameChange}>
          <option value="">Select a Game</option>
          {games.map(game => (
            <option key={game._id} value={game._id}>{game.title}</option>
          ))}
        </select>
        <br />
        <select
          name="platformID"
          value={saveFile.platformID}
          onChange={onChange}
          disabled={!saveFile.gameID}
        >
          <option value="">Select a Platform</option>
          {platforms.map((platformID) => (
            <option key={platformID} value={platformID}>
              {getPlatformName(platformID) || `Unknown Platform (${platformID})`}
            </option>
          ))}
        </select>
        <br />
        <textarea
          placeholder="Description"
          name="description"
          value={saveFile.description}
          onChange={onChange}
        ></textarea>
        <br />
        <button type="submit">Submit</button>
      </form>
      {message && <p>{message}</p>}

    </div>
  );
};

export default UploadSave;