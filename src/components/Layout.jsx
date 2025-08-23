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
import UserCertificateBadge from "./utils/UserCertificateBadge.jsx";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const { user: loggedUser, setUser } = useContext(UserContext);
  const { isBlocked } = useContext(LoadingContext);
  const location = useLocation();
  const [searchType, setSearchType] = useState("games");
  const [searchInput, setSearchInput] = useState("");
  const [options, setOptions] = useState([]);
  const debounceRef = useRef(null); // para controlar el temporizador
  const [loading, setLoading] = useState(false);
  const [platforms, setPlatforms] = useState([]);

  const handleLogout = async () => {
    try {
      await api.get(`${config.api.auth}/logout`);
      setUser(null);
      window.location.reload(); // recarga la página actual
    } catch (error) {
      console.error("Error cerrando sesión", error);
    }
  };
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await api.get(`${config.api.platforms}?limit=500`);
        const data = Array.isArray(res.data) ? res.data : [res.data];
        const platformsFormatted = data.map((p) => ({
          value: p.platformID?.toString() ?? "",
          label: p.name ?? "",
          abbreviation: p.abbreviation ?? "",
        }));
        setPlatforms(platformsFormatted);
      } catch (err) {
        console.error("Error fetching platforms", err);
      }
    };
    fetchPlatforms();
  }, []);

  const fetchResults = async () => {
    if (!searchInput) return;
    setLoading(true);
    try {
      let endpoint = "";
      switch (searchType) {
        case "save data":
          endpoint = `${config.api.savedatas}/search?fast=true&q=${encodeURIComponent(searchInput)}&limit=10&offset=0`;
          break;
        case "games":
          endpoint = `${config.api.games}/search?fast=true&q=${encodeURIComponent(searchInput)}&limit=10&offset=0`;
          break;
        case "users":
          endpoint = `${config.api.users}/search?fast=true&q=${encodeURIComponent(searchInput)}&limit=10&offset=0`;
          break;
        default:
          setLoading(false);
          return;
      }
      const res = await api.get(endpoint);
      let data = res.data;
      if (!Array.isArray(data)) data = [data];
      if (!data || data.length === 0) {
        setOptions([]);
        return;
      }
      let formatted;
      if (searchType === "save data") {
        // Filtrar saves inválidos o vacíos (sin gameID)
        const validSaves = data.filter(save => save && save.gameID);

        const savesWithGame = await Promise.all(
          validSaves.map(async (save) => {
            try {
              const gameRes = await api.get(`${config.api.games}?gameID=${save.gameID}&complete=false&external=false`);
              const game = gameRes.data;

              const platform = platforms.find(p => p.value === save.platformID?.toString());

              return {
                id: save.saveID,
                label: save.title,
                gameTitle: game?.title || "Unknown game",
                platformAbbr: platform?.abbreviation || "",
              };
            } catch (err) {
              return {
                id: save.saveID,
                label: save.title,
                gameTitle: "Unknown game",
                platformAbbr: "",
              };
            }
          })
        );

        formatted = savesWithGame;
      }
      else if (searchType === "games") {
        formatted = data.map(item => {
          const gamePlatforms = item.platformID
            ? item.platformID
              .map(pid => platforms.find(p => p.value === pid.toString()))
              .filter(Boolean)
            : [];
          return {
            id: item.gameID,
            label: item.title,
            slug: item.slug,
            platforms: gamePlatforms
          };
        });
      } else if (searchType === "users") {
        formatted = data.map(item => ({
          id: item.userID,
          label: item.userName,
          alias: item.alias ?? "",
          badge: item.admin ? "admin" : (item.verified ? "verified" : (item.trusted ? "trusted" : null))
        }));
      }

      console.log(formatted)
      setOptions(formatted);

    } catch (err) {
      console.error("Error obtaining results:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // if (!searchInput.trim()) return;
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
    let sinpt = searchInput
    setSearchInput("");
    setOptions([]);
    navigate(`/search?type=${typeParam}&q=${encodeURIComponent(sinpt)}`);
  };

  // Debounce: ejecuta la búsqueda 2s después de que el usuario deje de escribir
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchInput.trim().length > 0) {
      debounceRef.current = setTimeout(() => {
        fetchResults();
      }, 1000);
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
            <InputGroup style={{ width: '100%', maxWidth: '1200px', gap: '0.5rem' }}>
              <Typeahead
                id="search-bar"
                onInputChange={(text) => setSearchInput(text)}
                onChange={(selected) => {
                  if (selected.length > 0) {
                    if (searchType === "games") {
                      setSearchInput(selected[0].label);
                      navigate(`/g/${selected[0].slug}`);
                    } else if (searchType === "save data") {
                      setSearchInput(selected[0].label);
                      navigate(`/s/${selected[0].id}`);
                    } else if (searchType === "users") {
                      setSearchInput(selected[0].label);
                      navigate(`/u/${selected[0].label}`);
                    }
                    setOptions([]);
                    setSearchInput("");
                  }
                }}
                options={options}
                placeholder={`type ${searchType}...`}
                labelKey="label"
                minLength={1}
                isLoading={loading}
                style={{ flexGrow: 1, minWidth: 0, fontSize: "0.85rem" }}
                filterBy={(option, props) => {
                  const field = option[props.labelKey];
                  return typeof field === "string" && field.toLowerCase().includes(props.text.toLowerCase());
                }}
                selected={searchInput ? [{ label: searchInput }] : []}
                renderMenuItemChildren={(option) => {
                  if (searchType === "save data") {
                    return (
                      <div style={{ width: "100%" }}>
                        <strong>{option.label}</strong>{" "}
                        <small style={{ color: "#666", fontSize: "0.75rem" }}>
                          - {option.gameTitle} [{option.platformAbbr}]
                        </small>
                      </div>
                    );
                  }
                  else if (searchType === "games") {
                    return (
                      <div
                        style={{
                          display: "inline",
                          whiteSpace: "normal",
                          overflowWrap: "break-word",
                        }}
                      >
                        <strong>{option.label}</strong>{" "}
                        {option.platforms && option.platforms.length > 0 && (
                          <small
                            style={{
                              color: "#666",
                              fontSize: "0.85em",
                              display: "inline",
                            }}
                          >
                            [{option.platforms.map(p => p.abbreviation).join(", ")}]
                          </small>
                        )}
                      </div>
                    );
                  }
                  else if (searchType === "users") {
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
                        <img
                          src={`${config.api.assets}/user/${option.id}/pfp?${Date.now()}`}
                          alt={`@${option.label}'s profile`}
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `${config.api.assets}/defaults/pfp`;
                          }}
                        />
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flexGrow: 1 }}>
                          {option.alias && option.alias.trim() !== "" ? (
                            <>
                              <strong>{option.alias}</strong> — @{option.label}
                            </>
                          ) : (
                            <><strong>@{option.label}</strong></>
                          )}
                        </div>
                        <UserCertificateBadge badgeType={option.badge} disableTooltip={true} />
                      </div>
                    );
                  }
                }}
              />
              <div className="d-flex align-items-center">
                <Form.Check
                  inline
                  type="radio"
                  label="Save Data"
                  name="searchType"
                  id="search-save-data"
                  value="save data"
                  checked={searchType === "save data"}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    // setOptions([]);
                    // setSearchInput("");
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Games"
                  name="searchType"
                  id="search-games"
                  value="games"
                  checked={searchType === "games"}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    // setOptions([]);
                    // setSearchInput("");
                  }}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Users"
                  name="searchType"
                  id="search-users"
                  value="users"
                  checked={searchType === "users"}
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    // setOptions([]);
                    // setSearchInput("");
                  }}
                />
              </div>
              <Button variant="primary" onClick={handleSearch} style={{ flexShrink: 0 }}>
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
                        e.target.src = `${config.api.assets}/defaults/pfp`;
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
          <li><Link to="/catalog">Game Catalog</Link></li>
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
    </div >
  );
};

export default Layout;
