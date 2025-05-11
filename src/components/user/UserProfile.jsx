import config from "../../utils/config"
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/interceptor';

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
                console.log(userResponse);
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
                <h2>Este es el perfil de, {user.alias || user.userName || 'Usuario'}</h2>
            ) : (
                <p>Cargando usuario...</p>
            )}
        </div>
    );
}

export default UserProfile;
