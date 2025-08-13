import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import config from '../../utils/config.js';
import api from '../../utils/interceptor';
import '../../styles/misc/Home.scss';

function formatIfDate(value) {
    const date = new Date(value);
    if (!isNaN(date)) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return value;
}
function Home() {
    const [index, setIndex] = useState(0);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
        // Juegos con más saves? con saves más recientes?
        const fetchGames = async () => {
            try {
                setLoading(true);
                const res = await api.get(`${config.api.games}?limit=5&offset=0`);
                const data = Array.isArray(res.data) ? res.data : [res.data];
                const processedGames = data.map((game) => ({
                    ...game,
                    url: `/g/${game.slug}`,
                }));

                setGames(processedGames);
            } catch (err) {
                console.error("Error fetching games", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    return (
        <div>
            <h1>Welcome to Game Save DataBase</h1>
            Use the search bar or browse the <Link to='/catalog'> GSDB Catalog</Link>

            <h3 className="carousel-title">Most Popular Games</h3>
            {loading ? (
                <p>Loading carousel...</p>
            ) : (

                <Carousel activeIndex={index} onSelect={handleSelect}>
                    {games.map((game) => (
                        <Carousel.Item key={game.gameID}>
                            {/* <ExampleCarouselImage text="First slide" /> */}
                            <img
                                className="carousel-bg"
                                src={game.screenshot || `${config.api.assets}/defaults/banner`}
                                alt={game.title}
                            />
                            <div className="carousel-custom-content">
                                <div className="carousel-left">
                                    <h3>
                                        <Link to={game.url} className="game-link">
                                            {game.title}
                                        </Link>
                                    </h3>
                                    <p className="release-date">
                                        Release Date: {formatIfDate(game.release_date || 'N/A')}
                                    </p>
                                </div>
                                <div className="carousel-right">
                                    <img
                                        className="game-cover"
                                        src={game.cover}
                                        alt={`${game.title} cover`}
                                    />
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}

            <div className="games-grid-columns">
                <div className="games-column">
                    <h3 className="column-title">Column 1</h3>
                    {games.map((game) => (
                        <div className="game-card" key={game.gameID}>
                            <img
                                src={game.cover || `${config.api.assets}/defaults/banner`}
                                alt={game.title}
                                className="game-card-img"
                            />
                            <div className="game-card-content">
                                <h4 className="game-card-title">
                                    <Link to={game.url}>{game.title}</Link>
                                </h4>
                                <p className="game-card-date">
                                    Release Date: {formatIfDate(game.release_date || 'N/A')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="games-column">
                    <h3 className="column-title">Column 2</h3>
                    {games.map((game) => (
                        <div className="game-card" key={game.gameID}>
                            <img
                                src={game.cover || `${config.api.assets}/defaults/banner`}
                                alt={game.title}
                                className="game-card-img"
                            />
                            <div className="game-card-content">
                                <h4 className="game-card-title">
                                    <Link to={game.url}>{game.title}</Link>
                                </h4>
                                <p className="game-card-date">
                                    Release Date: {formatIfDate(game.release_date || 'N/A')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="games-column">
                    <h3 className="column-title">Column 3</h3>
                    {games.map((game) => (
                        <div className="game-card" key={game.gameID}>
                            <img
                                src={game.cover || `${config.api.assets}/defaults/banner`}
                                alt={game.title}
                                className="game-card-img"
                            />
                            <div className="game-card-content">
                                <h4 className="game-card-title">
                                    <Link to={game.url}>{game.title}</Link>
                                </h4>
                                <p className="game-card-date">
                                    Release Date: {formatIfDate(game.release_date || 'N/A')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
}

export default Home;
