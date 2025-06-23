import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../utils/interceptor";
import config from "../../utils/config";


const SearchResults = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchType = params.get("type");
  const query = params.get("query");

  const [results, setResults] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        let response;
        if (searchType === "juegos") {
          response = await api.get(`${config.api.games}?title[like]=${query}`);
        } else if (searchType === "savedatas") {
          response = await api.get(`${config.api.savedatas}?text=${query}`);
        } else {
          response = await api.get(`${config.api.users}?userName[like]=${query}`);
        }

        setResults(Array.isArray(response.data) ? response.data : [response.data]);
        setNotFound(false);
      } catch (err) {
        setResults([]);
        setNotFound(true);
      }
    };
    fetchResults();
  }, [query, searchType]);

  return (
    <div className="search-results-page">
      <h2>Resultados para "{query}" en {searchType}</h2>
      {notFound ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <ul>
          {results.map((res, idx) => (
            <li key={idx}>
              {searchType === "juegos" && <a href={`/game/${res._id || res.IGDB_ID}`}>{res.title}</a>}
              {searchType === "savedatas" && <a href={`/save/${res._id}`}>{res.title} - {res.description}</a>}
              {searchType === "usuarios" && <a href={`/u/${res.userName}`}>{res.userName} ({res.Alias})</a>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
