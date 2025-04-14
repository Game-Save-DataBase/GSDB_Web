import React from 'react'
import ReactDOM from 'react-dom/client'
import {Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from './utils/history.js';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";


// Components imports
import Layout from "./components/Layout.jsx"; /*contenedor principal */
import CreateGame from "./components/CreateGame.jsx"; //esta de aqui no deberia existir. borrarla cuando se integre del todo la web
import ShowGameList from "./components/ShowGameList.jsx";
import ShowGameDetails from "./components/ShowGameDetails.jsx";
import ShowSaveDetails from "./components/ShowSaveDetails.jsx";
import UploadSave from "./components/UploadSave.jsx";
import SearchResults from "./components/SearchResults.jsx";
import Login from "./components/Login.jsx";
import Test from "./components/test.jsx";

// Routes
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HistoryRouter history={history}>
      <Routes>
        <Route path="/" element={<Layout><ShowGameList /></Layout>} />
        <Route path="/create-Game" element={<Layout><CreateGame /></Layout>} />
        <Route path="/game/:id" element={<Layout><ShowGameDetails /></Layout>} />
        <Route path="/save/:id" element={<Layout><ShowSaveDetails /></Layout>} />
        <Route path="/upload-save" element={<Layout><UploadSave /></Layout>} />
        <Route path="/search" element={<Layout><SearchResults /></Layout>} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/test" element={<Layout><Test /></Layout>} /> */}
      </Routes>
    </HistoryRouter>
  </React.StrictMode>,
)