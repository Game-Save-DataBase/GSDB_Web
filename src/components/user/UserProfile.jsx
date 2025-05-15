import config from "../../utils/config"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/interceptor';
import '../../styles/user/UserProfile.scss';
import VerticalCard from '../utils/VerticalCard.jsx';


import { PLATFORMS, getPlatformName } from '../../utils/constants.jsx'
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

    useEffect(() => {
        //carga el usuario a mostrar
        const fetchUser = async () => {
            try {
                const userResponse = await api.get(`${config.api.users}/by-username/${userNameParam}`);
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
                const savesResponse = await api.get(`${config.api.savedatas}/filter?userID=${user._id}`)
                const savesResponseData = savesResponse.data;
                //vitaminamos cada uplaod con su imagen (viene del juego) y nombre de la plataforma
                const updatedUploads = await Promise.all(
                    savesResponseData.map(async (save) => {
                        try {
                            const gameResponse = await api.get(`${config.api.games}/${save.gameID}`);
                            if (!gameResponse.data) {
                                return {
                                    ...save,
                                    platformName: getPlatformName(save.platformID),
                                    save_img: `${config.paths.gameCover_default}`
                                };
                            }
                            return {
                                ...save,
                                platformName: getPlatformName(save.platformID),
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
        }


        const fetchReviews = async () => {
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
                            <button className="btn btn-primary">Seguir</button>
                        </div>

                        <div className="user-header-stats">
                            <div>
                                <div>
                                    <FontAwesomeIcon icon={faArrowUpFromBracket} />
                                    <span>27</span>
                                    <FontAwesomeIcon icon={faDownload} />
                                    <span>45</span>
                                    <FontAwesomeIcon icon={faEye} />
                                    <span>22</span>
                                </div>
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                                <FontAwesomeIcon icon={faStar} />
                            </div>
                            <div>
                                <div>263 followers</div>
                                <div>23 following</div>
                            </div>
                        </div>
                    </div>

                    <div className="user-bio">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras nec ante euismod, lobortis nibh sit amet, scelerisque urna. Integer sit amet est massa. Etiam eget quam quis nunc pretium dignissim sit amet vitae dui. Donec justo lorem, vehicula id turpis vitae, porttitor pulvinar ante. Aenean luctus elit eget ultricies interdum. Vivamus faucibus volutpat lectus, eget placerat odio lobortis id. Vivamus tincidunt sed libero sit amet pellentesque. Phasellus pulvinar diam ut arcu accumsan auctor. Donec a dolor eget augue venenatis feugiat et at neque. Sed et leo finibus, dapibus tellus sed, bibendum massa. Quisque urna elit, vestibulum sit amet magna posuere, interdum consectetur quam. Vivamus imperdiet vel nulla eu finibus. Suspendisse posuere dui et mi suscipit porttitor. Integer ante urna, cursus vitae egestas vel, tempor eu velit. Proin ac velit at diam efficitur ultrices ut at neque.
                    </div>

                    <hr />
                    <h2>Favorite games</h2>
                    <p>lista de juegos horizontal...</p>
                    <h2>Latest uploads</h2>
                    {uploadedSaves.length === 0 ? (
                        <p>No uploaded saves</p>
                    ) : (
                        <div className="horizontal-scroll">
                            {uploadedSaves.map(save => (
                                <div key={save._id}>
                                    <VerticalCard
                                        image={`${config.connection}${save.save_img}`}
                                        title={save.title}
                                        description={save.description}
                                        saveLink={`/save/${save._id}`}
                                        platform={save.platformName}
                                        rating={save.rating || "0"}
                                    />
                                </div>
                            ))}
                        </div>)}
                    <h2>Latest reviews</h2>
                    <p>lista de saves horizontal...</p>

                    <div>next element here.....</div>

                </>
            ) : (
                <p> </p>
            )
            }
        </div >
    );
}

export default UserProfile;
