import config from "../utils/config";
import React, { useState, useContext, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/interceptor";
import { UserContext } from "../contexts/UserContext";
import NotificationBoard from "../components/user/NotificationBoard";
import '../styles/Layout.scss';
import '../styles/Common.scss';

import { LoadingContext } from "../contexts/LoadingContext";
import { Spinner } from "reactstrap";
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { Form, InputGroup, Button } from "react-bootstrap";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user: loggedUser, setUser } = useContext(UserContext);
  const { isBlocked } = useContext(LoadingContext);
  const location = useLocation();
  const [searchType, setSearchType] = useState("save data");
  const [searchInput, setSearchInput] = useState(""); // ✅ ahora está definido
  const [options, setOptions] = useState([]);
  const debounceRef = useRef(null); // para controlar el temporizador

  const handleLogout = async () => {
    try {
      await api.get(`${config.api.auth}/logout`);
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };

  const fetchResults = async () => {
    if (!searchInput) return;
    try {
      let endpoint = "";
      switch (searchType) {
        case "save data":
          endpoint = `${config.api.savedatas}/search?q=${encodeURIComponent(searchInput)}&limit=10`;
          break;
        case "games":
          endpoint = `${config.api.games}/search?q=${encodeURIComponent(searchInput)}&limit=10`;
          break;
        case "users":
          endpoint = `${config.api.users}/search?q=${encodeURIComponent(searchInput)}&limit=10`;
          break;
        default:
          return;
      }
      console.log(endpoint)
      let data = await api.get(endpoint);
      if (!Array.isArray(data)) data = [data]
      const formatted = data.map(item => ({
        id: item.gameID || item.userID || item.saveID,
        label: item.title || item.userName || "unknown"
      }));

      setOptions(formatted);
    } catch (err) {
      console.error("Error obtaining results:", err);
    }
  };

  const handleSearch = () => {
    if (!searchInput.trim()) return;

    // Mapear tipo a letra
    let typeParam = "";
    switch (searchType) {
      case "save data":
        typeParam = "s";
        break;
      case "games":
        typeParam = "g";
        break;
      case "users":
        typeParam = "u";
        break;
      default:
        typeParam = "s";
    }

    navigate(`/search?type=${typeParam}&q=${encodeURIComponent(searchInput)}`);
  };

  // Debounce: ejecuta la búsqueda 2s después de que el usuario deje de escribir
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchInput.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchResults();
      }, 2000);
    }
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, searchType]);

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

          <div className="center d-flex align-items-center">
            <InputGroup>
              <Form.Select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                style={{ maxWidth: "140px" }}
              >
                <option value="save data">Save Data</option>
                <option value="games">Games</option>
                <option value="users">Users</option>
              </Form.Select>

              <Typeahead
                id="search-bar"
                onInputChange={(text) => setSearchInput(text)}
                onChange={(selected) => {
                  if (selected.length > 0) {
                    setSearchInput(selected[0].label);
                  }
                }}
                options={options}
                placeholder={`Buscar en ${searchType}...`}
                labelKey="label"
                minLength={2}
              />

              <Button variant="primary" onClick={handleSearch}>
                Search
              </Button>
            </InputGroup>
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
                      src={`${config.api.assets}/user/${loggedUser.userID}/pfp?${Date.now()}`}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px", objectFit: "cover", marginRight: "10px" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `${config.connection}${config.paths.pfp_default}`;
                      }}
                    />
                    {loggedUser.userName || loggedUser.Alias || "Account"}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><Link className="dropdown-item" to={`/u/${loggedUser.userName}`}>User area</Link></li>
                    <li><Link className="dropdown-item" to="/user-area">Edit profile</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item" onClick={handleLogout}>Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <Link to="/login" state={{ from: location }}>Log in</Link>
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

      <main className="main-content position-relative">
        {isBlocked && (
          <div className="blocking-overlay-inside">
            <Spinner color="light" />
          </div>
        )}
        {children}
      </main>

      <aside className="right-sidebar">
        <NotificationBoard />
      </aside>

      <footer className="bottom-bar">
        <p>© 2025 Game Save Database. UCM. Jorge Bello Martín - Eva Lucas Leiro.</p>
      </footer>
    </div>
  );
};

export default Layout;
