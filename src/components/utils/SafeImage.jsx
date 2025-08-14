import React, { useState, useEffect } from "react";

function SafeImage({ src, fallbackSrc, alt, ...props }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkImage() {
      try {
        const response = await fetch(src, { method: "HEAD" });

        if (!isMounted) return;
        if(src===undefined){
          setImgSrc(fallbackSrc)
          setLoading(false);
          return;
        }
        if (response.status === 204 || !response.ok) {
          // Si status 204 o no ok (404, etc) usamos fallback
          setImgSrc(fallbackSrc);
        } else {
          // Si está ok, usamos la imagen original
          setImgSrc(src);
        }
      } catch (error) {
        if (isMounted) setImgSrc(fallbackSrc);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkImage();

    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  if (loading) return null;

  return <img src={imgSrc} alt={alt} {...props} />;
}

export default SafeImage;
