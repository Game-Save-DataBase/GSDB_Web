import React, { useEffect, useState } from 'react';
import NotificationCard from '../utils/NotificationCard';
import api from '../../utils/interceptor';
import config from '../../utils/config';
import '../../styles/user/NotificationBoard.scss';

const NotificationBoard = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${config.api.users}/notifications`);
            setNotifications(res.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const removeNotification = async (notificationId) => {
        try {
            await api.delete(`${config.api.users}/remove-notification/${notificationId}`);
            setNotifications((prev) => prev.filter(n => n._id !== notificationId));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };
    const markAsRead = async (notificationId) => {
        try {
            await api.patch(`${config.api.users}/notification/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
            );
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading) {
        return <div className="notification-board"><p>Loading notifications...</p></div>;
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
