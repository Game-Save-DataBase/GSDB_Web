import config from "../../utils/config"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/interceptor';
import '../../styles/user/UserProfile.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpFromBracket, faDownload, faEye, faStar } from '@fortawesome/free-solid-svg-icons';

function UserProfile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); //null porque aun no ha cargado
    const [notFound, setNotFound] = useState(false); //el usuario puede ser nulo pero existir ya que aún está cargando, entonces mantenemos una variable bool para cuando NO exista
    const { userNameParam } = useParams();

    useEffect(() => {
        //carga el usuario a mostrar
        const fetchUser = async () => {
            try {
                console.log(`${config.api.users}/by-username/${userNameParam}`)
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
