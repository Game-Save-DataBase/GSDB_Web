import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

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
import Prueba from "./components/test.jsx";



// Routes
const router = createBrowserRouter([
    {path: "/",element: (<Layout><ShowGameList /></Layout>),},
    {path: "/create-Game", element: (<Layout><CreateGame /></Layout>),}, //esta de aqui no deberia existir. borrarla cuando se integre del todo la web
    {path: "/game/:id",element: (<Layout><ShowGameDetails /></Layout>),},
    {path: "/save/:id",element: (<Layout><ShowSaveDetails /></Layout>),},
    {path: "/prueba",element: (<Layout><Prueba /></Layout>),},

]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
