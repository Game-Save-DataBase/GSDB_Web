import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/interceptor';
import NotificationTemplates from './NotificationTemplates';


const UserFollowButton = ({ user, loggedUser}) => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  // Detectar si ya sigue al usuario
  useEffect(() => {
    if (loggedUser && user) {
      const following = loggedUser.following.some(id => id.toString() === user._id.toString());
      setIsFollowing(following);
    }
  }, [loggedUser, user]);

  const handleFollow = async () => {
    if (!loggedUser) {
      navigate('/login');
      return;
    }
    if (loggedUser._id === user._id) {
      return; // no debería pasar pero por si acaso
    }
    try {
      if (isFollowing) {
        // Hacer unfollow
        await api.post(`/api/users/unfollow`, {
          toUnfollow: user._id,
        });
        setIsFollowing(false);
      } else {
        // Hacer follow
        await api.post(`/api/users/follow`, {
          toFollow: user._id,
        });
        setIsFollowing(true);
        const notification = NotificationTemplates.newFollower({
          followerUser: loggedUser
        });
        await api.post(`/api/users/send-notification`, 
          { toUserId: user._id,
            ...notification
          }
        );
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
      disabled={loggedUser && loggedUser._id === user._id}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default UserFollowButton;
