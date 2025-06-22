import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/utils/NotificationCard.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes  } from '@fortawesome/free-solid-svg-icons';

const NotificationCard = ({ notification, onClick, onDelete }) => {
    if (!notification) return null;

    const {
        type,
        title,
        body,
        read = false,
        createdAt,
        link
    } = notification;

    const handleDelete = (e) => {
        e.stopPropagation(); // evitar que afecte otros eventos
        if (onDelete) onDelete();
    };

    const TitleElement = () => {
        const titleProps = {
            className: "notification-title",
            onClick: onClick
        };

        return link ? (
            <Link to={link} {...titleProps}>
                {title}
            </Link>
        ) : (
            <span {...titleProps}>
                {title}
            </span>
        );
    };

    return (
        <div className={`notification-card ${read ? 'read' : 'unread'}`}>
            <div className="notification-header">
                <h5>
                    <TitleElement />
                </h5>
                {onDelete && (
                    <button
                        className="notification-delete-button"
                        onClick={handleDelete}
                        title="Eliminar notificación"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
            <p className="notification-body">{body}</p>
            {createdAt && (
                <p className="notification-date">
                    {new Date(createdAt).toLocaleString()}
                </p>
            )}
        </div>
    );
};

export default NotificationCard;
