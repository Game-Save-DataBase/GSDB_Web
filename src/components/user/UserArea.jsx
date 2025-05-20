import config from "../../utils/config";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/interceptor";
import { UserContext } from "../../contexts/UserContext.jsx";
import "../../styles/user/UserArea.scss";
import ImageUploader from "../utils/ImageUploader.jsx";

function UserArea() {
  const navigate = useNavigate();
  const { user: loggedUser, loading, updateUser } = useContext(UserContext);

  useEffect(() => {
    if (!loading && !loggedUser) {
      navigate('/login');
    }
  }, [loading, loggedUser, navigate]);

  // Imagen
  const [pendingBanner, setPendingBanner] = useState(null);
  const [pendingPfp, setPendingPfp] = useState(null);
  const handleBannerSelect = (file) => setPendingBanner(file);
  const handlePfpSelect = (file) => setPendingPfp(file);
  const undoBannerChange = () => setPendingBanner(null);
  const undoPfpChange = () => setPendingPfp(null);
  const [alertMessage, setAlertMessage] = useState(null);


  // Campos editables
  const [alias, setAlias] = useState("");
  const [isAliasDirty, setIsAliasDirty] = useState(false);

  const [userName, setUserName] = useState("");
  const [isUserNameDirty, setIsUserNameDirty] = useState(false);

  const [bio, setBio] = useState("");
  const [isBioDirty, setIsBioDirty] = useState(false);

  const [mail, setMail] = useState("");
  const [isMailDirty, setIsMailDirty] = useState(false);



  useEffect(() => {
    if (!loading && loggedUser) {
      if (!isAliasDirty) setAlias(loggedUser.alias || "");
      if (!isUserNameDirty) setUserName(loggedUser.userName || "");
      if (!isBioDirty) setBio(loggedUser.bio || "");
      if (!isMailDirty) setMail(loggedUser.mail || "");
    }
  }, [loading, loggedUser]);



  if (loading || !loggedUser) return <p>Cargando usuario...</p>;


  // Detectar cambios
  const hasAliasChanged = alias !== loggedUser.alias;
  const hasUserNameChanged = userName !== loggedUser.userName;
  const hasBioChanged = bio !== loggedUser.bio;
  const hasMailChanged = mail !== loggedUser.mail;
  const saveField = async (field, value) => {
    try {
      const trimmed = value.trim();

      if (field === "userName") {
        if (trimmed.length > 15) {
          setAlertMessage("El nombre de usuario no puede tener más de 15 caracteres.");
          setTimeout(() => setAlertMessage(null), 5000);
          return;
        }
        const valid = /^[a-z0-9_]+$/.test(trimmed); // solo minúsculas, números y _
        if (!valid) {
          setAlertMessage("El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos.");
          setTimeout(() => setAlertMessage(null), 5000);
          return;
        }
      }

      if (field === "bio") {
        const lines = trimmed.split("\n");
        if (lines.length > 5) {
          setAlertMessage("La biografía no puede tener más de 5 líneas.");
          setTimeout(() => setAlertMessage(null), 5000);
          return;
        }
      }

      const res = await api.put(`${config.api.users}/${loggedUser._id}`, { [field]: trimmed });

      switch (field) {
        case "alias":
          setAlias(res.data.alias);
          setIsAliasDirty(false);
          break;
        case "userName":
          setUserName(res.data.userName);
          setIsUserNameDirty(false);
          break;
        case "bio":
          setBio(res.data.bio);
          setIsBioDirty(false);
          break;
        case "mail":
          setMail(res.data.mail);
          setIsMailDirty(false);
          break;
      }

      updateUser();
    } catch (err) {
      console.error(`Error al actualizar ${field}:`, err);
      setAlertMessage("Error al guardar. Inténtalo de nuevo.");
      setTimeout(() => setAlertMessage(null), 5000);
    }
  };


  const undoField = (field) => {
    switch (field) {
      case "alias":
        setAlias(loggedUser.alias || "");
        setIsAliasDirty(false);
        break;
      case "userName":
        setUserName(loggedUser.userName || "");
        setIsUserNameDirty(false);
        break;
      case "bio":
        setBio(loggedUser.bio || "");
        setIsBioDirty(false);
        break;
      case "mail":
        setMail(loggedUser.mail || "");
        setIsMailDirty(false);
        break;
      default:
        break;
    }
  };

  // Guardar cambios de imágenes
  const handleSaveChanges = async () => {
    try {
      if (pendingBanner) {
        console.log("Subiendo banner:", pendingBanner);
        // Subir banner...
      }
      if (pendingPfp) {
        console.log("Subiendo perfil:", pendingPfp);
        // Subir pfp...
      }

      setPendingBanner(null);
      setPendingPfp(null);
      window.location.reload();
    } catch (error) {
      console.error("Error al guardar cambios", error);
    }
  };


  return (
    <div className="user-area">
      <h2>@{loggedUser.userName || "unknow"}'s user area</h2>
      {alertMessage && (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "auto",
            maxWidth: "600px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          {alertMessage}
          <button type="button" className="btn-close" onClick={() => setAlertMessage(null)}></button>
        </div>
      )}


      <div className="position-relative">
        {/* Banner */}
        <ImageUploader
          src={pendingBanner ? URL.createObjectURL(pendingBanner) : `${config.connection}${loggedUser.banner}`}
          alt="Banner"
          onFileSelect={handleBannerSelect}
          className="img-fluid w-100 rounded"
          style={{
            aspectRatio: "5 / 1",
            objectFit: "cover",
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
              zIndex: 20,
            }}
          >
            Modified
          </div>
        )}

        {/* Imagen de perfil */}
        <div className="position-absolute top-100 start-0 translate-middle-y ms-3">
          <ImageUploader
            src={pendingPfp ? URL.createObjectURL(pendingPfp) : `${config.connection}${loggedUser.pfp}`}
            alt="Profile"
            onFileSelect={handlePfpSelect}
            className="rounded-circle border border-3 border-white"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: pendingPfp ? "3px solid yellow" : undefined,
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
                zIndex: 20,
              }}
            >
              Modified
            </div>
          )}
        </div>
      </div>

      {/* Campos editables */}
      <div className="mt-5">
        {[
          { label: "Alias", value: alias, onChange: setAlias, changed: hasAliasChanged, field: "alias" },
          { label: "Nombre de usuario", value: userName, onChange: setUserName, changed: hasUserNameChanged, field: "userName" },
          { label: "Bio", value: bio, onChange: setBio, changed: hasBioChanged, field: "bio", multiline: true },
          { label: "Mail", value: mail, onChange: setMail, changed: hasMailChanged, field: "mail" },
        ].map(({ label, value, onChange, changed, field, multiline }) => (
          <div className="mb-3 d-flex align-items-center" key={field}>
            <div className="flex-grow-1 me-3">
              <label className="form-label">{label}</label>
              {multiline ? (
                <textarea
                  className="form-control"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 5 * 24)}px`; // 24px ≈ 1 línea
                  }}
                  rows={3}
                  style={{
                    overflow: 'hidden',
                    resize: 'none',
                    maxHeight: `${5 * 24}px`
                  }}
                />
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={value ?? ""}
                  onChange={(e) => onChange(e.target.value)}
                />
              )}
            </div>
            {changed && (
              <div className="btn-group mt-4">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => saveField(field, value.trim())}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => undoField(field)}
                >
                  Undo
                </button>
              </div>
            )}
          </div>
        ))}
      </div>



      {(pendingBanner || pendingPfp) && (
        <div className="mt-4">
          <button className="btn btn-success me-2" onClick={handleSaveChanges}>
            Guardar imágenes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              undoBannerChange();
              undoPfpChange();
            }}
          >
            Descartar cambios de imagen
          </button>
        </div>
      )}
    </div>
  );
}

export default UserArea;
