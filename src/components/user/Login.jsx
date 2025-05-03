import config from '../../utils/config'
import api from '../../utils/interceptor'
import { useState, useContext } from 'react';
import { UserContext } from "../../contexts/UserContext";
import history from '../../utils/history'
import zxcvbn from 'zxcvbn';


const Login = () => {
  const { setUser } = useContext(UserContext);
  const [inLogin, setInLogin] = useState(true);  // gestionamos la misma pagina para login y register
  const [formData, setFormData] = useState({
    userName: '',
    mail: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  //gestion de contraseña segura
  const [passwordStrength, setPasswordStrength] = useState(0);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'password') {
      const result = zxcvbn(e.target.value);
      setPasswordStrength(result.score);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inLogin && passwordStrength < 3) {
      setMessage('La contraseña es demasiado débil. Usa una combinación más segura.');
      return;
    }
    try {

      //.......................LOGIN
      if (inLogin) {
        const res = await api.post(`${config.api.auth}/login`, {
          identifier: formData.userName || formData.mail,
          password: formData.password
        });
        console.log(res)

        setMessage('Login exitoso ✅')
        //esperamos dos segundos antes de lanzar la pagina previa (to do: aun te manda a la principal)
        setTimeout(() => {
          setUser(res.data.user)
          history.push('/')
        }, 2000);
      }
      //.......................REGISTER
      else {
        await api.post(`${config.api.auth}/register`, {
          userName: formData.userName,
          mail: formData.mail,
          password: formData.password
        }, { withCredentials: true })

        setMessage('Registro exitoso, iniciando sesión... ✅')

        // Login automático tras registrarse
        const res = await api.post(`${config.api.auth}/login`, {
          identifier: formData.userName,
          password: formData.password
        }, { withCredentials: true })

        setTimeout(() => {
          setUser(res.data.user)
          history.push('/')
        }, 2000)
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setMessage(err.response.data.msg)
      } else {
        setMessage('Ocurrió un error inesperado')
      }
    }
  };

  return (
    <div>
      <h2>{inLogin ? 'Inicia sesión en GSDB' : 'Regístrate en GSDB'}</h2>

      <form onSubmit={handleSubmit}>
        {!inLogin && (
          <>
            <div>
              <label>Usuario</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Mail</label>
              <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {inLogin && (
          <div>
            <label>Usuario o Mail</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {!inLogin && <div className="mb-4">
          <div className={`h-2 rounded ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(passwordStrength / 4) * 100}%` }}></div>
          <p className="text-sm mt-1">
            Seguridad: {
              ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Muy buena'][passwordStrength]
            }
          </p>
        </div>}

        <button type="submit">
          {inLogin ? 'Entrar' : 'Registrarse'}
        </button>
      </form>

      <button onClick={() => {
        setInLogin(!inLogin)
        setMessage('')
      }} style={{ marginTop: '10px' }}>
        {inLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;
