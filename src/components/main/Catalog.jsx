import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spinner, Button, Container } from "react-bootstrap";
import config from "../../utils/config.js";

import "bootstrap/dist/css/bootstrap.min.css";

// Incluye caracteres especiales
const ALPHABET = ["#", ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(""), "Ñ"];

function Catalog() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState("ALL");

  const fetchGames = async (letter = "") => {
    try {
      setLoading(true);
      let query = "?complete=false";

      if (letter && letter !== "ALL") {
        if (letter === "#") {
          // Buscar títulos que no empiezan por una letra (regex: ^[^a-zA-ZñÑ])
          // query += `&title[start]=^[^a-zA-ZñÑ]`;
        } else {
          query += `&title[start]=${letter}`;
        }
      }

      const response = await axios.get(`${config.api.games}${query}`);
      setGames(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(selectedLetter);
  }, [selectedLetter]);

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">GSDB Catalog</h1>

      <div className="d-flex justify-content-center flex-wrap mb-4">
        <Button
          variant={selectedLetter === "ALL" ? "primary" : "outline-primary"}
          className="m-1 rounded-circle text-center"
          style={{ width: "45px", height: "45px" }}
          onClick={() => handleLetterClick("ALL")}
        >
          All
        </Button>

        {ALPHABET.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? "primary" : "outline-primary"}
            className="m-1 rounded-circle text-center"
            style={{ width: "45px", height: "45px" }}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <ul className="list-group">
          {games.length === 0 ? (
            <li className="list-group-item text-center">No results found.</li>
          ) : (
            games.map((game) => (
              <li key={game._id} className="list-group-item">
                {game.title}
              </li>
            ))
          )}
        </ul>
      )}
    </Container>
  );
}

export default Catalog;
