import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function ProfileComponent({ user, onUserUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Inicializar profileData cuando cambie el usuario
  useEffect(() => {
    if (user) {
      setProfileData({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        direccion: user.direccion || "",
        dni: user.dni || "",
        fechaNacimiento: user.fechaNacimiento || "",
        genero: user.genero || "",
        estadoCivil: user.estadoCivil || "",
        telefonoEmergencia: user.telefonoEmergencia || "",
        // Para psicólogos
        especialidad: user.especialidad || "",
        colegiatura: user.colegiatura || "",
        universidad: user.universidad || "",
        aniosExperiencia: user.aniosExperiencia || "",
        descripcion: user.descripcion || "",
        tarifaConsulta: user.tarifaConsulta || "",
        horarioAtencion: user.horarioAtencion || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. Máximo 5MB permitido");
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadProfilePhoto = async () => {
    if (!selectedFile) {
      alert("Por favor selecciona una imagen");
      return;
    }

    setPhotoLoading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);

    try {
      const response = await axios.post(
        `${API_BASE}/users/${user.id}/upload-photo`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      alert("✅ Foto de perfil actualizada exitosamente");
      setSelectedFile(null);
      setUploadProgress(0);

      // Actualizar datos del usuario inmediatamente
      const updatedUser = { ...user, fotoPerfil: response.data.photoUrl };
      onUserUpdate(updatedUser);

      console.log("✅ Foto de perfil actualizada y usuario sincronizado");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert(
        "❌ Error al subir la foto: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      // Filtrar solo los campos que han cambiado
      const changedFields = {};
      Object.keys(profileData).forEach((key) => {
        if (profileData[key] !== user[key]) {
          changedFields[key] = profileData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        alert("No hay cambios para guardar");
        setLoading(false);
        return;
      }

      console.log("Actualizando campos:", changedFields);

      const response = await axios.put(
        `${API_BASE}/users/${user.id}`,
        changedFields
      );

      if (response.status === 200) {
        alert("✅ Perfil actualizado exitosamente");

        // Actualizar el usuario con los nuevos datos
        const updatedUser = { ...user, ...response.data };
        onUserUpdate(updatedUser);

        setShowModal(false);
        console.log("✅ Perfil actualizado y usuario sincronizado");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        "❌ Error al actualizar perfil: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const getProfileImageUrl = () => {
    if (user.fotoPerfil) {
      return `${API_BASE}${user.fotoPerfil}`;
    }
    return null;
  };

  const renderProfileImage = () => {
    const imageUrl = getProfileImageUrl();

    if (imageUrl) {
      return (
        <div>
          <img
            src={imageUrl}
            alt="Foto de perfil"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #3182ce",
            }}
            onError={(e) => {
              // Si la imagen falla, ocultar y mostrar el fallback
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "3rem",
              fontWeight: "bold",
              border: "4px solid #3182ce",
            }}
          >
            {user.nombre.charAt(0).toUpperCase()}
          </div>
        </div>
      );
    }

    return (
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "3rem",
          fontWeight: "bold",
          border: "4px solid #3182ce",
        }}
      >
        {user.nombre.charAt(0).toUpperCase()}
      </div>
    );
  };

  const renderBasicFields = () => (
    <>
      <div className="form-row">
        <div>
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            name="nombre"
            className="form-control"
            value={profileData.nombre}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={profileData.email}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            className="form-control"
            value={profileData.telefono}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="form-label">DNI</label>
          <input
            type="text"
            name="dni"
            className="form-control"
            value={profileData.dni}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label className="form-label">Fecha de nacimiento</label>
          <input
            type="date"
            name="fechaNacimiento"
            className="form-control"
            value={profileData.fechaNacimiento}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="form-label">Género</label>
          <select
            name="genero"
            className="form-control select-control"
            value={profileData.genero}
            onChange={handleInputChange}
          >
            <option value="">Seleccionar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
            <option value="Prefiero no decir">Prefiero no decir</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div>
          <label className="form-label">Dirección</label>
          <input
            type="text"
            name="direccion"
            className="form-control"
            value={profileData.direccion}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="form-label">Teléfono de emergencia</label>
          <input
            type="tel"
            name="telefonoEmergencia"
            className="form-control"
            value={profileData.telefonoEmergencia}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </>
  );

  const renderPsychologistFields = () => (
    <>
      <div className="form-row">
        <div>
          <label className="form-label">Especialidad</label>
          <input
            type="text"
            name="especialidad"
            className="form-control"
            value={profileData.especialidad}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="form-label">Colegiatura (CMP)</label>
          <input
            type="text"
            name="colegiatura"
            className="form-control"
            value={profileData.colegiatura}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label className="form-label">Universidad</label>
          <input
            type="text"
            name="universidad"
            className="form-control"
            value={profileData.universidad}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="form-label">Años de experiencia</label>
          <input
            type="number"
            name="aniosExperiencia"
            className="form-control"
            value={profileData.aniosExperiencia}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>
      <div className="form-row">
        <div>
          <label className="form-label">Tarifa por consulta (S/)</label>
          <input
            type="number"
            name="tarifaConsulta"
            className="form-control"
            value={profileData.tarifaConsulta}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
        </div>
      </div>
      <div>
        <label className="form-label">Descripción profesional</label>
        <textarea
          name="descripcion"
          className="form-control"
          rows="4"
          value={profileData.descripcion}
          onChange={handleInputChange}
          placeholder="Describe tu experiencia y enfoque terapéutico..."
        />
      </div>
      <div>
        <label className="form-label">Horario de atención</label>
        <textarea
          name="horarioAtencion"
          className="form-control"
          rows="3"
          value={profileData.horarioAtencion}
          onChange={handleInputChange}
          placeholder="Ejemplo: Lunes a Viernes 9:00 AM - 6:00 PM, Sábados 9:00 AM - 1:00 PM"
        />
      </div>
    </>
  );

  return (
    <div>
      {/* Profile Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mi Perfil</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ✏️ Editar Perfil
          </button>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "2rem",
              alignItems: "flex-start",
            }}
          >
            {/* Profile Image Section */}
            <div style={{ textAlign: "center" }}>
              {renderProfileImage()}
              <div style={{ marginTop: "1rem" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: "none" }}
                  id="photo-upload"
                />

                {selectedFile && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
                      {selectedFile.name}
                    </p>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={uploadProfilePhoto}
                      disabled={photoLoading}
                      style={{ width: "100%" }}
                    >
                      {photoLoading ? "Subiendo..." : "📤 Subir Foto"}
                    </button>
                    {uploadProgress > 0 && (
                      <div
                        style={{
                          width: "100%",
                          height: "4px",
                          background: "#e2e8f0",
                          borderRadius: "2px",
                          margin: "0.5rem 0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${uploadProgress}%`,
                            height: "100%",
                            background: "#48bb78",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div>
              <h4 style={{ marginBottom: "1rem", color: "#2d3748" }}>
                {user.nombre}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div>
                  <strong>📧 Email:</strong>
                  <br />
                  {user.email}
                </div>
                <div>
                  <strong>📞 Teléfono:</strong>
                  <br />
                  {user.telefono || "No especificado"}
                </div>
                <div>
                  <strong>👤 Rol:</strong>
                  <br />
                  <span
                    className={`badge ${
                      user.role === "ADMIN"
                        ? "badge-danger"
                        : user.role === "PSICOLOGO"
                        ? "badge-info"
                        : "badge-success"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                {user.role === "PSICOLOGO" && (
                  <>
                    <div>
                      <strong>🎓 Especialidad:</strong>
                      <br />
                      {user.especialidad || "No especificado"}
                    </div>
                    <div>
                      <strong>💰 Tarifa:</strong>
                      <br />
                      {user.tarifaConsulta
                        ? `S/ ${user.tarifaConsulta}`
                        : "No especificado"}
                    </div>
                  </>
                )}
                <div>
                  <strong>📍 Dirección:</strong>
                  <br />
                  {user.direccion || "No especificado"}
                </div>
              </div>

              {user.role === "PSICOLOGO" && user.descripcion && (
                <div style={{ marginTop: "1.5rem" }}>
                  <strong>📝 Descripción profesional:</strong>
                  <p style={{ marginTop: "0.5rem", color: "#4a5568" }}>
                    {user.descripcion}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Editar Perfil</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              {renderBasicFields()}
              {user.role === "PSICOLOGO" && renderPsychologistFields()}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? "Guardando..." : "💾 Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 800px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #718096;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}

export default ProfileComponent;
