import React from 'react'
import ReactDOM from 'react-dom/client'
import { Route, Routes, unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import history from './utils/history.js';

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";


// Components imports
import { UserProvider } from "./contexts/UserContext";
import { LoadingProvider } from './contexts/LoadingContext';
import Layout from "./components/Layout.jsx"; /*contenedor principal */
import Test from "./components/test.jsx";
//contenido principal
import ShowGameDetails from "./components/main/ShowGameDetails.jsx";
import ShowSaveDetails from "./components/main/ShowSaveDetails.jsx";
import Catalog from "./components/main/Catalog.jsx"

//user related
import UploadSave from "./components/user/UploadSave.jsx";
import Login from "./components/user/Login.jsx";
import UserArea from "./components/user/UserArea.jsx";
import UserProfile from "./components/user/UserProfile.jsx";
//misc
import Home from "./components/misc/Home.jsx"
import About from "./components/misc/About.jsx"
import FAQ from "./components/misc/FAQ.jsx"
import NotFound from "./components/misc/NotFound.jsx"

// Routes
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HistoryRouter history={history}>
      <LoadingProvider>
        <UserProvider>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
            <Route path="/about" element={<Layout><About /></Layout>} />
            <Route path="/faq" element={<Layout><FAQ /></Layout>} />
            <Route path="/g/:slug" element={<Layout><ShowGameDetails /></Layout>} />
            <Route path="/s/:id" element={<Layout><ShowSaveDetails /></Layout>} />
            <Route path="/upload" element={<Layout><UploadSave /></Layout>} />
            <Route path="/login" element={<Layout><Login /></Layout>} />
            <Route path="/user-area" element={<Layout><UserArea /></Layout>} />
            <Route path="/u/:userNameParam" element={<Layout><UserProfile /></Layout>} />
            <Route path="/test" element={<Layout><Test /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </UserProvider>
      </LoadingProvider>
    </HistoryRouter>
  </React.StrictMode>,
)