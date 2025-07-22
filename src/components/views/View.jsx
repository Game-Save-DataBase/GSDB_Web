import React from "react";
import { Card, ListGroup } from "react-bootstrap";
function formatIfDate(value) {
  const date = new Date(value);
  if (!isNaN(date)) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque enero es 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return value;
}

function View({ data = [], type = "list", renderProps = {} }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-muted text-center">No results</p>;
  }
  const renderTitle = (item) => {
    const title = item[renderProps.title];
    const link = item[renderProps.link];

    return link ? (
      <a href={link} style={{ textDecoration: "none" }}>{title}</a>
    ) : (
      title
    );
  };

  if (type === "card") {
    return (
      <div className="d-flex flex-wrap justify-content-start gap-3">
        {data.map((item, idx) => (
          <Card style={{ width: "18rem" }} key={idx}>
            {renderProps.image && (
              <Card.Img variant="top" src={item[renderProps.image]} />
            )}
            <Card.Body>
              <Card.Title>{renderTitle(item)}</Card.Title>

              {renderProps.releaseDate && (
                <Card.Subtitle className="mb-2 text-muted">
                  Release date: {formatIfDate(item[renderProps.releaseDate])}
                </Card.Subtitle>
              )}

              {renderProps.description && (
                <Card.Text>{item[renderProps.description]}</Card.Text>
              )}

              {renderProps.uploads !== undefined && (
                <Card.Text className="mt-2">
                  <small className="text-muted">
                    Uploads: {item[renderProps.uploads] ?? 0}
                  </small>
                </Card.Text>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    );
  }

  // Default to list view
  return (
    <ListGroup>
      {data.map((item, idx) => {
        const elements = [];

        if (renderProps.title) elements.push(<strong key="title">{renderTitle(item)}</strong>);
        if (renderProps.releaseDate) elements.push(
          <span key="releaseDate"> — Release date: {formatIfDate(item[renderProps.releaseDate])}</span>
        );
        if (renderProps.description) elements.push(
          <span key="desc"> — {item[renderProps.description]}</span>
        );
        if (renderProps.uploads !== undefined) elements.push(
          <span key="uploads"> — Uploads: {item[renderProps.uploads] ?? 0}</span>
        );

        return (
          <ListGroup.Item key={idx}>
            {elements}
          </ListGroup.Item>
        );
      })}
    </ListGroup>
  );
}

export default View;
