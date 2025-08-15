import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import SafeImage from "../utils/SafeImage.jsx";
import config from '../../utils/config.js';
import api from '../../utils/interceptor';
import '../../styles/misc/Home.scss';
import { Spinner } from "reactstrap";

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

    const [recentSaves, setRecentSaves] = useState([]);
    const [popularSaves, setPopularSaves] = useState([]);
    const [downloadedSaves, setDownloadedSaves] = useState([]);
    const [loadingSaves, setLoadingSaves] = useState(true);

    const handleSelect = (selectedIndex) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
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

        const fetchSaveDatas = async () => {
            try {
                setLoadingSaves(true);
                const [recentRes, popularRes, downloadedRes] = await Promise.all([
                    api.get(`${config.api.savedatas}?limit=4&offset=0&sort[desc]=postedDate`),
                    api.get(`${config.api.savedatas}?limit=4&offset=0&sort[desc]=rating`),
                    api.get(`${config.api.savedatas}?limit=4&offset=0&sort[desc]=nDownloads`),
                ]);

                const recentResData = Array.isArray(recentRes.data) ? recentRes.data : [recentRes.data];
                const popularResData = Array.isArray(popularRes.data) ? popularRes.data : [popularRes.data];
                const downloadedResData = Array.isArray(downloadedRes.data) ? downloadedRes.data : [downloadedRes.data];

                const enrichSave = async (save) => {
                    try {
                        const gameResponse = await api.get(`${config.api.games}?gameID=${save.gameID}&complete=false&external=false`);
                        if (!gameResponse.data) throw ("No game fetched");
                        return {
                            ...save,
                            save_img: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                            save_img_error: gameResponse.data.cover || `${config.api.assets}/defaults/game-cover`,
                            link: `/s/${save.saveID}`,
                            game_name: gameResponse.data.title,
                            game_link: `/g/${gameResponse.data.slug}`
                        };
                    } catch (err) {
                        console.log(`Error fetching game image for save ${save.saveID}:`, err);
                        return {
                            ...save,
                            save_img: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                            save_img_error: `${config.api.assets}/defaults/game-cover`,
                            link: `/s/${save.saveID}`,
                            game_name: "unknown",
                            game_link: `/NotFound`
                        };
                    }
                };

                const UpdatedRecentResData = await Promise.all(recentResData.map(enrichSave));
                const UpdatedPopularResData = await Promise.all(popularResData.map(enrichSave));
                const UpdatedDownloadedResData = await Promise.all(downloadedResData.map(enrichSave));

                setRecentSaves(UpdatedRecentResData);
                setPopularSaves(UpdatedPopularResData);
                setDownloadedSaves(UpdatedDownloadedResData);
            } catch (err) {
                console.error("Error fetching savedatas", err);
            } finally {
                setLoadingSaves(false);
            }
        };

        fetchGames();
        fetchSaveDatas();
    }, []);

    const renderSaveCardTitle = (sd) => (
        <h4 className="saves-card-title">
            <div><strong><Link to={sd.link}>{sd.title}</Link></strong></div>
            <div><small><Link to={sd.game_link}>{sd.game_name}</Link></small></div>
        </h4>
    );

    return (
        <div>
            <h1 className="text-center mb-3">Welcome to Game Save DataBase</h1>
            <p className="text-center">Use the search bar or browse the <Link to='/catalog'> GSDB Catalog</Link></p>

            {loading && loadingSaves ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Spinner color="dark" />
                </div>
            ) : (
                <>
                    <h3 className="carousel-title">Most Popular Games</h3>

                    <Carousel activeIndex={index} onSelect={handleSelect}>
                        {games.map((game) => (
                            <Carousel.Item key={game.gameID}>
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

                    <div className="saves-grid-columns">
                        <div className="saves-column">
                            <h3 className="column-title">Higher Ratings</h3>
                            {popularSaves.map((sd) => (
                                <div className="saves-card" key={sd.saveID}>
                                    <SafeImage
                                        src={sd.save_img}
                                        fallbackSrc={sd.save_img_error}
                                        alt={sd.title}
                                        className="saves-card-img"
                                    />
                                    <div className="saves-card-content">
                                        {renderSaveCardTitle(sd)}
                                        <p className="saves-card-info">
                                            Rating: {sd.rating.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="saves-column">
                            <h3 className="column-title">Recent Uploads</h3>
                            {recentSaves.map((sd) => (
                                <div className="saves-card" key={sd.saveID}>
                                    <SafeImage
                                        src={sd.save_img}
                                        fallbackSrc={sd.save_img_error}
                                        alt={sd.title}
                                        className="saves-card-img"
                                    />
                                    <div className="saves-card-content">
                                        {renderSaveCardTitle(sd)}
                                        <p className="saves-card-info">
                                            Posted Date: {formatIfDate(sd.postedDate || 'N/A')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="saves-column">
                            <h3 className="column-title">Most Downloaded</h3>
                            {downloadedSaves.map((sd) => (
                                <div className="saves-card" key={sd.saveID}>
                                    <SafeImage
                                        src={sd.save_img}
                                        fallbackSrc={sd.save_img_error}
                                        alt={sd.title}
                                        className="saves-card-img"
                                    />
                                    <div className="saves-card-content">
                                        {renderSaveCardTitle(sd)}
                                        <p className="saves-card-info">
                                            Downloads: {sd.nDownloads ? sd.nDownloads : 0}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;
