import config from "../utils/config";
import React, { useState, useEffect } from "react";
import api from "../utils/interceptor";
import { useNavigate, useLocation } from "react-router-dom";
import '../styles/Common.scss';

const SearchResults = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    const type = params.get("type") || "games";

    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = type === "games"
                    ? `${config.api.games}`
                    : `${config.api.savedatas}`;

                const response = await api.get(url);
                const filteredResults = response.data.filter(item =>
                    type === "games"
                        ? item.title.toLowerCase().includes(query.toLowerCase())
                        : item.title.toLowerCase().includes(query.toLowerCase()) ||
                        item.description.toLowerCase().includes(query.toLowerCase())
                );

                setResults(filteredResults);
            } catch (error) {
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
                    {results.map((result, index) => (
                        <li key={index}>{result.title}</li>
                    ))}
                </ul>
            ) : (
                <p>No se encontraron resultados.</p>
            )}
        </div>
    );
};
export default SearchResults;