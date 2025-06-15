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
  const { user: loggedUser, setUser } = useContext(UserContext);

  const [searchType, setSearchType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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
    <div className="layout">
      <header className="navbar">
        <nav className="nav-content">
          <div className="left">
            <Link to="/">
              <img src={`${config.paths.assetsFolder}/logo.png`} alt="Logo" className="logo"
                style={{ width: "60px", height: "60px", objectFit: "cover" }}
              />
            </Link>
          </div>

          <div className="center">
            <form className="search-bar" onSubmit={handleSearch}>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="games">Games</option>
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

          <div className="right d-flex align-items-center">
            {loggedUser ? (
              <>
                <Link to="/upload" className="me-3">Upload save</Link>

                <div className="dropdown">
                  <button
                    className="btn btn-secondary dropdown-toggle"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={`${config.connection}${loggedUser.pfp}`}
                      alt="Profile picture"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px", objectFit: "cover", marginRight: "10px" }}
                    />
                    {loggedUser.userName || loggedUser.Alias || "Account"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><Link className="dropdown-item" to={`/u/${loggedUser.userName}`}>User profile</Link></li>
                    <li><Link className="dropdown-item" to="/user-area">User area</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout} style={{ color: "var(--color-text-alt)" }}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <Link to="/login">Log in</Link>
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
        <p>© 2025 Game Save Database. Universidad Complutense de Madrid. Jorge Bello Martín - Eva Lucas Leiro.</p>
      </footer>
    </div>
  );
};

export default Layout;
