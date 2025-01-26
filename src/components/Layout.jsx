// Layout.jsx
import React from "react";
import { Link } from "react-router-dom";
import '../styles/Layout.scss';
import '../styles/Common.scss';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            {/* Zona superior: Barra de navegacion */}
            <header className="navbar">
                <nav>
                    <ul>
                        <li><Link to="/">Inicio</Link></li>
                        <li><Link to="/create-game">Crear Juego</Link></li>
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
