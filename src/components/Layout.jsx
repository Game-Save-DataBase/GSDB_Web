import config from "../utils/config";
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../utils/interceptor";
import { UserContext } from "../contexts/UserContext";
import NotificationBoard from "../components/user/NotificationBoard";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user: loggedUser, setUser } = useContext(UserContext);

  const [searchType, setSearchType] = useState("juegos");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch de dataset al cambiar tipo
  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (searchType === "juegos") {
          response = await api.get("/api/games");
        } else if (searchType === "savedatas") {
          response = await api.get("/api/savedatas");
        } else {
          response = await api.get("/api/users");
        }
        setDataset(response.data instanceof Array ? response.data : [response.data]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setDataset([]);
      }
    };
    fetchData();
  }, [searchType]);

  useEffect(() => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    let filtered = [];

    if (searchType === "juegos") {
      filtered = dataset.filter((item) => item.title?.toLowerCase().includes(query));
    } else if (searchType === "savedatas") {
      filtered = dataset.filter(
        (item) =>
          item.title?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    } else {
      filtered = dataset.filter(
        (item) =>
          item.userName?.toLowerCase().includes(query) ||
          item.Alias?.toLowerCase().includes(query)
      );
    }
    setSuggestions(filtered.slice(0, 5)); // máx 5 sugerencias
  }, [searchQuery, dataset]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim().length < 3) {
      setErrorMessage("La búsqueda debe tener al menos 3 caracteres.");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }
    navigate(`/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`);
  };

  const handleSelect = (item) => {
    if (searchType === "juegos") {
      navigate(`/game/${item._id || item.IGDB_ID}`);
    } else if (searchType === "savedatas") {
      navigate(`/save/${item._id}`);
    } else {
      navigate(`/u/${item.userName}`);
    }
    setSearchQuery("");
    setSuggestions([]);
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
            <form className="search-bar position-relative" onSubmit={handleSearch}>
              <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                <option value="juegos">Games</option>
                <option value="savedatas">Savedatas</option>
                <option value="usuarios">Users</option>
              </select>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {/* <button type="submit">🔍</button> */}
              {suggestions.length > 0 && (
                <ul className="typeahead-dropdown">
                  {suggestions.map((item, idx) => (
                    <li key={idx} onClick={() => handleSelect(item)}>
                      {searchType === "juegos" && item.title}
                      {searchType === "savedatas" && `${item.title} - ${item.description?.slice(0, 30)}`}
                      {searchType === "usuarios" && `${item.userName} (${item.Alias})`}
                    </li>
                  ))}
                </ul>
              )}
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
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px", objectFit: "cover", marginRight: "10px" }}
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
