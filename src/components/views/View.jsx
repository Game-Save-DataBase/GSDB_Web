import React, { useRef } from "react";
import {
  Card,
  ListGroup,
  Container,
  Button,
  Row,
  Col,
} from "react-bootstrap";

import '../../styles/views/View.scss';


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
  data = Array.isArray(data) ? data.filter(Boolean) : data ? [data] : [];
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

  const tagRefs = useRef([]);

  const scrollTags = (el, amount) => {
    if (el) el.scrollBy({ left: amount, behavior: "smooth" });
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
              <Card className="custom-card shadow-sm">
                {renderProps.image && (
                  <div className="view-game-cover-container">
                    {item[renderProps.link] ? (
                      <a href={item[renderProps.link]} style={{ display: "block" }}>
                        <img
                          src={item[renderProps.image]}
                          alt={item[renderProps.title] || "cover"}
                          className="view-game-cover"
                          onError={(e) => { e.currentTarget.src = item[renderProps.errorImage]}}
                        />
                      </a>
                    ) : (
                      <img
                        src={item[renderProps.image]}
                        alt={item[renderProps.title] || "cover"}
                        className="view-game-cover"
                          onError={(e) => { e.currentTarget.src = item[renderProps.errorImage]}}
                      />
                    )}
                  </div>
                )}
                <Card.Body className="card-body-scaled">
                  <div className="card-body-content">
                    <Card.Title className="fs-6 mb-1 text-truncate">
                      {renderTitle(item)}
                    </Card.Title>

                    {renderProps.description && (
                      <Card.Text className="text-muted">
                        {(() => {
                          const text = item[renderProps.description]?.trim();
                          if (!text) return "No description";
                          return text.length > 80 ? text.slice(0, 80) + "..." : text;
                        })()}
                      </Card.Text>
                    )}

                    {renderProps.tags && (
                      (() => {
                        const tags = Array.isArray(item[renderProps.tags]) ? item[renderProps.tags] : [];
                        if (tags.length === 0) {
                          return (
                            <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                              No tags
                            </Card.Text>
                          );
                        }

                        return (
                          <div className="position-relative">
                            {tags.length >= 1 && (
                              <button
                                onClick={() => scrollTags(tagRefs[idx], -80)}
                                className="scroll-btn left"
                              >
                                ‹
                              </button>
                            )}
                            <div
                              className="tags-scroll-container"
                              ref={(el) => (tagRefs[idx] = el)}
                            >
                              {tags.map((tag, tagIdx) => (
                                <span key={tagIdx} className="tag-pill">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            {tags.length >= 1 && (
                              <button
                                onClick={() => scrollTags(tagRefs[idx], 80)}
                                className="scroll-btn right"
                              >
                                ›
                              </button>
                            )}
                          </div>
                        );
                      })()
                    )}


                    {renderProps.platforms && Array.isArray(item[renderProps.platforms]) && (
                      <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <strong>Platforms</strong>: {item[renderProps.platforms]
                          .map((pid) => platformMap[pid?.toString()] || null)
                          .filter(Boolean)
                          .join(" / ")}
                      </Card.Text>
                    )}

                    {renderProps.releaseDate && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Release date</strong>: {formatIfDate(item[renderProps.releaseDate])}
                      </Card.Text>
                    )}
                    {renderProps.uploads !== undefined && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Uploads</strong>: {item[renderProps.uploads]}
                      </Card.Text>
                    )}
                    {renderProps.lastUpdate && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Last update</strong>:{" "}
                        {item[renderProps.lastUpdate]
                          ? formatIfDate(item[renderProps.lastUpdate])
                          : "N/A"}
                      </Card.Text>
                    )}



                    {renderProps.uploadDate && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Upload date</strong>: {formatIfDate(item[renderProps.uploadDate])}
                      </Card.Text>
                    )}

                    {renderProps.downloads !== undefined && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        {item[renderProps.downloads]} downloads
                      </Card.Text>
                    )}
                    {renderProps.user && item[renderProps.user] && (
                      <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <span><strong>By:</strong>: </span>
                        <a
                          href={item[renderProps.user].link}
                          style={{ color: "#4b0082", textDecoration: "none" }}
                        >
                          {item[renderProps.user].name}
                        </a>
                      </Card.Text>
                    )}
                  </div>
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
                <span key="releaseDate"> — <strong>Release date</strong>: {formatIfDate(item[renderProps.releaseDate])}</span>
              );
            if (renderProps.lastUpdate) {
              elements.push(
                <span key="lastUpdate">
                  {" "}— <strong>Last update</strong>:{" "}
                  {item[renderProps.lastUpdate]
                    ? formatIfDate(item[renderProps.lastUpdate])
                    : "N/A"}
                </span>
              );
            }

            if (renderProps.uploadDate)
              elements.push(
                <span key="uploadDate"> — <strong>Upload date</strong>: {formatIfDate(item[renderProps.uploadDate])}</span>
              );
            // if (renderProps.description) {
            //   const desc = item[renderProps.description]?.trim();
            //   elements.push(
            //     <span key="desc"> — {desc ? desc.slice(0, 80) + "..." : "No description"}</span>
            //   );
            // }

            if (renderProps.platforms && Array.isArray(item[renderProps.platforms])) {
              const platforms = item[renderProps.platforms]
                .map((pid) => platformMap[pid?.toString()] || null)
                .filter(Boolean)
                .join(" / ");
              if (platforms) {
                elements.push(<span key="platforms"> — <strong>Platforms</strong>: {platforms}</span>);
              }
            }

            if (renderProps.tags && Array.isArray(item[renderProps.tags])) {
              elements.push(
                <span key="tags"> — <strong>Tags</strong>: {" "}
                  {item[renderProps.tags].slice(0, 3).map((tag, i) => (
                    <span key={i} className="tag-pill">{tag}</span>
                  ))}
                </span>
              );
            }

            if (renderProps.downloads !== undefined) {
              elements.push(
                <span key="downloads"> — {item[renderProps.downloads]} downloads</span>
              );
            }

            if (renderProps.user && item[renderProps.user]) {
              elements.push(
                <span key="user">
                  {" "}
                  — <strong>By</strong>:{" "}
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
