import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import "../../styles/utils/RelatedUsersModal.scss";

function RelatedUsersModal({ show, onHide, title, users }) {
    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {users && users.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                        {users.map((user) => (
                            <div className='user-card' key={user.userID}>
                                <img
                                    src={user.avatar || `${config.api.assets}/defaults/pfp}`}
                                    alt={user.alias || user.userName}
                                    className="user-card-img"
                                />
                                <div className='user-card-content'>
                                    <div className='user-card-title'>
                                        <a href={user.url} target="_blank" rel="noopener noreferrer">
                                            @{user.userName} {user.alias && `- ${user.alias}`}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay usuarios para mostrar.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default RelatedUsersModal    