import React, { useRef, useState } from "react";

function ImageUploader({ src, alt, onFileSelect, onSave, onUndo, hasPending, className, style }) {
  const fileInputRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div
      className={className}
      style={{ position: "relative", ...style }}
    >
      {/* Imagen interactiva */}
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          borderRadius: "inherit",
          overflow: "hidden",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <img
          src={src}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "inherit",
            filter: hovered ? "brightness(50%)" : "none",
            transition: "filter 0.3s ease",
          }}
        />
        {hovered && (
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              fontSize: "1.2rem",
              pointerEvents: "none",
              userSelect: "none",
              zIndex: 1,
            }}
          >
            Upload...
          </div>
        )}
      </div>

      {/* Botones (fuera del área de hover) */}
      {hasPending && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
            display: "flex",
            gap: "0.5rem",
            zIndex: 2,
          }}
        >
          <button className="btn btn-success btn-sm" onClick={onSave}>
            Save
          </button>
          <button className="btn btn-secondary btn-sm" onClick={onUndo}>
            Undo
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default ImageUploader;
