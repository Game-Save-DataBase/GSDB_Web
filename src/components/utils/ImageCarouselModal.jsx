// src/components/common/ImageCarouselModal.jsx
import React from 'react';
import { Modal, Carousel } from 'react-bootstrap';

const ImageCarouselModal = ({ show, onClose, images, activeIndex, setActiveIndex }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton />
      <Modal.Body>
        <Carousel activeIndex={activeIndex} onSelect={setActiveIndex} interval={null}>
          {images.map((imgSrc, idx) => (
            <Carousel.Item key={idx}>
              <img
                className="d-block w-100"
                src={imgSrc}
                alt={`Slide ${idx + 1}`}
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      </Modal.Body>
    </Modal>
  );
};

export default ImageCarouselModal;
