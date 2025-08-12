import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import config from '../../utils/config.js';
import api from '../../utils/interceptor';
import '../../styles/misc/Home.scss';


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
            {loading ? (
                <p>Loading carousel...</p>
            ) : (
                <Carousel activeIndex={index} onSelect={handleSelect}>
                    {games.map((game) => (
                        <Carousel.Item key={game.gameID}>
                            {/* <ExampleCarouselImage text="First slide" /> */}
                            <img
                                className="d-block w-100"
                                src={game.screenshot || `${config.api.assets}/defaults/banner`}
                                alt={game.title}
                            />
                            <Carousel.Caption className="carousel-caption-custom">
                                <h3><Link to={game.url} className="game-link">
                                    {game.title}
                                </Link></h3>
                                {/* {game.release_date && (
                                    <p>Released: {new Date(game.release_date).toLocaleDateString()}</p>
                                )} */}
                            </Carousel.Caption>
                        </Carousel.Item>
                    ))}
                </Carousel>
            )}

        </div>
    );
}

export default Home;
