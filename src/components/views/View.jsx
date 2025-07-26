import React from "react";
import {
  Card,
  ListGroup,
  Container,
  Button,
  Row,
  Col,
} from "react-bootstrap";

function formatIfDate(value) {
  const date = new Date(value);
  if (!isNaN(date)) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return value;
}

function View({
  data = [],
  type = "list",
  renderProps = {},
  limit = 10,
  offset = 0,
  currentPage = 1,
  hasMore = false,
  onPageChange = () => { },
  platformMap = {},
}) {
  data = Array.isArray(data) ? data : data ? [data] : [];
  const renderTitle = (item) => {
    const title = item[renderProps.title];
    const link = item[renderProps.link];

    return link ? (
      <a href={link} style={{ textDecoration: "none", color: "#4b0082" }}>
        <strong>{title}</strong>
      </a>
    ) : (
      <strong>{title}</strong>
    );
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasMore) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Container>
      <hr className="mb-4" />

      {data.length === 0 ? (
        <p className="text-center text-muted">No results found.</p>
      ) : type === "card" ? (
        <Row className="g-4 justify-content-start">
          {data.map((item, idx) => (
            <Col
              key={idx}
              style={{ flex: "0 0 20%", maxWidth: "20%" }}
              className="px-2"
            >
              <Card
                className="h-100 shadow-sm d-flex flex-column"
                style={{
                  height: "360px",
                  overflow: "hidden",
                }}
              >
                {renderProps.image && (
                  <div
                    style={{
                      height: "360px",
                      width: "100%",
                      overflow: "hidden",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={item[renderProps.image]}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}

                <Card.Body className="d-flex flex-column px-2 py-2">
                  <Card.Title className="fs-6 mb-1 text-truncate">
                    {renderTitle(item)}
                  </Card.Title>

                  {renderProps.description && (
                    <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {item[renderProps.description]?.slice(0, 80)}...
                    </Card.Text>
                  )}

                  {renderProps.tags && Array.isArray(item[renderProps.tags]) && (
                    <Card.Text className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                      {item[renderProps.tags].slice(0, 3).join(" • ")}
                    </Card.Text>
                  )}

                  {renderProps.platforms && Array.isArray(item[renderProps.platforms]) && (
                    <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                      {item[renderProps.platforms]
                        .map((pid) => platformMap[pid?.toString()] || null)
                        .filter(Boolean)
                        .join(" / ")}
                    </Card.Text>
                  )}

                  {renderProps.uploads !== undefined && (
                    <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      By: {item[renderProps.uploads] ?? "Unknown"}
                    </Card.Text>
                  )}

                  {renderProps.releaseDate && (
                    <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      {formatIfDate(item[renderProps.releaseDate])}
                    </Card.Text>
                  )}

                  {renderProps.downloads !== undefined && (
                    <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                      {item[renderProps.downloads]} downloads
                    </Card.Text>
                  )}
                  {renderProps.user && item[renderProps.user] && (
                    <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                      <span>By: </span>
                      <a
                        href={item[renderProps.user].link}
                        style={{ color: "#4b0082", textDecoration: "none" }}
                      >
                        {item[renderProps.user].name}
                      </a>
                    </Card.Text>
                  )}

                </Card.Body>

              </Card>
            </Col>
          ))}
        </Row>

      ) : (
        <ListGroup>
          {data.map((item, idx) => {
            const elements = [];

            if (renderProps.title)
              elements.push(<strong key="title">{renderTitle(item)}</strong>);
            if (renderProps.releaseDate)
              elements.push(
                <span key="releaseDate"> — {formatIfDate(item[renderProps.releaseDate])}</span>
              );
            {
              renderProps.description && (
                <span key="desc"> — {item[renderProps.description]?.slice(0, 80)}...</span>
              )
            }
            {
              renderProps.tags && Array.isArray(item[renderProps.tags]) && (
                <span key="tags"> — Tags: {item[renderProps.tags].slice(0, 3).join(", ")}</span>
              )
            }
            {
              renderProps.downloads !== undefined && (
                <span key="downloads"> — {item[renderProps.downloads]} downloads</span>
              )
            }
            if (renderProps.user && item[renderProps.user]) {
              elements.push(
                <span key="user">
                  {" "}
                  — By:{" "}
                  <a href={item[renderProps.user].link} style={{ color: "#4b0082" }}>
                    {item[renderProps.user].name}
                  </a>
                </span>
              );
            }

            return <ListGroup.Item key={idx}>{elements}</ListGroup.Item>;
          })}
        </ListGroup>
      )}

      {/* Pagination Controls */}
      <div className="d-flex justify-content-between align-items-center mt-4">
        <Button
          variant="outline-secondary"
          onClick={handlePrev}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <span className="text-muted">
          Page {currentPage}
        </span>
        <Button
          variant="outline-secondary"
          onClick={handleNext}
          disabled={!hasMore}
        >
          Next
        </Button>
      </div>
    </Container>
  );
}

export default View;
