import config from "../../utils/config";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/interceptor";
import { UserContext } from "../../contexts/UserContext.jsx";
import "../../styles/user/UserArea.scss";
import ImageUploader from "../utils/ImageUploader.jsx";

function UserArea() {
  const navigate = useNavigate();
  const { user: loggedUser, loading } = useContext(UserContext);
  useEffect(() => {
    if (!loading && !loggedUser) {
      navigate('/login');
    }
  }, [loading, loggedUser, navigate]);


  // Estados para cambios pendientes
  const [pendingBanner, setPendingBanner] = useState(null);
  const [pendingPfp, setPendingPfp] = useState(null);

  // Handlers para seleccionar archivos
  const handleBannerSelect = (file) => {
    setPendingBanner(file);
  };

  const handlePfpSelect = (file) => {
    setPendingPfp(file);
  };

  // Undo changes
  const undoBannerChange = () => setPendingBanner(null);
  const undoPfpChange = () => setPendingPfp(null);

  // Guardar cambios (aquí iría la llamada a la API para subir las imágenes)
  const handleSaveChanges = async () => {
    try {
      // Ejemplo simple: solo console.log de archivos que subirías
      if (pendingBanner) {
        console.log("Subiendo banner:", pendingBanner);
        // await api call para subir banner...
      }
      if (pendingPfp) {
        console.log("Subiendo perfil:", pendingPfp);
        // await api call para subir pfp...
      }

      // Una vez guardado, limpiar estados pendientes
      setPendingBanner(null);
      setPendingPfp(null);

      // Aquí idealmente refrescar datos usuario (ej: fetch o actualizar contexto)
      // Por simplicidad recargamos la página
      window.location.reload();

    } catch (error) {
      console.error("Error al guardar cambios", error);
    }
  };

  if (loading) {
    return <p>Cargando usuario...</p>;
  }

  return (
    <div className="user-area">
      <h2>@{loggedUser.userName || "unknow"}'s user area</h2>
      <div className="position-relative">
        {/* Banner */}
        <ImageUploader
          src={pendingBanner ? URL.createObjectURL(pendingBanner) : `${config.connection}${loggedUser.banner}`}
          alt={`@${loggedUser.userName}'s banner image`}
          onFileSelect={handleBannerSelect}
          className="img-fluid w-100 rounded"
          style={{
            height: "auto",
            aspectRatio: "5 / 1",
            objectFit: "cover",
            position: "relative",
            border: pendingBanner ? "3px solid yellow" : undefined,
          }}
        />
        {pendingBanner && (
          <div
            onClick={undoBannerChange}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "yellow",
              color: "black",
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "4px",
              cursor: "pointer",
              userSelect: "none",
              zIndex: 20,
            }}
            title="Undo changes"
          >
            Modified
          </div>
        )}

        {/* Imagen de perfil */}
        <div className="position-absolute top-100 start-0 translate-middle-y ms-3" style={{ position: "relative" }}>
          <ImageUploader
            src={pendingPfp ? URL.createObjectURL(pendingPfp) : `${config.connection}${loggedUser.pfp}`}
            alt={`@${loggedUser.userName.toLowerCase()}'s profile picture`}
            onFileSelect={handlePfpSelect}
            className="rounded-circle border border-3 border-white"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: pendingPfp ? "3px solid yellow" : undefined,
              position: "relative",
            }}
          />
          {pendingPfp && (
            <div
              onClick={undoPfpChange}
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                backgroundColor: "yellow",
                color: "black",
                fontWeight: "bold",
                padding: "2px 6px",
                borderRadius: "4px",
                cursor: "pointer",
                userSelect: "none",
                zIndex: 20,
              }}
              title="Undo changes"
            >
              Modified
            </div>
          )}
        </div>
      </div>

      {(pendingBanner || pendingPfp) && (
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={handleSaveChanges}>
            Guardar cambios
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              undoBannerChange();
              undoPfpChange();
            }}
          >
            Descartar todos los cambios
          </button>
        </div>
      )}
    </div >
  );
}

export default UserArea;
