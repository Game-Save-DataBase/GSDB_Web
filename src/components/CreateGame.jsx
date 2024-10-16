import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateGame = (props) => {
  const navigate = useNavigate();

  const [game, setGame] = useState({
    name: "",
    platformsID: "",
    savePathID: "",
  });

  const onChange = (e) => {
    setGame({ ...game, [e.target.name]: e.target.value });
  };

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
    <div className="CreateGame">
      <div className="container">
        <div className="row">
          <div className="col-md-8 m-auto">
            <br />
            <Link to="/" className="btn btn-outline-warning float-left">
              Show Game List
            </Link>
          </div>
          <div className="col-md-10 m-auto">
            <h1 className="display-4 text-center">Add Game</h1>
            <p className="lead text-center">Create new game</p>
            <form noValidate onSubmit={onSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Title of the Game"
                  name="name"
                  className="form-control"
                  value={game.name}
                  onChange={onChange}
                />
              </div>
              <br />
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Platform"
                  name="platformsID"
                  className="form-control"
                  value={game.platformsID}
                  onChange={onChange}
                />
              </div>
              <br />
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Save path"
                  name="savePathID"
                  className="form-control"
                  value={game.savePathID}
                  onChange={onChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-outline-warning btn-block mt-4 mb-4 w-100"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;