import React, { useContext, useState, useEffect } from 'react';
import NotificationCard from '../utils/NotificationCard';
import api from '../../utils/interceptor';
import config from '../../utils/config';
import { UserContext } from '../../contexts/UserContext';
import '../../styles/user/NotificationBoard.scss';

const NotificationBoard = () => {
  const { user, updateUser } = useContext(UserContext);
  const [notifications, setNotifications] = useState([]);

  //pilla las notificaciones cada 30 seg
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return;

      try {
        const res = await api.get(`${config.api.users}/notifications`);
        setNotifications(res.data || []);
      } catch (err) {
        console.error('Error actualizando notificaciones:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]); // se reinicia si cambia el usuario


  useEffect(() => {
    // Cada vez que el usuario cambie, actualizamos el estado local con sus notificaciones
    if (user && Array.isArray(user.notifications)) {
      setNotifications(user.notifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const removeNotification = async (notificationId) => {
    try {
      await api.delete(`${config.api.users}/remove-notification?id=${notificationId}`);
      setNotifications((prev) => prev.filter(n => n._id !== notificationId));
      updateUser()
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`${config.api.users}/read-notification?id=${notificationId}`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (!user) {
    return (
      <div className="notification-board">
        <p className="no-notifications">Log in to see notifications.</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notification-board">
        <p className="no-notifications">No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="notification-board">
      {notifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((notif) => (
          <NotificationCard
            key={notif._id}
            notification={notif}
            onDelete={() => removeNotification(notif._id)}
            onClick={() => markAsRead(notif._id)}
          />
        ))}
    </div>
  );
};

export default NotificationBoard;
