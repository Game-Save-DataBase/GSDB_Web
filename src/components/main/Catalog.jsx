import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import config from "../../utils/config.js";
import api from '../../utils/interceptor';

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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDownShortWide, faArrowUpShortWide } from '@fortawesome/free-solid-svg-icons';
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
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("card");

  const [sortFilter, setSort] = useState("")
  const [order, setOrder] = useState("asc"); // "asc" o "down"

  const toggleOrder = () => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await api.get(`${config.api.platforms}?limit=500`);
        const data = Array.isArray(res.data) ? res.data : [];
        const platformsFormatted = data.map((p) => ({
          value: p.platformID?.toString() ?? "",
          label: p.name ?? "",
          abbreviation: p.abbreviation ?? "",
        }));
        setPlatforms(platformsFormatted);
      } catch (err) {
        console.error("Error fetching platforms", err);
      }
    };
    fetchPlatforms();
  }, []);

  const platformAbbrMap = platforms.reduce((acc, p) => {
    if (p.value && p.abbreviation) {
      acc[p.value] = p.abbreviation;
    }
    return acc;
  }, {});


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
    setOffset(0);
    setCurrentPage(1);
    fetchGames(filters, 0, limit);
  }, []);

  const fetchGames = async (filters, pageOffset = 0, newLimit = limit) => {
    try {
      setLoading(true);
      let query = `?complete=false&limit=${newLimit}&offset=${pageOffset}${sortFilter!="" ? `&sort[${order}]=${sortFilter}` : ""}`;
      if (filters.letter && filters.letter !== "ALL") {
        query += `&title[start]=${filters.letter}`;
      }

      if (filters.platform.length > 0) {
        query += `&platformID[in]=${filters.platform.join(",")}`;
      }

      if (filters.releaseDate) {
        query += `&release_date[gte]=${filters.releaseDate}`;
      }
      console.log(query)
      const res = await api.get(`${config.api.games}${query}`);
      const data = Array.isArray(res.data) ? res.data : [res.data];

      const processedGames = data.map((game) => ({
        ...game,
        url: `/g/${game.slug}`,
        errorImage: `${config.api.assets}/defaults/game-cover`
      }));

      setGames(processedGames);
      setHasMore(data.length === newLimit);
    } catch (err) {
      console.error("Error fetching games", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    const defaultFilters = {
      letter: "ALL",
      platform: [],
      releaseDate: "",
    };

    setTempLetter("ALL");
    setTempPlatform([]);
    setTempReleaseDate("");

    setLetter("ALL");
    setPlatform([]);
    setReleaseDate("");

    setSearchParams(new URLSearchParams()); // Limpia la URL

    setOffset(0);
    setCurrentPage(1);

    fetchGames(defaultFilters, 0, limit);
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

    setOffset(0);
    setCurrentPage(1);
    fetchGames({ letter, platform, releaseDate }, 0, limit);
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

  const handlePageChange = (newPage) => {
    const newOffset = (newPage - 1) * limit;
    setCurrentPage(newPage);
    setOffset(newOffset);
    fetchGames({ letter, platform, releaseDate }, newOffset, limit);
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-3">GSDB Game Catalog</h1>

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

      <Stack
        direction="horizontal"
        gap={3}
        className="mb-4 flex-wrap align-items-end"
        style={{ rowGap: "1rem" }}
      >
        <Form.Group style={{ minWidth: "220px" }} className="mb-0 flex-fill">
          <FilterSelect
            label="Platform"
            selected={tempPlatform}
            onChange={setTempPlatform}
            options={platforms}
          />
        </Form.Group>

        <Form.Group style={{ minWidth: "180px" }} className="mb-0 flex-fill">
          <FilterDate
            label="Release Date From"
            value={tempReleaseDate}
            onChange={setTempReleaseDate}
          />
        </Form.Group>

        <Form.Group style={{ minWidth: "160px" }} className="mb-0 flex-fill">
          <Form.Label>View</Form.Label>
          <Form.Select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
          >
            <option value="list">List</option>
            <option value="card">Card</option>
          </Form.Select>
        </Form.Group>

        <Form.Group style={{ minWidth: "160px" }} className="mb-0 flex-fill">
          <Form.Label>Items per page</Form.Label>
          <Form.Select
            value={limit}
            onChange={(e) => {
              const newLimit = parseInt(e.target.value);
              setLimit(newLimit);
              setOffset(0);
              setCurrentPage(1);
              fetchGames({ letter, platform, releaseDate }, 0, newLimit);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={40}>40</option>
          </Form.Select>
        </Form.Group>

        <div className="d-flex align-items-end mb-0 gap-2">
          <Button variant="primary" onClick={handleApplyFilters}>
            Filter
          </Button>
          <Button variant="outline-secondary" onClick={resetFilters}>
            Clear Filters
          </Button>
        </div>
        <Form.Group
          style={{ minWidth: "160px" }}
          className="mb-0 flex-fill"
        >
          {/* ESTO TIENE QUE APARECER ENCIMA DEL SELECT Y DEL FONT AWESOME */}
          <Form.Label>Sort by</Form.Label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Form.Select
              value={sortFilter}
              onChange={(e) => setSort(e.target.value)}
              style={{ flexGrow: 1 }}
            >
              <option value="title">Alphabetical</option>
              <option value="nUploads">Uploads</option>
              <option value="lastUpdate">Last update</option>
              <option value="">Popularity</option>
              <option value="release_date">Release date</option>
            </Form.Select>

            <FontAwesomeIcon
              icon={order === "asc" ? faArrowDownShortWide : faArrowUpShortWide}
              onClick={toggleOrder}
              style={{
                marginLeft: "8px",
                cursor: "pointer",
                fontSize: "1.2em"
              }}
            />
          </div>
        </Form.Group>

      </Stack>


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
            lastUpdate: "lastUpdate",
            image: "cover",
            errorImage: "errorImage",
            uploads: "nUploads",
            link: "url",
            platforms: "platformID",
          }}
          platformMap={platformAbbrMap}
          limit={limit}
          offset={offset}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={handlePageChange}
        />

      )}
    </Container>
  );
}

export default Catalog;
