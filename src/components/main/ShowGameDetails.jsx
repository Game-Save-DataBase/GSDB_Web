import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Spinner,
  Form,
  Stack,
  Button
} from 'react-bootstrap';

import config from '../../utils/config.js';
import api from '../../utils/interceptor.js';
import { LoadingContext } from '../../contexts/LoadingContext';

import FavoriteButton from '../utils/FavoriteButton';
import View from "../views/View.jsx";
import FilterSelect from "../filters/FilterSelect";
import FilterDate from "../filters/FilterDate";

import '../../styles/main/ShowGameDetails.scss';
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
function ShowGameDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isInitialLoad, block, unblock, markAsLoaded, resetLoad } = useContext(LoadingContext);

  const [game, setGame] = useState(null);
  const [saveFiles, setSaveFiles] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  const [postedDate, setPostedDate] = useState("");
  const [tempPlatform, setTempPlatform] = useState([]);
  const [tempPostedDate, setTempPostedDate] = useState("");
  const [viewType, setViewType] = useState("card");
  const [limit, setLimit] = useState(20);


  const genres = ['accion', 'aventura', 'plataformas']; //provisional

  useEffect(() => {
    setTempPlatform(selectedPlatforms);
    setTempPostedDate(postedDate);
  }, [selectedPlatforms, postedDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        resetLoad();
        block();

        if (slug.toLowerCase() !== slug) {
          navigate(`/g/${slug.toLowerCase()}`, { replace: true });
          return;
        }

        const { data: gameData } = await api.get(`${config.api.games}?slug=${slug}`);
        if (!gameData) throw new Error('Game not found');

        setGame(gameData);

        const platformIDs = gameData.platformID ?? [];
        const { data: platformData } = await api.get(`${config.api.platforms}?platformID[in]=${platformIDs.join(',')}`);
        const platformArray = Array.isArray(platformData) ? platformData : [platformData];
        setPlatforms(platformArray);

        const { data: savesRaw } = await api.get(`${config.api.savedatas}?saveID[in]=${gameData.saveID.join(',')}`);
        const saves = Array.isArray(savesRaw) ? savesRaw : [savesRaw];

        const enriched = await Promise.all(
          saves.map(async (sf) => {
            if (!sf || !sf.userID) return { ...sf, userName: "Unknown", platformName: "Unknown" };
            try {
              const { data: user } = await api.get(`${config.api.users}?userID=${sf.userID}`);
              return {
                ...sf,
                userName: user?.userName || "Unknown",
                platformName: platformArray.find(p => p.platformID === sf.platformID)?.name || 'Unknown'
              };
            } catch {
              return { ...sf, userName: "Unknown", platformName: "Unknown" };
            }
          })
        );

        const sorted = enriched.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        setSaveFiles(sorted);
        setSelectedPlatforms(platformArray.map(p => p.platformID?.toString()));
      } catch (err) {
        console.error(err);
      } finally {
        markAsLoaded();
        unblock();
      }
    };

    fetchData();
  }, [slug]);

  const filteredSaves = saveFiles.filter(sf => {
    const matchPlatform = tempPlatform.length
      ? tempPlatform.includes(String(sf.platformID))
      : true;

    const matchDate = tempPostedDate
      ? new Date(sf.postedDate) >= new Date(tempPostedDate)
      : true;

    return matchPlatform && matchDate;
  });
  const applyFilters = () => {
    setSelectedPlatforms(tempPlatform);
    setPostedDate(tempPostedDate);
  };

  if (isInitialLoad || !game) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const platformOptions = platforms.map(p => ({
    value: p.platformID?.toString(),
    label: p.name ?? 'Unknown',
  }));

  return (
    <>
      {/* Breadcrumb */}
      <Row>
        <Col>
          <nav>
            <Link to="/">Home</Link> / <strong>{game.title}</strong>
          </nav>
        </Col>
      </Row>
      {/* Header con imagen de fondo */}
      <div
        className="game-header"
        style={{
          backgroundImage: `url(${game.screenshot || `${config.api.assets}/defaults/banner`}`,
        }}
      >
        <div className="overlay" />
        <Container className="text-white header-content py-5">
          <Row className="align-items-center">
            <Col md={8}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <FavoriteButton gameID={game.gameID} />
                <h1 className="fw-bold mb-0">{game.title}</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <p className="release-date">
                  Release Date: {formatIfDate(game.release_date || 'N/A')}
                </p>
                <span style={{ color: '#ccc', fontWeight: 'bold', margin: '0 4px' }}>•</span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {platforms.map((platform) => (
                    platform.logo ? (
                      <img
                        className="platform-logo"
                        key={platform.platformID}
                        src={platform.logo}
                        alt={platform.name}
                        title={platform.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : null
                  ))}
                </div>
              </div>

              <div className="genres-container">
                {genres.map((genre, index) => (
                  <span key={index} className="genre-badge">{genre}</span>
                ))}
              </div>
            </Col>

            <Col md={4} className="text-end">
              <img
                src={game.cover || `${config.api.assets}/default/game-cover`}
                alt={`${game.title} cover`}
                className="game-cover"
                onError={(e) => { e.target.src = `${config.api.assets}/default/game-cover`; }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt-4">


        {/* Filtros */}
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
              options={platformOptions}
            />
          </Form.Group>

          <Form.Group style={{ minWidth: "220px" }} className="mb-0 flex-fill">
            <FilterDate
              label="Posted Date From"
              value={tempPostedDate}
              onChange={setTempPostedDate}
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
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={40}>40</option>
            </Form.Select>
          </Form.Group>


          <div className="d-flex align-items-end mb-0">
            <Button variant="primary" onClick={applyFilters}>
              Filter
            </Button>
          </div>
        </Stack>


        {/* View */}
        <Row>
          <Col>
            <View
              type={viewType}
              data={filteredSaves.map(sf => ({
                ...sf,
                title: sf.title,
                image: game.cover,
                link: `/s/${sf.saveID}`,
                platforms: [sf.platformID],
                description: sf.description,
                postedDate: sf.postedDate,
                downloads: sf.nDownloads ?? 0,
                tags: sf.tags,
                user: {
                  name: sf.userName,
                  link: `/u/${sf.userName}`
                }
              }))}
              renderProps={{
                title: "title",
                image: "image",
                link: "link",
                platforms: "platforms",
                description: "description",
                releaseDate: "postedDate",
                downloads: "downloads",
                tags: "tags",
                user: "user"
              }}
              platformMap={platforms.reduce((acc, p) => {
                acc[p.platformID] = p.abbreviation || p.name;
                return acc;
              }, {})}
              limit={limit}
              offset={0}
              currentPage={1}
              hasMore={false}
              onPageChange={() => { }}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ShowGameDetails;
