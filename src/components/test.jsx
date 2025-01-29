import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Common.scss';

const prueba = (props) => {
  const navigate = useNavigate();

  const [saveFile, setSaveFile] = useState({
    name: "",
    gameID: "",
    platformID: "",
    description: "",
    newGameName: "",
  });
  const [gameExists, setGameExists] = useState(null);
  const [games, setGames] = useState([]);
  const [isNewGame, setIsNewGame] = useState(false);

  useEffect(() => {
    axios.get("http://localhost:8082/api/games")
      .then(response => setGames(response.data))
      .catch(error => console.log("Error fetching games", error));
  }, []);

  useEffect(() => {
    if (saveFile.gameID && saveFile.gameID !== "new") {
      axios.get(`http://localhost:8082/api/games/${saveFile.gameID}`)
        .then(response => setGameExists(true))
        .catch(error => setGameExists(false));
    }
  }, [saveFile.gameID]);

  const onChange = (e) => {
    setSaveFile({ ...saveFile, [e.target.name]: e.target.value });
  };

  const onGameChange = (e) => {
    const value = e.target.value;
    setIsNewGame(value === "new");
    setSaveFile({ ...saveFile, gameID: value, newGameName: "" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isNewGame && gameExists === false) {
      alert("Game does not exist! Please create it first.");
      return;
    }
    try {
      const payload = { ...saveFile };
      if (isNewGame) {
        const newGame = await axios.post("http://localhost:8082/api/games", { name: saveFile.newGameName });
        payload.gameID = newGame.data.id;
      }
      await axios.post("http://localhost:8082/api/savefiles", payload);
      setSaveFile({
        name: "",
        gameID: "",
        platformID: "",
        description: "",
        newGameName: "",
      });
      navigate("/");
    } catch (err) {
      console.log("Error in CreateSaveFile!", err);
    }
  };

  return (
    <div>
      <h2>Add Save File to Database</h2>
      <br></br>
      <form noValidate onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Save File Name"
          name="name"
          value={saveFile.name}
          onChange={onChange}
        />
        <br />
        <select name="gameID" value={saveFile.gameID} onChange={onGameChange}>
          <option value="">Select a Game</option>
          {games.map(game => (
            <option key={game.id} value={game.id}>{game.name}</option>
          ))}
          <option value="new">New Game</option>
        </select>
        {isNewGame && (
          <input
            type="text"
            placeholder="New Game Name"
            name="newGameName"
            value={saveFile.newGameName}
            onChange={onChange}
          />
        )}
        <br />
        <input
          type="text"
          placeholder="Platform"
          name="platformID"
          value={saveFile.platformID}
          onChange={onChange}
        />
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
    </div>
  );
};

export default prueba;
