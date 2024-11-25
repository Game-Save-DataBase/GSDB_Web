import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";


// Components imports
import CreateGame from "./components/CreateGame.jsx";
import ShowGameList from "./components/ShowGameList.jsx";
import ShowGameDetails from "./components/ShowGameDetails.jsx";
import UpdateGameInfo from "./components/UpdateGameInfo.jsx";

import Layout from "./components/Layout.jsx";


// Routes
const router = createBrowserRouter([
    {path: "/",element: (<Layout><ShowGameList /></Layout>),},
    {path: "/create-Game", element: (<Layout><CreateGame /></Layout>),},
    {path: "/game/:id",element: (<Layout><ShowGameDetails /></Layout>),},
    {path: "/edit-Game/:id",element: (<Layout><UpdateGameInfo /></Layout>),},
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
