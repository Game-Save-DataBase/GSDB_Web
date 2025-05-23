import { useState, useEffect } from 'react';
import zxcvbn from 'zxcvbn';

const PasswordInput = ({ mode = 'register', onSubmit, onChangeDirty }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const result = zxcvbn(newPassword);
    setPasswordStrength(result.score);
  }, [newPassword]);

  // Detectar si hay cambios en el formulario de contraseña
  useEffect(() => {
    const dirty = mode === 'update'
      ? currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0
      : newPassword.length > 0 || confirmPassword.length > 0;

    if (onChangeDirty) onChangeDirty(dirty);
  }, [currentPassword, newPassword, confirmPassword, mode, onChangeDirty]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (passwordStrength < 3) {
      setMessage('Password is too weak.');
      return;
    }

    if (onSubmit) {
      onSubmit({
        currentPassword: mode === 'update' ? currentPassword : null,
        newPassword: newPassword.trim()
      });
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordStrength(0);
    setMessage(null);
    if (onChangeDirty) onChangeDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {mode === 'update' && (
        <div className="mb-3">
          <label className="form-label">Contraseña actual</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>
      )}

      <div className="mb-3">
        <label className="form-label">Nueva contraseña</label>
        <input
          type="password"
          className="form-control"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <div className="mt-1">
          <div className="progress" style={{ height: '6px' }}>
            <div
              className={`progress-bar ${passwordStrength >= 3 ? 'bg-success' : 'bg-danger'}`}
              role="progressbar"
              style={{ width: `${(passwordStrength / 4) * 100}%` }}
            />
          </div>
          <small className="text-muted">
            Seguridad: {['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Muy buena'][passwordStrength]}
          </small>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Confirmar nueva contraseña</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        {mode === 'update' ? 'Update password' : 'Password'}
      </button>

      {message && (
        <div className="alert alert-info mt-3" role="alert">
          {message}
        </div>
      )}
    </form>
  );
};

export default PasswordInput;
