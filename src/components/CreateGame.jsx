import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateGame = (props) => {
  const navigate = useNavigate();

  const [game, setGame] = useState({
    name: "",
    platformsID: "",
    savePathID: "",
  });

  /*funcion para realizar cuando cambia el valor de los inputs */
  const onChange = (e) => {
    setGame({ ...game, [e.target.name]: e.target.value });
  };
/*funcion a realizar para cuando se pulsa el boton de añadir juego */
  const onSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:8082/api/games", game)
      .then((res) => {
        setGame({
          name: "",
          platformsID: "",
          savePathID: "",
        });
        // Push to /
        navigate("/");
      })
      .catch((err) => {
        console.log("Error in CreateGame!");
      });
  };

  return (
    <div>
      <h2>Add Game to Database</h2>
      <br></br>
      {/* formulario, esto es donde se mete el input 
      se le indica que la funcion a realizar cuando se hace submit sea la de arriba
      se le añade un input y un espacio en blanco para cada elem
        los inputs llevan dentro el valor que van a sustituir en la bbdd*/}
      <form noValidate onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Title of the Game"
          name="name"
          value={game.name}
          onChange={onChange}
        />
        <br />
        <input
          type="text"
          placeholder="Platform"
          name="platformsID"
          value={game.platformsID}
          onChange={onChange}
        />
        <br />
        <input
          type="text"
          placeholder="Save path"
          name="savePathID"
          value={game.savePathID}
          onChange={onChange}
        />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateGame;