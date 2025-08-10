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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';

import SaveLocationsModal from '../utils/SaveLocationsModal.jsx'

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

  const [showInstallModal, setShowInstallModal] = useState(false);

  const handleOpenInstallModal = () => setShowInstallModal(true);
  const handleCloseInstallModal = () => setShowInstallModal(false);


  const genres = ['accion', 'aventura', 'plataformas']; //provisional

  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tempTags, setTempTags] = useState([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const { data: tagData } = await api.get(`${config.api.tags}`);
        const tagArray = Array.isArray(tagData) ? tagData : [tagData];
        setTags(tagArray);
      } catch (err) {
        console.error("Error fetching tags:", err);
      }
    };

    fetchTags();
  }, []);



  useEffect(() => {
    setTempPlatform(selectedPlatforms);
    setTempPostedDate(postedDate);
    setTempTags(selectedTags);
  }, [selectedPlatforms, postedDate, selectedTags]);

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

        // Extraer tagIDs únicos de los saves
        const tagIDs = Array.from(new Set(saves.flatMap(sf => sf.tags || []))).filter(Boolean);

        // Obtener los tags
        let tagMap = {};
        if (tagIDs.length) {
          const { data: tagData } = await api.get(`${config.api.tags}?tagID[in]=${tagIDs.join(',')}`);
          const tagArray = Array.isArray(tagData) ? tagData : [tagData];
          tagMap = tagArray.reduce((acc, tag) => {
            acc[tag.tagID] = tag.name;
            return acc;
          }, {});
        }

        // Enriquecer los saves
        const enriched = await Promise.all(
          saves.map(async (sf) => {
            if (!sf || !sf.userID) return { ...sf, userName: "Unknown", platformName: "Unknown" };
            try {
              const { data: user } = await api.get(`${config.api.users}?userID=${sf.userID}`);
              return {
                ...sf,
                userName: user?.userName || "Unknown",
                platformName: platformArray.find(p => p.platformID === sf.platformID)?.name || 'Unknown',
                tagNames: sf.tags?.map(id => tagMap[id]).filter(Boolean) || [],
              };
            } catch {
              return {
                ...sf,
                userName: "Unknown",
                platformName: "Unknown",
                tagNames: sf.tags?.map(id => tagMap[id]).filter(Boolean) || [],
              };
            }
          })
        );

        const sorted = enriched.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
        setSaveFiles(sorted);
      } catch (err) {
        if (!game) {
          navigate('/notfound?g', { replace: true });
          return;
        }
        console.error(err);
      } finally {
        markAsLoaded();
        unblock();
      }
    };

    fetchData();
  }, [slug]);


  const filteredSaves = saveFiles.filter(sf => {
    const platformIdStr = String(sf.platformID);

    const matchPlatform = selectedPlatforms.length > 0
      ? selectedPlatforms.includes(platformIdStr)
      : true;

    const matchDate = postedDate
      ? new Date(sf.postedDate) >= new Date(postedDate)
      : true;

    const matchTags = selectedTags.length > 0
      ? sf.tags?.some(tag => selectedTags.includes(tag))
      : true;

    return matchPlatform && matchDate && matchTags;
  });



  const applyFilters = () => {
    setSelectedPlatforms(tempPlatform);
    setPostedDate(tempPostedDate);
    setSelectedTags(tempTags);
  };

  const resetFilters = () => {
    setTempPlatform([]);
    setTempPostedDate("");
    setSelectedPlatforms([]);
    setPostedDate("");
    setSelectedTags([]);
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
          {/* Seccion previa al encabezado con el enlace y titulo. La dejo fuera del div container de la pagina a proposito.*/}
          <section className='nav-section'>
            <nav>
              <ol>
                <li>
                  <Link to={`/`}>Home</Link>
                </li>
                <li>
                  <Link to={`/catalog`}>Catalog</Link>
                </li>
                <li>
                  {game &&
                    game.title || 'Juego desconocido'}
                </li>
              </ol>
            </nav>
          </section>

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
                            <div className="platform-logo-wrapper" key={platform.platformID} title={platform.name}>
                      <img
                        className="platform-logo"
                        key={platform.platformID}
                        src={platform.logo}
                        alt={platform.name}
                        title={platform.name}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      </div>
                    ) : null
                  ))}
                </div>
              </div>

              <div className="genres-container">
                {genres.map((genre, index) => (
                  <span key={index} className="genre-badge">{genre}</span>
                ))}
              </div>
              <div className="header-buttons mt-3 d-flex gap-2">
                <Button
                  className="upload-button"
                  variant="success"
                  size="lg"
                  onClick={() => navigate(`/upload?gameID=${game.gameID}`)}
                >
                  <FontAwesomeIcon icon={faArrowUpFromBracket} />
                  Upload Save
                </Button>

                {game.saveLocations && game.saveLocations.length > 0 && (
                  <Button
                    className='saveLocation-button'
                    variant="success"
                    size="lg"
                    onClick={handleOpenInstallModal}
                  >
                    Savedata location
                  </Button>
                )}
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
            <FilterSelect
              label="Tags"
              selected={tempTags}
              onChange={setTempTags}
              options={tags.map(t => ({ value: t.tagID, label: t.name }))}
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


          <div className="d-flex align-items-end mb-0 gap-2">
            <Button variant="primary" onClick={applyFilters}>
              Filter
            </Button>
            <Button variant="outline-secondary" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>

        </Stack>


        {/* View */}
        <Row>
          <Col>
            <View
              type={viewType}
              data={filteredSaves
                .filter(sf => sf && sf.saveID && sf.userName) // evita objetos vacíos o incompletos
                .map(sf => ({
                  ...sf,
                  title: sf.title || "Untitled",
                  image: `${config.api.assets}/savedata/${sf.saveID}/scr/main`,
                  errorImage: game.cover || `${config.api.assets}/default/game-cover`,
                  link: `/s/${sf.saveID}`,
                  platforms: [sf.platformID],
                  description: sf.description || "No description",
                  postedDate: sf.postedDate,
                  downloads: sf.nDownloads ?? 0,
                  tags: Array.isArray(sf.tagNames) ? sf.tagNames : [],
                  user: {
                    name: sf.userName,
                    link: `/u/${sf.userName}`
                  }
                }))}
              renderProps={{
                title: "title",
                image: "image",
                errorImage: "errorImage",
                link: "link",
                platforms: "platforms",
                description: "description",
                uploadDate: "postedDate",
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
      <SaveLocationsModal
        show={showInstallModal}
        onHide={handleCloseInstallModal}
        saveLocations={game.saveLocations}
      />

    </>
  );
}

export default ShowGameDetails;
