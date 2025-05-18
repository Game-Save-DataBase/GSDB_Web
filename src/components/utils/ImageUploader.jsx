import React, { useRef, useState } from "react";

function ImageUploader({ src, alt, onFileSelect, className, style }) {
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
            style={{
                position: 'relative', // importante para el texto overlay
                cursor: "pointer",
                filter: hovered ? 'brightness(50%)' : 'none',
                transition: 'filter 0.3s ease',
                ...style
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={handleClick}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    borderRadius: 'inherit',
                }}
            />
            {hovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    Upload...
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
