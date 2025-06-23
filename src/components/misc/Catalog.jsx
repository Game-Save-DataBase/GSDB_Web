import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/interceptor.js";
import config from "../../utils/config.js";
import normalizeToArray from "../../utils/helpers.js";

import "bootstrap/dist/css/bootstrap.min.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const PAGES_PER_BLOCK = 10; // Cantidad de páginas que cargamos en bloque
const LIMIT = 10; // Resultados por página

function Catalog() {
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [pageBlockStart, setPageBlockStart] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Genera el filtro regex según la selección
  const getRegexFilter = () => {
    if (!selectedLetter) return null;
    if (selectedLetter === "#") {
      // números al inicio
      return "^[0-9]";
    }
    if (selectedLetter === "@") {
      // caracteres especiales (no alfanuméricos), se puede ajustar según necesidades
      // Aquí regex para cualquier caracter que NO sea letra o número al inicio
      return "^[^a-zA-Z0-9]";
    }
    // letras normales
    return `^${selectedLetter}`;
  };

  const fetchGamesBlock = async (letter, blockStartPage) => {
    try {
      const offset = (blockStartPage - 1) * LIMIT;
      const queryParams = new URLSearchParams();

      const regex = getRegexFilter();

      if (regex) {
        queryParams.append("title[like]", regex);
      }

      queryParams.append("limit", (PAGES_PER_BLOCK * LIMIT).toString());
      queryParams.append("offset", offset.toString());

      const url = `${config.api.games}?${queryParams.toString()}`;

      const res = await api.get(url);
      const data = normalizeToArray(res.data || []);
      setFilteredGames(data);

      // Usar header para totalCount o fallback
      const total = parseInt(res.headers["x-total-count"]) || 1000;
      setTotalCount(total);

      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching games:", error);
      setFilteredGames([]);
      setTotalCount(0);
    }
  };

  useEffect(() => {
    fetchGamesBlock(selectedLetter, pageBlockStart);
  }, [selectedLetter, pageBlockStart]);

  const totalPages = Math.ceil(totalCount / LIMIT);

  const pages = [];
  const blockLastPage = Math.min(pageBlockStart + PAGES_PER_BLOCK - 1, totalPages);

  for (let i = pageBlockStart; i <= blockLastPage; i++) {
    pages.push(i);
  }

  const startIndex = (currentPage - pageBlockStart) * LIMIT;
  const endIndex = startIndex + LIMIT;
  const gamesToShow = filteredGames.slice(startIndex, endIndex);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    setPageBlockStart(1);
    setCurrentPage(1);
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
  };

  const handlePrevBlock = () => {
    if (pageBlockStart > 1) {
      setPageBlockStart(pageBlockStart - PAGES_PER_BLOCK);
    }
  };

  const handleNextBlock = () => {
    if (pageBlockStart + PAGES_PER_BLOCK <= totalPages) {
      setPageBlockStart(pageBlockStart + PAGES_PER_BLOCK);
    }
  };

  return (
    <div className="container my-4">
      <h1>GSDB Catalog</h1>

      {/* Letras A-Z + Números + Caracteres especiales */}
      <div className="mb-3">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            className={`btn btn-sm me-1 mb-1 ${
              selectedLetter === letter ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}

        <button
          className={`btn btn-sm me-1 mb-1 ${
            selectedLetter === "#" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => handleLetterClick("#")}
          title="Números"
        >
          #
        </button>

        <button
          className={`btn btn-sm me-1 mb-1 ${
            selectedLetter === "@" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => handleLetterClick("@")}
          title="Caracteres especiales"
        >
          @
        </button>

        <button
          className={`btn btn-sm ms-2 mb-1 ${
            selectedLetter === null ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => {
            setSelectedLetter(null);
            setPageBlockStart(1);
            setCurrentPage(1);
          }}
        >
          All
        </button>
      </div>

      <ul className="list-group mb-3">
        {gamesToShow.length > 0 ? (
          gamesToShow.map((game) => (
            <li key={game._id} className="list-group-item">
              <Link to={`/game/${game._id}`}>{game.title}</Link>
            </li>
          ))
        ) : (
          <li className="list-group-item">No games available.</li>
        )}
      </ul>

      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${pageBlockStart === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={handlePrevBlock}>
              &laquo; Anterior
            </button>
          </li>

          {pages.map((pageNum) => (
            <li
              key={pageNum}
              className={`page-item ${currentPage === pageNum ? "active" : ""}`}
            >
              <button className="page-link" onClick={() => handlePageClick(pageNum)}>
                {pageNum}
              </button>
            </li>
          ))}

          <li
            className={`page-item ${
              pageBlockStart + PAGES_PER_BLOCK > totalPages ? "disabled" : ""
            }`}
          >
            <button className="page-link" onClick={handleNextBlock}>
              Siguiente &raquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Catalog;
