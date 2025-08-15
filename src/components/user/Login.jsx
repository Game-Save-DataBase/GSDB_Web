import config from '../../utils/config';
import api from '../../utils/interceptor';
import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import history from '../../utils/history';
import zxcvbn from 'zxcvbn';
import '../../styles/user/Login.scss'

const Login = () => {
  const { setUser } = useContext(UserContext);
  const [inLogin, setInLogin] = useState(true);
  const [formData, setFormData] = useState({
    userName: '',
    mail: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const location = useLocation();
  const from = location.state?.from?.pathname
    || (document.referrer.startsWith(window.location.origin)
      ? new URL(document.referrer).pathname
      : '/')
    || '/';
  const navigate = useNavigate();
  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await api.get(`${config.api.auth}/me`);
      if (res.data?.user) {
        navigate(`/u/${res.data?.user.userName}`, { replace: true });
      }
    } catch (err) {
      // No logueado → no hacemos nada
    }
  };

  checkAuth();
}, [navigate]);

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
      setMessage('Password is too weak. Use a stronger combination.');
      return;
    }
    if (!inLogin && formData.password !== formData.confirmPassword) {
      setMessage('Password do not match.');
      return;
    }
    try {
      if (inLogin) {
        const res = await api.post(`${config.api.auth}/login`, {
          identifier: formData.userName || formData.mail,
          password: formData.password
        });
        setMessage('Login successful ✅');
        setTimeout(() => {
          setUser(res.data.user);
          navigate(from, { replace: true });
        }, 2000);
      } else {
        console.log(formData.userName.toLowerCase(), formData.userName.toLowerCase(), formData.password)
        await api.post(`${config.api.auth}/register`, {
          userName: formData.userName.toLowerCase(),
          mail: formData.mail.toLowerCase(),
          password: formData.password
        }, { withCredentials: true });

        setMessage('Registration successful. Logging in...');

        const res = await api.post(`${config.api.auth}/login`, {
          identifier: formData.userName.toLowerCase(),
          password: formData.password
        }, { withCredentials: true });

        setTimeout(() => {
          setUser(res.data.user);

          navigate(from, { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.log(err.response);
      setMessage(err.response?.data?.message || 'An unexpected error occurred');
    }
  };

  return (



    <div className="login-wrapper">
      <div>
        {message && (
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "auto",
              maxWidth: "600px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
            }}
          >
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
          </div>
        )}
      </div>
      <div className="login-card">
        <div className="text-center mb-4">
          <img src={`${config.paths.assetsFolder}/logo.png`} alt="GSDB Logo" className="login-logo" />
          <h4 className="mt-2">
            {inLogin ? 'Sign in to GSDB' : 'Register for GSDB'}
          </h4>
        </div>

        <form onSubmit={handleSubmit}>
          {!inLogin && (
            <>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="mail"
                  value={formData.mail}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {inLogin && (
            <div className="mb-3">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-control"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {!inLogin && (
            <div className="mb-3">
              <div className="progress">
                <div
                  className={`progress-bar ${passwordStrength >= 3 ? 'bg-success' : 'bg-danger'} password-strength-bar`}
                  style={{ width: `${(passwordStrength / 4) * 100}%` }}
                ></div>
              </div>
              <small className="text-muted password-strength-text">
                Strength: {['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]}
              </small>

              <div>
                <label className="form-label">Confirm password</label>
                <input
                  type="password"
                  className="form-control"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="d-grid mb-2">
            <button type="submit" className="btn btn-primary">
              {inLogin ? 'Sign In' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            className="btn btn-link"
            onClick={() => {
              setInLogin(!inLogin);
              setMessage('');
            }}
          >
            {inLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
