import config from "../../utils/config"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/interceptor';
import '../../styles/user/UserProfile.scss';

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
                            alt="Banner"
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
                                alt="Perfil"
                                className="rounded-circle border border-3 border-white"
                                style={{
                                    width: '120px',
                                    height: '120px',
                                    objectFit: 'cover',
                                }}
                            />
                            <div className="ms-3">
                                <h4 className="mb-0">{user.alias || user.userName}</h4>
                                <small className="text-muted">@{user.userName.toLowerCase()}</small>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <p>Cargando usuario...</p>
            )}
        </div>
    );
}

export default UserProfile;
