import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/interceptor";
import config from "../../utils/config";

const PAGE_SIZE = 1;

const SearchResultsAll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";
  const page = parseInt(params.get("page") || "1", 10);

  const path = location.pathname;
  const isGames = path.includes("/search/games");
  const isSaves = path.includes("/search/saves");

  const [results, setResults] = useState([]);
  const [gamesMap, setGamesMap] = useState({});
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setHasMore(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isGames) {
          const res = await api.get(config.api.games, {
            params: {
              "title[like]": query,
              limit: PAGE_SIZE + 1,
              offset: (page - 1) * PAGE_SIZE,
            },
          });
          const data = Array.isArray(res.data) ? res.data : [res.data];
          setResults(data.slice(0, PAGE_SIZE));
          setHasMore(data.length > PAGE_SIZE);
        } else if (isSaves) {
          const res = await api.get(config.api.savedatas, {
            params: {
              limit: PAGE_SIZE + 1,
              offset: (page - 1) * PAGE_SIZE,
              text: query,
            },
          });
          const rawData = Array.isArray(res.data) ? res.data : [res.data];
          const filtered = rawData.filter(
            (item) =>
              (item.title?.toLowerCase().includes(query.toLowerCase())) ||
              (item.description?.toLowerCase().includes(query.toLowerCase()))
          );

          const limited = filtered.slice(0, PAGE_SIZE);
          setResults(limited);
          setHasMore(filtered.length > PAGE_SIZE);

          const uniqueGameIDs = [...new Set(limited.map((item) => item.gameID))].filter(
            (id) => !gamesMap[id]
          );
          if (uniqueGameIDs.length > 0) {
            const gamesByIdRes = await api.post(`${config.api.games}/by-id`, { ids: uniqueGameIDs });
            const gamesByIdArray = Array.isArray(gamesByIdRes.data) ? gamesByIdRes.data : [gamesByIdRes.data];
            const newMap = { ...gamesMap };
            for (const game of gamesByIdArray) {
              newMap[game._id] = game;
            }
            setGamesMap(newMap);
          }
        }
      } catch (err) {
        console.error("Error fetching paged results", err);
        setResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, page, isGames, isSaves]);

  const handlePageChange = (newPage) => {
    navigate(`${location.pathname}?query=${encodeURIComponent(query)}&page=${newPage}`);
  };

  const goBackToSections = () => {
    navigate(`/search?query=${encodeURIComponent(query)}`);
  };

  return (
    <div className="search-results-all">
      <h2>
        {isGames ? "Juegos" : "Partidas guardadas"} para "{query}"
      </h2>

      {loading ? (
        <p>Cargando...</p>
      ) : results.length === 0 ? (
        <p>No se encontraron resultados.</p>
      ) : (
        <>
          <ul>
            {isGames &&
              results.map((game) => (
                <li key={game._id}>
                  <Link to={`/game/${game._id}`}>{game.title}</Link>
                </li>
              ))}

            {isSaves &&
              results.map((save) => {
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

          <div className="pagination">
            {page > 1 && (
              <button onClick={() => handlePageChange(page - 1)}>Anterior</button>
            )}
            {hasMore && (
              <button onClick={() => handlePageChange(page + 1)}>Siguiente</button>
            )}
          </div>
        </>
      )}

      <div className="mt-3">
        <button onClick={goBackToSections}>Volver a secciones</button>
      </div>
    </div>
  );
};

export default SearchResultsAll;
