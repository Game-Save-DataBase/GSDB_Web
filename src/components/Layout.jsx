// Layout.jsx
import config from "../utils/config";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
    const navigate = useNavigate();

    const [searchType, setSearchType] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = searchType === "games"
                    ? `${config.api.games}`
                    : `${config.api.savedatas}`;

                const response = await axios.get(url);
                setSearchType(response.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };

        fetchData();
    }, [searchType]);

    const handleSearch = (e) => {
        e.preventDefault();

        if (searchQuery.trim().length < 3) {
            setErrorMessage("La búsqueda debe tener al menos 3 caracteres.");
            setTimeout(() => setErrorMessage(""), 3000); // Borra el mensaje tras 3s
            return;
        }


        // Redirigir a la nueva página de búsqueda con los parámetros en la URL
        navigate(`/search?query=${searchQuery}&type=${searchType}`);
    };
    return (
        <div className="layout">
            {/* Zona superior: Barra de navegacion */}
            <header className="navbar">
                <nav>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/create-game">Crear Juego</Link></li>
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
                        {/* Mensaje de error si la búsqueda es muy corta */}
                        {errorMessage && <p style={{ color: "red", marginTop: "5px" }}>{errorMessage}</p>}

                    </ul>

                </nav>

            </header>

            {/* Zona izquierda */}
            <aside className="left-sidebar">
                {/* <h2>Categorias</h2>
                <ul>
                    <li><a href="#">Categoria 1</a></li>
                    <li><a href="#">Categoria 2</a></li>
                </ul> */}
            </aside>

            {/* Zona central (contenedor para las paginas) */}
            <main className="main-content">
                {children} {/* Aqui renderizaremos el contenido de la pagina actual */}
            </main>

            {/* Zona derecha */}
            <aside className="right-sidebar">
                {/* <h2>Recomendaciones</h2>
                <p>Juego destacado del mes</p> */}
            </aside>


            {/* Zona inferior */}
            <footer className="bottom-bar">
                <p>© 2024 Game Save Database. Universidad Complutense de Madrid. Jorge Bello Martín - Eva Lucas Leiro.</p>
            </footer>
        </div>


    );
};

export default Layout;
