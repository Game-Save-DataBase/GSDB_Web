//interceptor de axios para manejar errores genericos (login, etc)
import config from './config';
import axios from 'axios';
import history from './history'; // <- history propio ya que no podemos usar react router dom

// Crear una instancia personalizada de axios
const api = axios.create({
    baseURL: config.connection, // URL base de la API
    timeout: 5000,  // Configura un timeout si lo necesitas
    withCredentials:true,
});
api.defaults.withCredentials = true; //para las cookies de sesion
api.interceptors.response.use(
    (response) => {
        //respuesta correcta
        return response;
    },
    (error) => {
        //..............NECESITA LOGIN
        if (error.response && error.response.status === 401) {
            //
            const method = error.config.method.toUpperCase();
            const url = error.config.url;
            // Solo redirigir si la petición era un POST o PUT
            if (method === 'POST' || method === 'PUT' || (url.includes('/savedatas/') && url.includes('/download'))) {
                console.log(`Error 401 en ${method}: No autorizado. Redirigiendo a login...`);
                history.push('/login');
            }
        }

        // retornamos cualquier otro error si no
        return Promise.reject(error);
    }
);

export default api;