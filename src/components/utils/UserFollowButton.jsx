import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import NotificationTemplates from './NotificationTemplates';
import config from '../../utils/config'


const UserFollowButton = ({ user, loggedUser }) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // Detectar si ya sigue al usuario
  useEffect(() => {
    if (loggedUser && user) {
      const following = loggedUser.following.some(id => id === user.userID);
      setIsFollowing(following);
    }
  }, [loggedUser, user]);

  const handleFollow = async () => {
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    if (loggedUser.userID === user.userID) {
      return; // no debería pasar pero por si acaso
    }
    try {
      if (!isFollowing) {
        // Hacer follow
        await api.post(`${config.api.users}/follow-toggle`, {
          targetId: user.userID, action: 'follow'
        });
        setIsFollowing(true);
        const notification = NotificationTemplates.newFollower({
          followerUser: loggedUser
        });
        await api.post(`${config.api.users}/send-notification?userID=${user.userID}`,
          {
            ...notification
          }
        );
      } else {
        // Hacer unfollow
        await api.post(`${config.api.users}/follow-toggle`, {
          targetId: user.userID, action: 'unfollow'
        });
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('Error al seguir/dejar de seguir al usuario:', err);
      alert('Hubo un error al actualizar el seguimiento.');
    }
  };

  return (
    <button
      className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
      onClick={handleFollow}
      disabled={loggedUser && loggedUser.userID === user.userID}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default UserFollowButton;
