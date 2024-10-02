// Layout.jsx
import React from "react";
import { Link } from "react-router-dom";
import './Layout.css'; // Aquí colocaremos el CSS para el layout

const Layout = ({ children }) => {
    return (
        <div className="layout">
            {/* Zona superior: Barra de navegacion */}
            <header className="navbar">
                <nav>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/create-book">Crear Libro</Link></li>
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
            </main>

            {/* Zona derecha */}
            <aside className="right-sidebar">
                <h2>Recomendaciones</h2>
                <p>Libro destacado del mes</p>
            </aside>
        </div>
    );
};

export default Layout;
