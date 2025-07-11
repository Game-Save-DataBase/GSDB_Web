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

  const [errorMessage, setErrorMessage] = useState("");


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
                      src={`${config.api.assets}/user/${loggedUser.userID}/pfp`}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px", objectFit: "cover", marginRight: "10px" }}
                      onError={(e) => {
                        console.log(`${config.api.assets}/user/${loggedUser.userID}`)
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
