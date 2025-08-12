import React, { useRef } from "react";
import SafeImage from "../utils/SafeImage.jsx";
import {
  Card,
  ListGroup,
  Container,
  Button,
  Row,
  Col,
} from "react-bootstrap";

import '../../styles/views/View.scss';
import { Link, useLocation } from "react-router-dom";
import UserCertificateBadge from "../utils/UserCertificateBadge.jsx";

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
  openLinksInNewTab = false
}) {
  data = Array.isArray(data) ? data.filter(Boolean) : data ? [data] : [];
  const linkProps = openLinksInNewTab
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  const renderTitle = (item) => {
    const title = item[renderProps.title];
    const link = item[renderProps.link];
    return link ? (
      <Link
        to={link}
        state={{ from: location }}
        style={{ textDecoration: "none", color: "#4b0082" }}
        {...linkProps}
      >
        <strong>{title}</strong>
      </Link>
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

  const location = useLocation();

  return (
    <Container>
      <hr className="container mb-4" />

      {data.length === 0 ? (
        <p className="text-center text-muted">No results found.</p>
      ) : type === "card" ? (
        <Row className="g-4 justify-content-start">
          {data.map((item, idx) => (
            <Col key={idx} xs={6} sm={4} md={3} lg={2} className="px-2">
              <Card className="custom-card shadow-sm">
                {renderProps.image && (
                  <div className="view-game-cover-container position-relative">
                    {/* Imagen */}
                    {item[renderProps.link] ? (
                      <Link
                        to={item[renderProps.link]}
                        state={{ from: location }}
                        style={{ color: "#4b0082", textDecoration: "none" }}
                        {...linkProps}
                      >
                        <SafeImage
                          src={item[renderProps.image]}
                          fallbackSrc={item[renderProps.errorImage]}
                          alt={item[renderProps.title] || "cover"}
                          className="view-game-cover"
                        />
                      </Link>
                    ) : (
                      <SafeImage
                        src={item[renderProps.image]}
                        fallbackSrc={item[renderProps.errorImage]}
                        alt={item[renderProps.title] || "cover"}
                        className="view-game-cover"
                      />
                    )}

                    {/* Badge  */}
                    {renderProps.badge && (
                      <div className="position-absolute bottom-0 end-0 m-1">
                        <UserCertificateBadge badgeType={item[renderProps.badge]} disableTooltip={true} />
                      </div>
                    )}
                  </div>
                )}


                <Card.Body className="card-body-scaled">
                  <div className="card-body-content">
                    <Card.Title className="fs-6 mb-1 text-truncate">
                      {renderTitle(item)}
                    </Card.Title>

                    {renderProps.description && (
                      <Card.Text className="text-muted" style={{ fontSize: "0.65rem" }}>
                        {(() => {
                          const text = item[renderProps.description]?.trim();
                          if (!text || text === "") return "No description";
                          return text.length > 80 ? text.slice(0, 80) + "..." : text;
                        })()}
                      </Card.Text>
                    )}

                    {renderProps.tags && item[renderProps.tags] != null && (
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


                    {renderProps.platforms && item[renderProps.platforms] && (
                      <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <strong>{(!Array.isArray(item[renderProps.platforms]) || (Array.isArray(item[renderProps.platforms]) && item[renderProps.platforms].length === 1)) ?
                          "Platform" : "Platforms"}</strong>: {
                          (Array.isArray(item[renderProps.platforms]) ? item[renderProps.platforms] : [item[renderProps.platforms]])
                            .map((pid) => platformMap[pid?.toString()] || null)
                            .filter(Boolean)
                            .join(" / ")}
                      </Card.Text>
                    )}

                    {renderProps.releaseDate && item[renderProps.releaseDate] && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Release date</strong>: {formatIfDate(item[renderProps.releaseDate])}
                      </Card.Text>
                    )}
                    {renderProps.uploads && item[renderProps.uploads] && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Uploads</strong>: {item[renderProps.uploads] || 0}
                      </Card.Text>
                    )}
                    {renderProps.lastUpdate && item[renderProps.lastUpdate] && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Last update</strong>:{" "}
                        {item[renderProps.lastUpdate]
                          ? formatIfDate(item[renderProps.lastUpdate])
                          : "N/A"}
                      </Card.Text>
                    )}



                    {renderProps.uploadDate && item[renderProps.uploadDate] && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        <strong>Upload date</strong>: {formatIfDate(item[renderProps.uploadDate])}
                      </Card.Text>
                    )}

                    {renderProps.downloads !== undefined && item[renderProps.downloads] != null && (
                      <Card.Text className="text-muted mb-0" style={{ fontSize: "0.75rem" }}>
                        {item[renderProps.downloads]} downloads
                      </Card.Text>
                    )}
                    {renderProps.user && item[renderProps.user] && item[renderProps.user].link ? (
                      <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <span><strong>By:</strong> </span>
                        <Link
                          to={item[renderProps.user].link}
                          state={{ from: location }}
                          style={{ color: "#4b0082", textDecoration: "none" }}
                        >
                          {item[renderProps.user].name}
                        </Link>
                      </Card.Text>
                    ) : renderProps.user && item[renderProps.user] ? (
                      <Card.Text className="text-muted" style={{ fontSize: "0.75rem" }}>
                        <span><strong>By:</strong> {item[renderProps.user].name}</span>
                      </Card.Text>
                    ) : null}
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

            if (renderProps.title && item[renderProps.title]) {
              const titleElement = renderTitle(item);
              elements.push(
                <span key="title" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  {titleElement}
                  {renderProps.badge && (
                    <UserCertificateBadge badgeType={item[renderProps.badge]} />
                  )}
                </span>
              );
            }

            if (renderProps.description) {
              const text = item[renderProps.description]?.trim();
              elements.push(
                <span key="description" style={{ fontSize: "0.75rem", color: "#666" }}>
                  {" — "}
                  {!text || text.length === 0 ? "No description" : (text.length > 80 ? text.slice(0, 80) + "..." : text)}
                </span>
              );
            }

            if (renderProps.releaseDate && item[renderProps.releaseDate])
              elements.push(
                <span key="releaseDate"> — <strong>Release date</strong>: {formatIfDate(item[renderProps.releaseDate])}</span>
              );


            if (renderProps.uploadDate && item[renderProps.uploadDate])
              elements.push(
                <span key="uploadDate"> — <strong>Upload date</strong>: {formatIfDate(item[renderProps.uploadDate])}</span>
              );

            if (renderProps.platforms && item[renderProps.platforms]) {
              const singular = !Array.isArray(item[renderProps.platforms]) || (Array.isArray(item[renderProps.platforms]) && item[renderProps.platforms].length === 1)
              const platforms = (!singular ? item[renderProps.platforms] : [item[renderProps.platforms]])
                .map((pid) => platformMap[pid?.toString()] || null)
                .filter(Boolean)
                .join(" / ");
              if (platforms) {
                elements.push(<span key="platforms"> — <strong>{!singular ? "Platforms" : "Platform"} </strong>: {platforms}</span>);
              }
            }

            if (renderProps.tags && item[renderProps.tags]) {
              elements.push(
                (Array.isArray(item[renderProps.tags]) ? item[renderProps.tags] : [item[renderProps.tags]]).length > 0 ? (
                  <span key="tags"> — <strong>Tags</strong>:{" "}
                    {(Array.isArray(item[renderProps.tags]) ? item[renderProps.tags] : [item[renderProps.tags]]).slice(0, 3).map((tag, i) => (
                      <span key={i} className="tag-pill">{tag}</span>
                    ))}
                  </span>
                ) : (
                  <span key="tags"> — <strong>Tags</strong>: no tags</span>
                )
              );
            }

            if (renderProps.downloads !== undefined && item[renderProps.downloads] != null) {
              elements.push(
                <span key="downloads"> — {item[renderProps.downloads]} downloads</span>
              );
            }
            if (renderProps.uploads !== undefined && item[renderProps.uploads] !== null) {
              elements.push(
                <span key="uploads"> — <strong>Uploads</strong>:{item[renderProps.uploads] || 0}</span>
              );
            }
            if (renderProps.lastUpdate && item[renderProps.lastUpdate] !== null) {
              elements.push(
                <span key="lastUpdate">
                  {" "}— <strong>Last update</strong>:{" "}
                  {item[renderProps.lastUpdate]
                    ? formatIfDate(item[renderProps.lastUpdate])
                    : "N/A"}
                </span>
              );
            }
            if (renderProps.user && item[renderProps.user]) {
              elements.push(
                <span key="user">
                  {" "}
                  — <strong>By</strong>:{" "}
                  <Link
                    to={item[renderProps.link]}
                    state={{ from: location }}
                    style={{ display: "inline" }}
                  >
                    {item[renderProps.user].name}
                  </Link>
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
