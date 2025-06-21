import config from "../../utils/config";
import React, { useState, useEffect } from "react";
import api from "../../utils/interceptor";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../../styles/Common.scss';

const PAGE_SIZE = 1;

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";

    const [games, setGames] = useState([]);
    const [saves, setSaves] = useState([]);
    const [gamesMap, setGamesMap] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query.trim().length < 1) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const gamesRes = await api.get(config.api.games, {
                    params: {
                        "title[like]": query,
                        limit: PAGE_SIZE,
                        offset: 0,
                    },
                });
                const gamesData = Array.isArray(gamesRes.data) ? gamesRes.data : [gamesRes.data];
                setGames(gamesData);

                const savesRes = await api.get(config.api.savedatas, {
                    params: {
                        limit: PAGE_SIZE,
                        offset: 0,
                        text: query,
                    },
                });
                const rawSaves = Array.isArray(savesRes.data) ? savesRes.data : [savesRes.data];
                const filteredSaves = rawSaves.filter(
                    (item) =>
                        (item.title || "").toLowerCase().includes(query.toLowerCase()) ||
                        (item.description || "").toLowerCase().includes(query.toLowerCase())
                );
                setSaves(filteredSaves);

                // Obtener IDs de juegos de saves para mapear
                const uniqueGameIDs = [...new Set(filteredSaves.map((item) => item.gameID))];
                if (uniqueGameIDs.length > 0) {
                    const gamesByIdRes = await api.post(`${config.api.games}/by-id`, { ids: uniqueGameIDs });
                    const gamesByIdArray = Array.isArray(gamesByIdRes.data) ? gamesByIdRes.data : [gamesByIdRes.data];
                    const newMap = {};
                    for (const game of gamesByIdArray) {
                        newMap[game._id] = game;
                    }
                    setGamesMap(newMap);
                }
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query]);

    return (
        <div className="search-results-main">
            <h2>Resultados de búsqueda para "{query}"</h2>

            <section>
                <h3>Juegos</h3>
                {games.length === 0 && !loading ? (
                    <p>No se encontraron juegos.</p>
                ) : (
                    <>
                        <ul>
                            {games.map((game) =>
                                game?._id ? (
                                    <li key={game._id}>
                                        <Link to={`/game/${game._id}`}>{game.title}</Link>
                                    </li>
                                ) : null
                            )}
                        </ul>
                        {games.length === PAGE_SIZE && (
                            <button onClick={() => navigate(`/search/games?query=${query}`)}>
                                Mostrar más juegos
                            </button>
                        )}
                    </>
                )}
            </section>

            <section>
                <h3>Saves</h3>
                {saves.length === 0 && !loading ? (
                    <p>No se encontraron partidas guardadas.</p>
                ) : (
                    <>
                        <ul>
                            {saves.map((save) => {
                                if (!save?._id) return null;
                                const game = gamesMap[save.gameID];
                                const gameTitle = game?.title || "Juego desconocido";
                                return (
                                    <li key={save._id}>
                                        <Link to={`/save/${save._id}`}>{save.title}</Link> -{" "}
                                        <Link to={`/game/${game?._id || "#"}`}>
                                            <strong>{gameTitle}</strong>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                        {saves.length === PAGE_SIZE && (
                            <button onClick={() => navigate(`/search/saves?query=${query}`)}>
                                Mostrar más partidas guardadas
                            </button>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};
export default SearchResults;
