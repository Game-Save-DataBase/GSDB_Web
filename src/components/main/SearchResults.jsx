import config from "../../utils/config";
import React, { useState, useEffect } from "react";
import api from "../../utils/interceptor";
import { useNavigate, useLocation, Link } from "react-router-dom";
import '../../styles/Common.scss';

const SearchResults = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    const type = params.get("type") || "games";

    const [results, setResults] = useState([]);
    const [gamesMap, setGamesMap] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                let data = [];

                if (type === "games") {
                    const response = await api.get(config.api.games);
                    data = response.data;
                } else {
                    const response = await api.get(config.api.savedatas);
                    data = response.data;

                    const filtered = data.filter(item =>
                        item.title.toLowerCase().includes(query.toLowerCase()) ||
                        item.description.toLowerCase().includes(query.toLowerCase())
                    );
                    setResults(filtered);

                    const uniqueGameIDs = [...new Set(filtered.map(item => item.gameID))];

                    
                    if (uniqueGameIDs.length > 0) {
                        const gamesResponse = await api.post(`${config.api.games}/by-id`, { ids: uniqueGameIDs}); 
                        
                        const gamesArray = Array.isArray(gamesResponse.data)
                            ? gamesResponse.data
                            : [gamesResponse.data];

                        const map = {};
                        for (const game of gamesArray) {
                            map[game._id] = game;
                        }
                        setGamesMap(map);
                    }

                    return;
                }

                const filtered = data.filter(item =>
                    item.title.toLowerCase().includes(query.toLowerCase())
                );
                setResults(filtered);

            }
            catch (error) {
                console.error("Error fetching data", error);
            }
        };

        if (query) fetchData();
    }, [query, type]);

    return (
        <div className="search-results">
            <h2>Resultados de búsqueda para "{query}"</h2>
            {results.length > 0 ? (
                <ul>
                    {results.map((result, index) =>
                    {
                        let url = "#";

                        if (type === "games") {
                            url = `/game/${result._id}`;
                            return (
                                <li key={index}>
                                    <Link to={url}>{result.title}</Link>
                                </li>
                            );
                        } else {
                            url = `/save/${result._id}`;
                            const game = gamesMap[result.gameID];
                            const gameTitle = game?.title || "Juego desconocido";
                            const gameLink = game ? `/game/${game._id}` : "#";

                            return (
                                <li key={index}>
                                    <Link to={url}>{result.title}</Link> - <Link to={gameLink}><strong>{gameTitle}</strong></Link>
                                </li>
                            );
                        }
                    })}
                </ul>
            ) : (
                <p>No se encontraron resultados.</p>
            )}
        </div>
    );
};
export default SearchResults;