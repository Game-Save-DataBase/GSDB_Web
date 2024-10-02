import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'

// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";


// Components imports
import CreateBook from "./components/CreateBook.jsx";
import ShowBookList from "./components/ShowBookList.jsx";
import ShowBookDetails from "./components/ShowBookDetails.jsx";
import UpdateBookInfo from "./components/UpdateBookInfo.jsx";

import Layout from "./components/Layout.jsx";


// Routes
//const router = createBrowserRouter([
//  { path: "/", element: <ShowBookList /> },
//  { path: "/create-book", element: <CreateBook /> },
//  { path: "/show-book/:id", element: <ShowBookDetails /> },
//  { path: "/edit-book/:id", element: <UpdateBookInfo /> },
//]);

const router = createBrowserRouter([
    {path: "/",element: (<Layout><ShowBookList /></Layout>),},
    {path: "/create-book", element: (<Layout><CreateBook /></Layout>),},
    {path: "/show-book/:id",element: (<Layout><ShowBookDetails /></Layout>),},
    {path: "/edit-book/:id",element: (<Layout><UpdateBookInfo /></Layout>),},
]);


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
