import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../App.css';
import axios from 'axios';

function ShowGameDetails(props) {
  const [game, setGame] = useState({});

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://localhost:8082/api/games/${id}`)
      .then((res) => {
        setGame(res.data);
      })
      .catch((err) => {
        console.log('Error from ShowGameDetails');
      });
  }, [id]);

  const onDeleteClick = (id) => {
    axios
      .delete(`http://localhost:8082/api/games/${id}`)
      .then((res) => {
        navigate('/');
      })
      .catch((err) => {
        console.log('Error form ShowGameDetails_deleteClick');
      });
  };

  const GameItem = (
    <div>
      <table className='table table-hover table-dark'>
        <tbody>
          <tr>
            <th scope='row'>1</th>
            <td>Title</td>
            <td>{game.name}</td>
          </tr>
          <tr>
            <th scope='row'>2</th>
            <td>Platform</td>
            <td>{game.platformsID}</td>
          </tr>
          <tr>
            <th scope='row'>3</th>
            <td>Savepath</td>
            <td>{game.savePathID}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className='ShowGameDetails'>
      <div className='container'>
        <div className='row'>
          <div className='col-md-10 m-auto'>
            <br /> <br />
            <Link to='/' className='btn btn-outline-warning float-left'>
              Show Game List
            </Link>
          </div>
          <br />
          <div className='col-md-8 m-auto'>
            <h1 className='display-4 text-center'>Game's Record</h1>
            <p className='lead text-center'>View Game's Info</p>
            <hr /> <br />
          </div>
          <div className='col-md-10 m-auto'>{GameItem}</div>
          <div className='col-md-6 m-auto'>
            <button
              type='button'
              className='btn btn-outline-danger btn-lg btn-block'
              onClick={() => {
                onDeleteClick(game._id);
              }}
            >
              Delete Game
            </button>
          </div>
          <div className='col-md-6 m-auto'>
            <Link
              to={`/edit-game/${game._id}`}
              className='btn btn-outline-info btn-lg btn-block'
            >
              Edit Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShowGameDetails;