import config from "../../utils/config";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/interceptor";
import { UserContext } from "../../contexts/UserContext.jsx";
import "../../styles/user/UserArea.scss";
import ImageUploader from "../utils/ImageUploader.jsx";
import PasswordInput from "../utils/PasswordInput.jsx";

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
  //para las alertas y la actualizacion visual
  const [alertMessage, setAlertMessage] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false)

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

      if (!isSavingAll) updateUser();
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

  const saveBanner = async () => {
    try {
      const userId = loggedUser._id;

      if (pendingBanner) {
        const formData = new FormData();
        formData.append("image", pendingBanner);

        await api.post(`${config.api.users}/${userId}/upload/banner`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      setPendingBanner(null);

      if (!isSavingAll) updateUser();
    } catch (error) {
      console.error("Error al guardar cambios", error);
      alert("Hubo un error al subir las imágenes.");
    }
  };

  const savePfp = async () => {
    try {
      const userId = loggedUser._id;


      if (pendingPfp) {
        const formData = new FormData();
        formData.append("image", pendingPfp);

        await api.post(`${config.api.users}/${userId}/upload/pfp`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      setPendingPfp(null);

      if (!isSavingAll) updateUser();
    } catch (error) {
      console.error("Error al guardar cambios", error);
      alert("Hubo un error al subir las imágenes.");
    }
  };

  const handlePasswordUpdate = async ({ currentPassword, newPassword }) => {
    try {
      console.log(newPassword); console.log(currentPassword);
      // verificamos a nivel de servidor porque la contraseña esta encriptada
      const verifyRes = await api.post(`${config.api.users}/verify-password`, {
        password: currentPassword
      });

      if (!verifyRes.data.valid) {
        setAlertMessage('Current password is not correct.');
        return;
      }

      // Actualizar contraseña
      await api.put(`${config.api.users}/${loggedUser._id}`, {
        password: newPassword
      });

      setAlertMessage('Password updated correctly');
    } catch (err) {
      setAlertMessage(err.response?.data?.error || 'Error changing password.');
    }
  };


  const hasPendingChanges = () =>
    hasAliasChanged || hasUserNameChanged || hasBioChanged || hasMailChanged || pendingBanner || pendingPfp;

  const saveAll = () => {
    setIsSavingAll(true);
    if (hasAliasChanged) saveField("alias", alias);
    if (hasUserNameChanged) saveField("userName", userName);
    if (hasBioChanged) saveField("bio", bio);
    if (hasMailChanged) saveField("mail", mail);
    if (pendingBanner) saveBanner();
    if (pendingPfp) savePfp();
    setIsSavingAll(false);
    updateUser();
  };

  const discardAll = () => {
    undoField("alias");
    undoField("userName");
    undoField("bio");
    undoField("mail");
    undoBannerChange();
    undoPfpChange();
  };


  return (
    <div className="user-area">
      <h2 className="d-flex align-items-center justify-content-between">
        @{loggedUser.userName || "unknow"}'s user area

        {hasPendingChanges() && (
          <div className="ms-3 d-flex gap-2">
            <button className="btn btn-success btn-sm" onClick={saveAll}>
              Save all changes
            </button>
            <button className="btn btn-secondary btn-sm" onClick={discardAll}>
              Discard all changes
            </button>
          </div>
        )}
      </h2>

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
          src={pendingBanner ? URL.createObjectURL(pendingBanner) : `${config.connection}${loggedUser.banner}?${Date.now()}`}
          alt="Banner"
          onFileSelect={handleBannerSelect}
          onSave={saveBanner}
          onUndo={undoBannerChange}
          hasPending={!!pendingBanner}
          className="img-fluid w-100 rounded"
          style={{
            aspectRatio: "5 / 1",
            objectFit: "cover",
            border: pendingBanner ? "3px solid yellow" : undefined,
          }}
        />



        {/* Imagen de perfil */}
        <div className="position-absolute top-100 start-0 translate-middle-y ms-3">
          <ImageUploader
            src={pendingPfp ? URL.createObjectURL(pendingPfp) : `${config.connection}${loggedUser.pfp}?${Date.now()}`}
            alt="Profile"
            onFileSelect={handlePfpSelect}
            onSave={savePfp}
            onUndo={undoPfpChange}
            hasPending={!!pendingPfp}
            className="rounded-circle border border-3 border-white"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: pendingPfp ? "3px solid yellow" : undefined,
            }}
          />
        </div>
      </div>

      {/* Campos editables */}
      <div className="mt-5">
        {[
          {
            label: "Alias", value: alias, onChange: (val) => {setAlias(val);setIsAliasDirty(true);}, changed: hasAliasChanged, field: "alias" },
        {label: "Nombre de usuario", value: userName, onChange: (val) => {setUserName(val);setIsUserNameDirty(true);}, changed: hasUserNameChanged, field: "userName" },
        {label: "Bio", value: bio, onChange: (val) => {setBio(val);setIsBioDirty(true);}, changed: hasBioChanged, field: "bio", multiline: true },
        {label: "Mail", value: mail, onChange: (val) => {setMail(val);setIsMailDirty(true);}, changed: hasMailChanged, field: "mail" },
        ].map(({label, value, onChange, changed, field, multiline}) => (
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

      <hr />
      <PasswordInput mode="update" onSubmit={handlePasswordUpdate} />

    </div>
  );
}

export default UserArea;
