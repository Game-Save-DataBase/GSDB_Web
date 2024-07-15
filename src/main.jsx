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
// Routes
const router = createBrowserRouter([
  { path: "/", element: <ShowBookList /> },
  { path: "/create-book", element: <CreateBook /> },
  { path: "/show-book/:id", element: <ShowBookDetails /> },
  { path: "/edit-book/:id", element: <UpdateBookInfo /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
