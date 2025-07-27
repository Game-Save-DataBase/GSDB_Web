import React from 'react';
import { Modal, Table, Button } from 'react-bootstrap';

function SaveLocationsModal({ show, onHide, saveLocations }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Install Instructions</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {saveLocations && saveLocations.length > 0 ? (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Ruta</th>
              </tr>
            </thead>
            <tbody>
              {saveLocations.map(({ platformID, platformName, locations, _id }) =>
                locations.map((loc, index) => (
                  <tr key={`${_id}-${index}`}>
                    {index === 0 && (
                      <td rowSpan={locations.length} style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>
                        {platformName}
                      </td>
                    )}
                    <td style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{loc}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        ) : (
          <p>No install instructions available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SaveLocationsModal;
