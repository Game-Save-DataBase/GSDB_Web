import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function UpdateGameInfo(props) {
  const [game, setGame] = useState({
    name: '',
    platformsID: '',
    savePathID: '',
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8082/api/games/${id}`)
      .then((res) => {
        setGame({
          name: res.data.name,
          platformsID: res.data.platformsID,
          savePathID: res.data.savePathID,
        });
      })
      .catch((err) => {
        console.log('Error from UpdateGameInfo');
      });
  }, [id]);

  const onChange = (e) => {
    setGame({ ...game, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const data = {
      name: game.name,
      platformsID: game.platformsID,
      savePathID: game.savePathID,
    };

    axios
      .put(`http://localhost:8082/api/games/${id}`, data)
      .then((res) => {
        navigate(`/show-game/${id}`);
      })
      .catch((err) => {
        console.log('Error in UpdateGameInfo!');
      });
  };

  return (
    <div className='UpdateGameInfo'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-8 m-auto'>
            <br />
            <Link to='/' className='btn btn-outline-warning float-left'>
              Show Game List
            </Link>
          </div>
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Edit Game</h1>
            <p className='lead text-center'>Update Game's Info</p>
          </div>
        </div>

        <div className='col-md-8 m-auto'>
          <form noValidate onSubmit={onSubmit}>
            <div className='form-group'>
              <label htmlFor='title'>Title</label>
              <input
                type='text'
                placeholder='Title of the Game'
                name='name'
                className='form-control'
                value={game.name}
                onChange={onChange}
              />
            </div>
            <br />

            <div className='form-group'>
              <label htmlFor='platform'>Platform</label>
              <input
                type='text'
                placeholder='Platform'
                name='platformsID'
                className='form-control'
                value={game.platformsID}
                onChange={onChange}
              />
            </div>
            <br />
            <div className='form-group'>
              <label htmlFor='savepath'>Save Path</label>
              <input
                type='text'
                placeholder='Platform'
                name='savePathID'
                className='form-control'
                value={game.savePathID}
                onChange={onChange}
              />
            </div>

            <button
              type='submit'
              className='btn btn-outline-info btn-lg btn-block'
            >
              Update Game
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UpdateGameInfo;