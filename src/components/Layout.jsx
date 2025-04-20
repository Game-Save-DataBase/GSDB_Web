import config from "../utils/config";
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/interceptor";
import { UserContext } from "../contexts/UserContext";
import { LoadingContext } from "../contexts/LoadContext";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearPagesLoaded } = useContext(LoadingContext);
  const { user, setUser } = useContext(UserContext);

  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`${config.api.auth}/me`);
        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, [setUser]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) {
      setErrorMessage("La búsqueda debe tener al menos 3 caracteres.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    navigate(`/search?query=${searchQuery}&type=${searchType}`);
  };

  const handleLogout = async () => {
    try {
      await api.get(`${config.api.auth}/logout`);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };


  //location: al cambiar de pagina
  useEffect(() => {
    clearPagesLoaded();
  }, [location]);

  return (
    <div className="layout">
      <header className="navbar">
        <nav>
          <ul>
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/upload-save">Añadir Save</Link></li>

            <form className="search-bar" onSubmit={handleSearch}>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="games">Juegos</option>
                <option value="saves">Saves</option>
              </select>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">Buscar</button>
            </form>

            {errorMessage && <p style={{ color: "red", marginTop: "5px" }}>{errorMessage}</p>}

            {user ? (
              <>
                <li><Link to="/user-area">Área de usuario</Link></li>
                <li><button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button></li>
              </>
            ) : (
              <li><Link to="/login">Identifícate</Link></li>
            )}
          </ul>
        </nav>
      </header>

      <aside className="left-sidebar" />

      <main className="main-content">
          {children}
      </main>

      <aside className="right-sidebar" />

      <footer className="bottom-bar">
        <p>© 2024 Game Save Database. Universidad Complutense de Madrid. Jorge Bello Martín - Eva Lucas Leiro.</p>
      </footer>
    </div>
  );
};

export default Layout;
