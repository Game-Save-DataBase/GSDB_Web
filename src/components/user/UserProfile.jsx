import config from "../../utils/config"
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/interceptor';
import '../../styles/user/UserProfile.scss';
import VerticalCard from '../utils/VerticalCard.jsx';
import UserFollowButton from '../utils/UserFollowButton.jsx';
import { UserContext } from '../../contexts/UserContext.jsx';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faDownload, faEye, faStar } from '@fortawesome/free-solid-svg-icons';

function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); //null porque aun no ha cargado
    const [uploadedSaves, setUploadedSaves] = useState([]); //saves subidos por el usuario
    const [reviewedSaves, setReviewedSaves] = useState([]); //saves revisados por el usuario
    const [favGames, setFavGames] = useState([]); //juegos favoritos del usuario
    const [notFound, setNotFound] = useState(false); //el usuario puede ser nulo pero existir ya que aún está cargando, entonces mantenemos una variable bool para cuando NO exista
    const { userNameParam } = useParams();
    const { user: loggedUser } = useContext(UserContext);

    useEffect(() => {
        //carga el usuario a mostrar
        const fetchUser = async () => {
            try {
                const userResponse = await api.get(`${config.api.users}?userName=${userNameParam.toLowerCase()}`);
                // redirige para tener una pretty url si el nombre esta escrito mal (mayus y minus)
                if (userResponse.data.userName !== userNameParam) {
                    navigate(`/u/${userResponse.data.userName}`, { replace: true }); //replace se usa para que navigate no añada una nueva url al historial sino que la cambie
                    return;
                }

                setUser(userResponse.data);
            } catch (err) {
                console.log("user not found");
                setUser(null);
                setNotFound(true);
            }

        };//fetchUser

        fetchUser();
    }, [userNameParam]); //solo ejecuta el useEffect cuando cambie el id


    useEffect(() => {
        const fetchSaves = async () => {
            try {
                //filtramos todos los saves subidos por el usuario                
                const savesResponse = await api.get(`${config.api.savedatas}?userID=${user._id}`)
                const savesResponseData = savesResponse.data;
                //vitaminamos cada uplaod con su imagen (viene del juego) y nombre de la plataforma
                const updatedUploads = await Promise.all(
                    (savesResponseData || []).map(async (save) => {
                        try {
                            const gameResponse = await api.get(`${config.api.games}?_id=${save.gameID}`);
                            if (!gameResponse.data) {
                                return {
                                    ...save,
                                    platformName: "",
                                    save_img: `${config.paths.gameCover_default}`
                                };
                            }
                            return {
                                ...save,
                                platformName: "",
                                save_img: gameResponse.data.cover

                            };
                        } catch (err) {
                            console.log(`Error fetching game image for save ${save._id}:`, err);
                        }
                    })

                )
                setUploadedSaves(updatedUploads);

            } catch (err) {
                console.log("Error fetching saves from user", err);
                setUploadedSaves([]);
            }
        };

        const fetchGames = async () => {
            //  favGames siempre es un array
            let favGamesIds = user?.favGames;
            if (!favGamesIds) {
                setFavGames([]);
                return;
            }
            // Si no es array, lo envolvemos en un array
            if (!Array.isArray(favGamesIds)) {
                favGamesIds = [favGamesIds];
            }
            try {
                const gameResponse = await api.post(`${config.api.games}/by-id`, {
                    ids: favGamesIds
                });
                if (!gameResponse.data) {
                    setFavGames([]);
                    return;
                }
                let gamesData = gameResponse.data;
                if (!Array.isArray(gamesData)) {
                    gamesData = [gamesData];
                }
                setFavGames(gamesData);
            } catch (err) {
                console.log(`Error fetching favorite games user ${user._id}:`, err);
            }
        }


        const fetchReviews = async () => {
            try {
                const saveIds = (user.reviews || []).map(review => review.saveID);
                const savesResponse = await api.post(`${config.api.savedatas}/by-id`, {
                    ids: saveIds
                });
                //vitaminamos cada review con su imagen (viene del juego), nombre de la plataforma, nombre de usuario de la subida
                const updatedReviews = await Promise.all(
                    (savesResponse.data || []).map(async (save) => {
                        try {
                            const gameResponse = await api.get(`${config.api.games}?_id=${save.gameID}`);
                            const userResponse = await api.get(`${config.api.users}?_id=${save.userID}`);
                            return {
                                ...save,
                                platformName: "",
                                save_img: gameResponse.data?.cover || config.paths.gameCover_default,
                                userName: userResponse.data?.userName || "Unknown",
                                userPfp: userResponse.data?.pfp || config.paths.pfp_default
                            };
                        } catch (err) {
                            console.log(`Error fetching additional data for save ${save._id}:`, err);
                            return {
                                ...save,
                                platformName: "",
                                save_img: config.paths.gameCover_default,
                                userName: "Unknown",
                                userPfp: config.paths.pfp_default
                            };
                        }
                    })

                )
                setReviewedSaves(updatedReviews);
            } catch (err) {
                console.log(`Error fetching reviews from user ${user._id}:`, err);
            }
        }


        if (user) { fetchSaves(); }
        if (user) { fetchGames(); }
        if (user) { fetchReviews(); }

    }, [user]);

    if (notFound) {
        //TO DO: hacer mas bonita la pagina de usuario inexistente
        return <p>Usuario no encontrado.</p>;
    }

    return (
        <div className="user-profile">
            {user ? (
                <>
                    <div className="position-relative">
                        {/* Banner */}
                        <img
                            src={`${config.connection}${user.banner}`}
                            onError={(e) => {
                                e.target.onerror = null; // Evita bucles si la imagen por defecto también falla
                                e.target.src = `${config.connection}${config.paths.banner_default}`; // Ruta de imagen por defecto
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
                                src={`${config.connection}${user.pfp}`}
                                onError={(e) => {
                                    e.target.onerror = null; // Evita bucles si la imagen por defecto también falla
                                    e.target.src = `${config.connection}${config.paths.pfp_default}`; // Ruta de imagen por defecto
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
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
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
                    {favGames.length === 0 ? (
                        <p>No favorite games!</p>
                    ) : (
                        <div className="horizontal-scroll">
                            {favGames.map(game => (
                                <div key={game._id}>
                                    <VerticalCard
                                        image={`${game.cover}`}
                                        image_default={`${config.connection}${config.paths.gameCover_default}`}
                                        title={game.title}
                                        cLink={`/game/${game._id}`}
                                        platformsID={game.platformsID}
                                    />
                                </div>
                            ))}
                        </div>)}
                    <h2>Latest uploads</h2>
                    {uploadedSaves.length === 0 ? (
                        <p>No uploaded saves</p>
                    ) : (
                        <div className="horizontal-scroll">
                            {uploadedSaves.map(save => (
                                <div key={save._id}>
                                    <VerticalCard
                                        image={`${save.save_img}`}
                                        image_default={`${config.connection}${config.paths.gameCover_default}`}
                                        title={save.title}
                                        description={save.description}
                                        cLink={`/save/${save._id}`}
                                        platform={save.platformName}
                                        rating={save.rating || "0"}
                                    />
                                </div>
                            ))}
                        </div>)}
                    <h2>Latest reviews</h2>
                    {reviewedSaves.length === 0 ? (
                        <p>No reviews!</p>
                    ) : (
                        <div className="horizontal-scroll">
                            {reviewedSaves.map(save => (
                                <div key={save._id}>
                                    <VerticalCard
                                        image={`${save.save_img}`}
                                        image_default={`${config.connection}${config.paths.gameCover_default}`}
                                        title={save.title}
                                        description={save.description}
                                        cLink={`/save/${save._id}`}
                                        platform={save.platformName}
                                        rating={save.rating || "0"}
                                        username={save.userName}
                                        userLink={`/u/${save.userName}`}
                                    />
                                </div>
                            ))}
                        </div>)}

                </>
            ) : (
                <p> </p>
            )
            }
        </div >
    );
}

export default UserProfile;
