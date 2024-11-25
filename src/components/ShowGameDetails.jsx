import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import '../styles/App.css';
import axios from 'axios';
//TODO: Hacer una llamada a IGDB para BUSCAR un juego que tenga el mismo valor que nuestro campo IGDBID.
function ShowGameDetails(props) {
  const [game, setGame] = useState({});
  const [saveFiles, setSaveFiles] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const gameResponse = await axios.get(`http://localhost:8082/api/games/${id}`);
        setGame(gameResponse.data);
      } catch (err) {
        console.log('Error from ShowGameDetails');
      }
    };//fetcjGameDetails

    const fetchSaveFiles = async() => {
      try {
        const saveFilesResponse = await axios.get(`http://localhost:8082/api/savedatas/game/${id}`);
        setSaveFiles(saveFilesResponse.data);
          } catch (err) {
        console.log('Error fetching game items');
      }
    };//fetchSaveFiles

    fetchGameDetails();
    fetchSaveFiles();   
    
    }, [id]);//useREffect

  return (
    <div className='ShowGameDetails'>
      {game && (
        <div className="card mt-4">
          <div className="card-body">
            <h1 className="card-title">{game.name}</h1>
            <img src={"https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Celeste_box_art_full.png/220px-Celeste_box_art_full.png"} 
            alt={game.title} className="img-fluid mb-3" />
            {/* <p className="card-text">{game.description}</p> */}
          </div>
        </div>
      )}

      <h2 className="mt-5">Available savedata</h2>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>#</th> 
            {/* <th>Ruta de archivo</th> */}
            <th>Descripción</th>
            <th>Fecha de subida</th>
            {/* <th>Privado</th> */}
          </tr>
        </thead>
        <tbody>
          {saveFiles.length > 0 ? (
            saveFiles.map((saveFile, index) => (
              <tr key={saveFile._id}>
                {/* <td>{index + 1}</td> */}
                {/* <td>{saveFile.file}</td> */}
                <Link to = {`/show-file/${saveFile._id}`}>{index + 1}</Link>
                <td>{saveFile.description}</td>
                <td>{new Date(saveFile.postedDate).toLocaleDateString()}</td>
                {/* <td>{saveFile.private ? 'Sí' : 'No'}</td> */}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">No hay archivos de guardado disponibles para este juego.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    // <div className='ShowGameDetails'>
    //   <div className='container'>
    //     <div className='row'>
    //       <div className='col-md-10 m-auto'>
    //         <br /> <br />
    //         <Link to='/' className='btn btn-outline-warning float-left'>
    //           Show Game List
    //         </Link>
    //       </div>
    //       <br />
    //       <div className='col-md-8 m-auto'>
    //         <h1 className='display-4 text-center'>Game's Record</h1>
    //         <p className='lead text-center'>View Game's Info</p>
    //         <hr /> <br />
    //       </div>
    //       <div className='col-md-10 m-auto'>{GameItem}</div>
    //       <div className='col-md-6 m-auto'>
    //         <button
    //           type='button'
    //           className='btn btn-outline-danger btn-lg btn-block'
    //           onClick={() => {
    //             onDeleteClick(game._id);
    //           }}
    //         >
    //           Delete Game
    //         </button>
    //       </div>
    //       <div className='col-md-6 m-auto'>
    //         <Link
    //           to={`/edit-game/${game._id}`}
    //           className='btn btn-outline-info btn-lg btn-block'
    //         >
    //           Edit Game
    //         </Link>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}

export default ShowGameDetails;