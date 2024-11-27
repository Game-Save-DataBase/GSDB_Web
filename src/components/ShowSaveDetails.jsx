import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Common.css';

function ShowSaveDetails(props) {
    //comentado por ahora por si peta, ya que esta pagina no hace na
//   const [saveFile, setSaveFiles] = useState([]);

//   const { id } = useParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchSaveFile = async () => {
//       /*lo mismo que arriba pero con los saves de cada juego */
//       try {
//         const saveFileResponse = await axios.get(`http://localhost:8082/api/savedatas/${id}`);
//         setSaveFiles(saveFileResponse.data);
//       } catch (err) {
//         console.log('Error fetching savedata');
//       }
//     };//fetchSaveFile

//     fetchSaveFile();

//   }, [id]);//useEffect

  return (
    <div>to do.... mostrar aqui la info del savedata, comentarios, etc.
    </div>    

  );
}

export default ShowSaveDetails;