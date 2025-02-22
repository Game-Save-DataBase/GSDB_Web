// Layout.jsx
import React, {useState, useEffect} from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
    
    const [searchType, setSearchType] = useState("games");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = searchType === "games" 
                    ? "http://localhost:8082/api/games"
                    : "http://localhost:8082/api/savedatas";
                
                const response = await axios.get(url);
                setData(response.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        
        fetchData();
    }, [searchType]);

    const handleSearch = (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const filteredResults = data.filter(item => 
            searchType === "games"
                ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
                : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setSearchResults(filteredResults);
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
                    </ul>

                </nav>

            </header>

            {/* Zona izquierda */}
            <aside className="left-sidebar">
                <h2>Categorias</h2>
                <ul>
                    <li><a href="#">Categoria 1</a></li>
                    <li><a href="#">Categoria 2</a></li>
                </ul>
            </aside>

            {/* Zona central (contenedor para las paginas) */}
            <main className="main-content">
                {children} {/* Aqui renderizaremos el contenido de la pagina actual */}
                {searchResults.length > 0 && (
                    <div className="search-results">
                        <h3>Resultados de búsqueda:</h3>
                        <ul>
                            {searchResults.map((result, index) => (
                                <li key={index}>{searchType === "games" ? result.name : result.title}</li>
                            ))}
                        </ul>
                    </div>
                )}                
            </main>

            {/* Zona derecha */}
            <aside className="right-sidebar">
                <h2>Recomendaciones</h2>
                <p>Juego destacado del mes</p>
            </aside>


            {/* Zona inferior */}
            <footer className="bottom-bar">
                <p>© 2024 Game Save Database. Universidad Complutense de Madrid. Jorge Bello Martín - Eva Lucas Leiro.</p>
            </footer>
        </div>


    );
};

export default Layout;
