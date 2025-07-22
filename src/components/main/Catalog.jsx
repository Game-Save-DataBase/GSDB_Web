import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import config from "../../utils/config.js";

import {
  Container,
  Spinner,
  Button,
  Form,
  Stack,
} from "react-bootstrap";

import View from "../views/View.jsx";
import FilterSelect from "../filters/FilterSelect";
import FilterDate from "../filters/FilterDate";

const ALPHABET = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [letter, setLetter] = useState("ALL");
  const [platform, setPlatform] = useState([]);
  const [releaseDate, setReleaseDate] = useState("");

  const [tempLetter, setTempLetter] = useState("ALL");
  const [tempPlatform, setTempPlatform] = useState([]);
  const [tempReleaseDate, setTempReleaseDate] = useState("");

  const [platforms, setPlatforms] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("list");

  // Cargar plataformas al montar
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await axios.get(`${config.api.platforms}?limit=500`);
        const data = Array.isArray(res.data) ? res.data : [];
        const platformsFormatted = data.map((p) => ({
          value: p.platformID?.toString() ?? "",
          label: p.name ?? "",
        }));
        setPlatforms(platformsFormatted);
      } catch (err) {
        console.error("Error fetching platforms", err);
      }
    };
    fetchPlatforms();
  }, []);

  // Cargar filtros iniciales desde la URL
  useEffect(() => {
    const urlLetter = searchParams.get("letter") || "ALL";
    const urlPlatform = searchParams.get("platformID[in]")?.split(",") || [];
    const urlReleaseDate = searchParams.get("release_date[gte]") || "";

    const filters = {
      letter: urlLetter,
      platform: urlPlatform,
      releaseDate: urlReleaseDate,
    };

    setLetter(filters.letter);
    setTempLetter(filters.letter);
    setPlatform(filters.platform);
    setTempPlatform(filters.platform);
    setReleaseDate(filters.releaseDate);
    setTempReleaseDate(filters.releaseDate);

    fetchGames(filters);
  }, []);

  const fetchGames = async (filters) => {
    try {
      setLoading(true);
      let query = "?complete=false";

      if (filters.letter && filters.letter !== "ALL") {
        query += `&title[start]=${filters.letter}`;
      }

      if (filters.platform.length > 0) {
        query += `&platformID[in]=${filters.platform.join(",")}`;
      }

      if (filters.releaseDate) {
        query += `&release_date[gte]=${filters.releaseDate}`;
      }

      const res = await axios.get(`${config.api.games}${query}`);

      const data = Array.isArray(res.data) ? res.data : [];

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

  const applyFilters = (newFilters) => {
    const { letter, platform, releaseDate } = newFilters;

    setLetter(letter);
    setPlatform(platform);
    setReleaseDate(releaseDate);

    setTempLetter(letter);
    setTempPlatform(platform);
    setTempReleaseDate(releaseDate);

    const newParams = new URLSearchParams();
    if (letter && letter !== "ALL") newParams.set("letter", letter);
    if (platform?.length) newParams.set("platformID[in]", platform.join(","));
    if (releaseDate) newParams.set("release_date[gte]", releaseDate);

    setSearchParams(newParams);

    fetchGames({ letter, platform, releaseDate });
  };

  const handleLetterClick = (ltr) => {
    setTempLetter(ltr);
    applyFilters({
      letter: ltr,
      platform: tempPlatform,
      releaseDate: tempReleaseDate,
    });
  };

  const handleApplyFilters = () => {
    applyFilters({
      letter: tempLetter,
      platform: tempPlatform,
      releaseDate: tempReleaseDate,
    });
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-3">GSDB Catalog</h1>

      {/* Selector de letras */}
      <div className="d-flex justify-content-center flex-wrap mb-3">
        <Button
          variant={tempLetter === "ALL" ? "primary" : "outline-primary"}
          className="m-1 rounded-circle text-center"
          style={{ width: "35px", height: "35px", padding: 0 }}
          onClick={() => handleLetterClick("ALL")}
        >
          All
        </Button>
        {ALPHABET.map((ltr) => (
          <Button
            key={ltr}
            variant={tempLetter === ltr ? "primary" : "outline-primary"}
            className="m-1 rounded-circle text-center"
            style={{ width: "35px", height: "35px", padding: 0 }}
            onClick={() => handleLetterClick(ltr)}
          >
            {ltr}
          </Button>
        ))}
      </div>

      {/* Barra de filtros */}
      <Stack direction="horizontal" gap={3} className="mb-3 flex-wrap align-items-center">
        <FilterSelect
          label="Platform"
          selected={tempPlatform}
          onChange={setTempPlatform}
          options={platforms}
        />

        <FilterDate
          label="Release Date From"
          value={tempReleaseDate}
          onChange={setTempReleaseDate}
        />

        <Form.Group>
          <Form.Label>View</Form.Label>
          <Form.Select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="list">List</option>
            <option value="card">Card</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" onClick={handleApplyFilters}>
          Filter
        </Button>
      </Stack>

      {/* Resultados */}
      {loading ? (
        <div className="text-center mt-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <View
          type={viewType}
          data={games}
          renderProps={{
            title: "title",
            releaseDate: "release_date",
            image: "cover",
            uploads: "nUploads",
            link: "url",
          }}
        />
      )}
    </Container>
  );
}

export default Catalog;
