import config from "../utils/config";
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/interceptor";
import { UserContext } from "../contexts/UserContext";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  return (
    // to do añadir a la classname layout dinamicamente un tema segun la configuracion escogida por el usuario
    <div className="layout">
      <header className="navbar">
        <nav className="nav-content">
          <div className="left">
            <img src="/logo.png" alt="Logo" className="logo" />
          </div>

          <div className="center">
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
            </form>
            {errorMessage && <p className="error">{errorMessage}</p>}
          </div>

          <div className="right">
            {user ? (
              <>
                <Link to="/user-area">Área de usuario</Link>
                <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
              </>
            ) : (
              <Link to="/login">Identifícate</Link>
            )}
          </div>
        </nav>
      </header>

      <aside className="left-sidebar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/catalog">Catalog</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/faq">FAQ</Link></li>
        </ul>

      </aside>

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
