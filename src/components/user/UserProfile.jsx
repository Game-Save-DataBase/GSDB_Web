import config from "../../utils/config";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/interceptor";
import { UserContext } from "../../contexts/UserContext.jsx";
import UserFollowButton from "../utils/UserFollowButton.jsx";
import UserCertificateBadge from "../utils/UserCertificateBadge.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUpFromBracket,
    faDownload,
    faEye,
    faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
    Container,
    Row,
    Col,
    Spinner,
    Form,
    Stack,
    Button
} from 'react-bootstrap';
import "../../styles/user/UserProfile.scss";
import FilterSelect from "../filters/FilterSelect";
import FilterDate from "../filters/FilterDate";
import View from "../views/View.jsx";

function UserProfile() {
    const navigate = useNavigate();
    const { userNameParam } = useParams();
    const { user: loggedUser } = useContext(UserContext);

    const [user, setUser] = useState(null);
    const [uploadedSaves, setUploadedSaves] = useState([]);
    const [reviewedSaves, setReviewedSaves] = useState([]);
    const [favGames, setFavGames] = useState([]);
    const [notFound, setNotFound] = useState(false);

    //filtros para los favsaves
    const [favGamesPlatforms, setFavGamesPlatforms] = useState([]);
    const [selectedFavGamesPlatforms, setSelectedFavGamesPlatforms] = useState([]);
    const [selectedGameDate, setSelectedGameDate] = useState("");
    const [favGamesViewType, setFavGamesViewType] = useState("card");
    const [favGamesLimit, setFavGamesLimit] = useState(5);
    const [filteredFavGames, setFilteredFavGames] = useState([]);
    const platformAbbrMap = favGamesPlatforms.reduce((acc, p) => {
        if (p.value && p.abbreviation) {
            acc[p.value] = p.abbreviation;
        }
        return acc;
    }, {});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userResponse = await api.get(
                    `${config.api.users}?userName=${userNameParam.toLowerCase()}`
                );

                // Corrige URL si tiene mayúsculas/minúsculas distintas
                if (userResponse.data.userName !== userNameParam) {
                    navigate(`/u/${userResponse.data.userName}`, { replace: true });
                    return;
                }

                setUser(userResponse.data);
            } catch (err) {
                console.log("user not found");
                setUser(null);
                setNotFound(true);
            }
        };

        fetchUser();
    }, [userNameParam, navigate]);

    if (notFound) {
        return <p className="text-center mt-5">Usuario no encontrado.</p>;
    }

    useEffect(() => {
        const fetchGames = async () => {
            if (user.favGames.length <= 0) {
                setFavGames([]);
                setFavGamesPlatforms([]);
            } else {
                let favGamesIds = Array.isArray(user.favGames) ? user.favGames : [user.favGames];

                try {
                    const gameResponse = await api.get(`${config.api.games}?gameID[in]=${favGamesIds.join(',')}&complete=false&external=false&limit=500`)
                    if (!gameResponse.data) {
                        setFavGames([]);
                        setFavGamesPlatforms([]);
                        return;
                    }
                    let gamesData = Array.isArray(gameResponse.data) ? gameResponse.data : [gameResponse.data];
                    setFavGames(gamesData.map((game) => ({
                        ...game,
                        url: `/g/${game.slug}`,
                    })));

                    try {
                        const gamePlatformsID = [
                            ...new Set(
                                gamesData.flatMap(game => game.platformID || [])
                            )
                        ];
                        if (gamePlatformsID.length === 0) {
                            setFavGamesPlatforms([]);
                            return;
                        }
                        const res = await api.get(`${config.api.platforms}?platformID[in]=${gamePlatformsID}&limit=500`);
                        const data = Array.isArray(res.data) ? res.data : [];
                        const platformsFormatted = data.map((p) => ({
                            value: p.platformID?.toString() ?? "",
                            label: p.name ?? "",
                            abbreviation: p.abbreviation ?? "",
                        }));
                        setFavGamesPlatforms(platformsFormatted);
                    } catch (err) {
                        console.error("Error fetching platforms", err);
                        setFavGamesPlatforms([]);
                    }
                } catch (err) {
                    console.log(`Error fetching favorite games user ${user.userID}:`, err);
                    setFavGames([]);
                    setFavGamesPlatforms([]);
                }

            }
        }

        const fetchSaves = async () => {
            if (user.uploads.length <= 0) {
                setUploadedSaves([]);
            } else {
                try {
                    //filtramos todos los saves subidos por el usuario       
                    const savesResponse = await api.get(`${config.api.savedatas}?saveID[in]=${user.uploads.join(',')}`)
                    const savesResponseData = Array.isArray(savesResponse.data) ? savesResponse.data : [savesResponse.data];
                    //vitaminamos cada uplaod con su imagen 
                    const updatedUploads = await Promise.all(
                        savesResponseData.map(async (save) => {
                            try {
                                const gameResponse = await api.get(`${config.api.games}?gameID=${save.gameID}`);
                                if (!gameResponse.data) { throw ("No game fetched"); }
                                return {
                                    ...save,
                                    save_img: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                                    save_img_error: gameResponse.data.cover || `${config.api.assets}/defaults/game-cover`
                                };
                            } catch (err) {
                                console.log(`Error fetching game image for save ${save.saveID}:`, err);
                                return {
                                    ...save,
                                    save_img: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                                    save_img_error: `${config.api.assets}/defaults/game-cover`
                                };
                            }
                        })

                    )
                    setUploadedSaves(updatedUploads);

                } catch (err) {
                    console.log("Error fetching saves from user", err);
                    setUploadedSaves([]);
                }
            }
        };



        const fetchReviews = async () => {
            const reviewsIDs = [...user.likes, ...user.dislikes];
            if (reviewsIDs.length <= 0) {
                setReviewedSaves([]);
            } else {
                try {
                    //filtramos todos los saves reviewados    
                    const savesResponse = await api.get(`${config.api.savedatas}?saveID[in]=${reviewsIDs.join(',')}`)
                    const savesResponseData = Array.isArray(savesResponse.data) ? savesResponse.data : [savesResponse.data];
                    //vitaminamos cada uplaod con su imagen y el nombre de usuario
                    const updatedReviews = await Promise.all(
                        savesResponseData.map(async (save) => {
                            let gameData = {};
                            let userData = {};

                            // Fetch del juego
                            try {
                                const gameResponse = await api.get(`${config.api.games}?gameID=${save.gameID}`);
                                gameData = gameResponse.data || {};
                            } catch (err) {
                                console.log(`Error fetching game for save ${save.saveID}:`, err);
                            }

                            // Fetch del usuario
                            try {
                                const userResponse = await api.get(`${config.api.users}?userID=${save.userID}`);
                                userData = userResponse.data || {};
                            } catch (err) {
                                console.log(`Error fetching user for save ${save.saveID}:`, err);
                            }

                            return {
                                ...save,
                                save_img: `${config.api.assets}/savedata/${save.saveID}/scr/main`,
                                save_img_error: gameData.cover || `${config.api.assets}/defaults/game-cover`,
                                username: userData.userName || "unknown"
                            };
                        })
                    );

                    setReviewedSaves(updatedReviews);

                } catch (err) {
                    console.log("Error fetching saves from user", err);
                    setReviewedSaves([]);
                }
            }
        }


        if (user) { fetchSaves(); }
        if (user) { fetchGames(); }
        if (user) { fetchReviews(); }

    }, [user]);


    useEffect(() => {
        let filtered = [...favGames];

        // Filtrar por plataformas si hay alguna seleccionada
        if (selectedFavGamesPlatforms.length > 0) {
            filtered = filtered.filter(game =>
                game.platformID?.some(pid => selectedFavGamesPlatforms.includes(pid.toString()))
            );
        }

        // Filtrar por fecha si hay rango
        // Filtrar por fecha si hay rango
        if (selectedGameDate) {
            filtered = filtered.filter(game => {
                const releaseDate = new Date(game.release_date);
                const selectedDate = new Date(selectedGameDate);
                return releaseDate >= selectedDate;
            });
        }

        setFilteredFavGames(filtered);
    }, [favGames, selectedFavGamesPlatforms, selectedGameDate]);


    return (
        <div className="user-profile">
            {user && (
                <>
                    <div className="position-relative">
                        {/* Banner */}
                        <img
                            src={`${config.api.assets}/user/${user.userID}/banner?${Date.now}`}
                            onError={(e) => {
                                e.target.onerror = null; // Evita bucles si la imagen por defecto también falla
                                e.target.src = `${config.api.assets}/defaults/banner}`; // Ruta de imagen por defecto
                            }}
                            alt={`@${user.userName}'s banner image`}
                            className="img-fluid w-100 rounded"
                            style={{
                                height: 'auto',
                                aspectRatio: '5 / 1',
                                objectFit: 'cover',
                            }}
                        />

                        {/* Imagen de perfil */}
                        <div className="position-absolute top-100 start-0 translate-middle-y ms-3">
                            <img
                                src={`${config.api.assets}/user/${user.userID}/pfp?${Date.now}`}
                                onError={(e) => {
                                    e.target.onerror = null; // Evita bucles si la imagen por defecto también falla
                                    e.target.src = `${config.api.assets}/defaults/pfp}`; // Ruta de imagen por defecto
                                }}
                                alt={`@${user.userName.toLowerCase()}'s profile picture`}
                                className="rounded-circle border border-3 border-white"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    </div>
                    {/* ---------------------------------------------------------------------------------------------- */}
                    <div className="user-header">
                        <div className="user-header-handle">
                            <div>
                                <h4>{user.alias || user.userName}</h4>
                                <small>@{user.userName.toLowerCase()}</small>
                                <UserCertificateBadge user={user} />
                            </div>
                            {(!loggedUser || (user && loggedUser && user._id !== loggedUser._id)) && (
                                // <button className="btn btn-primary" onClick={handleFollow}>Follow</button>
                                <UserFollowButton
                                    user={user}
                                    loggedUser={loggedUser} />
                            )}
                        </div>

                        <div className="user-header-stats">
                            <div>
                                <div>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} />
                                    <span>{`${uploadedSaves.length}`}</span>
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span>{`${user.downloadHistory.length}`}</span>
                                    <FontAwesomeIcon icon={faEye} />
                                    <span>{`${reviewedSaves.length}`}</span>
                                </div>
                            </div>
                            <div>
                                <div>{`${user.followers.length} followers`}</div>
                                <div>{`${user.following.length} following`}</div>
                            </div>
                        </div>
                    </div>

                    <div className="user-bio">
                        {`${user.bio}`}
                    </div>

                    <hr />
                    <h2>Favorite games</h2>
                    <Container className="user-profile-container mt-4">

                        <Stack
                            direction="horizontal"
                            gap={3}
                            className="mb-4 flex-wrap align-items-end"
                            style={{ rowGap: "1rem" }}
                        >
                            <Form.Group style={{ minWidth: "220px" }} className="mb-0 flex-fill">
                                <FilterSelect
                                    label="Platform"
                                    selected={selectedFavGamesPlatforms}
                                    onChange={setSelectedFavGamesPlatforms}
                                    options={favGamesPlatforms}
                                />
                            </Form.Group>

                            <Form.Group style={{ minWidth: "180px" }} className="mb-0 flex-fill">
                                <FilterDate
                                    label="Release Date From"
                                    value={selectedGameDate}
                                    onChange={setSelectedGameDate}
                                />
                            </Form.Group>

                            <Form.Group style={{ minWidth: "160px" }} className="mb-0 flex-fill">
                                <Form.Label>View</Form.Label>
                                <Form.Select
                                    value={favGamesViewType}
                                    onChange={(e) => setFavGamesViewType(e.target.value)}
                                >
                                    <option value="list">List</option>
                                    <option value="card">Card</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group style={{ minWidth: "160px" }} className="mb-0 flex-fill">
                                <Form.Label>Items per page</Form.Label>
                                <Form.Select
                                    value={favGamesLimit}
                                    onChange={(e) => {
                                        const newLimit = parseInt(e.target.value);
                                        setFavGamesLimit(newLimit);
                                    }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={40}>40</option>
                                </Form.Select>
                            </Form.Group>

                        </Stack>
                        {/* View */}
                        <Row>
                            <Col>
                                <View
                                    type={favGamesViewType}
                                    data={filteredFavGames}
                                    renderProps={{
                                        title: "title",
                                        image: "cover",
                                        errorImage: `${config.api.assets}/default/game-cover`,
                                        link: "url",
                                        platforms: "platformID",
                                    }}
                                    platformMap={platformAbbrMap}
                                    limit={favGamesLimit}
                                    offset={0}
                                    currentPage={1}
                                    hasMore={false}
                                    onPageChange={() => { }}
                                />
                            </Col>
                        </Row>
                    </Container>




                </>
            )}
        </div>
    );
}

export default UserProfile;
