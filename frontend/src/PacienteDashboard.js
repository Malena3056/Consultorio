import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function PacienteDashboard({
  user,
  activeView,
  data,
  onNavigate,
  onDataUpdate,
  onUserUpdate,
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [appointmentForm, setAppointmentForm] = useState({
    psicologoId: "",
    fecha: "",
    hora: "",
    modalidad: "PRESENCIAL",
    precio: 80,
  });
  const [loading, setLoading] = useState(false);

  // ESTADOS PARA PAGOS Y NOTAS CLÍNICAS
  const [payments, setPayments] = useState([]);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [completeHistory, setCompleteHistory] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    metodoPago: "YAPE",
    numeroTransaccion: "",
  });

  // ESTADOS PARA PERFIL
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoLoading, setPhotoLoading] = useState(false);

  // Cargar datos adicionales cuando cambie el usuario
  useEffect(() => {
    if (user?.id) {
      loadPayments();
      loadClinicalNotes();
      loadCompleteHistory();
      initializeProfileData();
    }
  }, [user?.id]);

  // ✅ NUEVAS FUNCIONES AGREGADAS

  // FUNCIÓN PARA GENERAR QR CODE
  const generateQRCode = (metodoPago, monto) => {
    const qrData = {
      YAPE: `yape://pay?phone=987654321&amount=${monto}&message=Pago consulta psicológica`,
      PLIN: `plin://pay?phone=987654321&amount=${monto}&message=Pago consulta psicológica`,
    };

    const qrText = qrData[metodoPago] || `Pago de S/${monto} via ${metodoPago}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      qrText
    )}`;

    return qrUrl;
  };

  // FUNCIONES PARA GESTIÓN DE PERFIL
  const initializeProfileData = () => {
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
      });
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido");
        return;
      }
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

      const updatedUser = { ...user, fotoPerfil: response.data.photoUrl };
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

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

        const updatedUser = { ...user, ...response.data };
        if (onUserUpdate) {
          onUserUpdate(updatedUser);
        }

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
        <div style={{ position: "relative" }}>
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
              try {
                if (e.target) {
                  e.target.style.display = "none";
                  const fallback =
                    e.target.parentNode?.querySelector(".profile-fallback");
                  if (fallback) {
                    fallback.style.display = "flex";
                  }
                }
              } catch (error) {
                console.warn("Error manejando imagen de perfil:", error);
              }
            }}
          />
          <div
            className="profile-fallback"
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
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {user.nombre?.charAt(0)?.toUpperCase() || "U"}
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
        {user.nombre?.charAt(0)?.toUpperCase() || "U"}
      </div>
    );
  };

  // ✅ RENDERIZADO DEL PERFIL
  const renderProfile = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mi Perfil</h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setModalType("editProfile");
              setShowModal(true);
            }}
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
                <label
                  htmlFor="photo-upload"
                  className="btn btn-outline btn-sm"
                  style={{
                    display: "inline-block",
                    cursor: "pointer",
                    marginBottom: "0.5rem",
                  }}
                >
                  📷 Cambiar Foto
                </label>

                {selectedFile && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <p style={{ fontSize: "0.9rem", margin: "0.5rem 0" }}>
                      {selectedFile.name}
                    </p>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={uploadProfilePhoto}
                      disabled={photoLoading}
                      style={{ width: "100%", marginBottom: "0.5rem" }}
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
                  <span className="badge badge-success">PACIENTE</span>
                </div>
                <div>
                  <strong>🆔 DNI:</strong>
                  <br />
                  {user.dni || "No especificado"}
                </div>
                <div>
                  <strong>🎂 Fecha de Nacimiento:</strong>
                  <br />
                  {user.fechaNacimiento
                    ? new Date(user.fechaNacimiento).toLocaleDateString()
                    : "No especificado"}
                </div>
                <div>
                  <strong>👥 Género:</strong>
                  <br />
                  {user.genero || "No especificado"}
                </div>
                <div>
                  <strong>📍 Dirección:</strong>
                  <br />
                  {user.direccion || "No especificado"}
                </div>
                <div>
                  <strong>🚨 Teléfono de Emergencia:</strong>
                  <br />
                  {user.telefonoEmergencia || "No especificado"}
                </div>
                <div>
                  <strong>💑 Estado Civil:</strong>
                  <br />
                  {user.estadoCivil || "No especificado"}
                </div>
              </div>

              <div style={{ marginTop: "2rem" }}>
                <h5 style={{ color: "#2d3748", marginBottom: "1rem" }}>
                  📊 Resumen de Actividad
                </h5>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      {completeHistory?.totalSesiones || 0}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#718096" }}>
                      Sesiones Totales
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                      {clinicalNotes.length}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#718096" }}>
                      Notas Clínicas
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#48bb78",
                      }}
                    >
                      S/ {completeHistory?.totalGastado?.toFixed(2) || "0.00"}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "#718096" }}>
                      Total Invertido
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // FUNCIONES PARA CARGAR DATOS REALES DE LA BD
  const loadPayments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/payments/patient/${user.id}`
      );
      setPayments(response.data);
    } catch (error) {
      console.error("Error loading payments:", error);
    }
  };

  const loadClinicalNotes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/clinical-notes/patient/${user.id}`
      );
      setClinicalNotes(response.data);
    } catch (error) {
      console.error("Error loading clinical notes:", error);
    }
  };

  const loadCompleteHistory = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/patients/${user.id}/complete-history`
      );
      setCompleteHistory(response.data);
    } catch (error) {
      console.error("Error loading complete history:", error);
    }
  };

  // ✅ FUNCIÓN MEJORADA PARA PROCESAR PAGOS CON VALIDACIÓN
  const processPayment = async (appointmentId, amount, metodoPago = "YAPE") => {
    // Validar número de transacción para métodos digitales
    if (
      ["YAPE", "PLIN", "TARJETA", "TRANSFERENCIA"].includes(metodoPago) &&
      !paymentForm.numeroTransaccion.trim()
    ) {
      alert("Por favor ingresa el número de transacción");
      return;
    }

    setLoading(true);
    try {
      const appointmentResponse = await axios.get(
        `${API_BASE}/appointments/${appointmentId}`
      );
      const appointment = appointmentResponse.data;

      // Crear el pago en la base de datos con número de transacción
      const paymentData = {
        appointmentId: appointmentId,
        pacienteId: user.id,
        psicologoId: appointment.psicologoId,
        monto: amount,
        metodoPago: metodoPago,
        numeroTransaccion:
          paymentForm.numeroTransaccion || `${metodoPago}-${Date.now()}`,
        nombrePaciente: user.nombre,
        nombrePsicologo: appointment.nombrePsicologo,
      };

      const paymentResponse = await axios.post(
        `${API_BASE}/payments`,
        paymentData
      );

      if (paymentResponse.status === 200) {
        alert("✅ Pago procesado exitosamente");

        await Promise.all([
          onDataUpdate(),
          loadPayments(),
          loadCompleteHistory(),
        ]);

        setSelectedPayment(null);
        setShowModal(false);
        // Limpiar formulario de pago
        setPaymentForm({
          metodoPago: "YAPE",
          numeroTransaccion: "",
        });
        console.log("✅ Pago completado y datos actualizados");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(
        "❌ Error al procesar pago: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para crear cita
  const createAppointment = async () => {
    setLoading(true);
    try {
      const fechaHora = `${appointmentForm.fecha}T${appointmentForm.hora}:00`;

      const response = await axios.post(`${API_BASE}/appointments`, {
        pacienteId: user.id,
        psicologoId: parseInt(appointmentForm.psicologoId),
        fechaHora,
        modalidad: appointmentForm.modalidad,
        precio: parseFloat(appointmentForm.precio),
      });

      if (response.status === 200) {
        alert("✅ Cita creada exitosamente");
        setShowModal(false);
        setAppointmentForm({
          psicologoId: "",
          fecha: "",
          hora: "",
          modalidad: "PRESENCIAL",
          precio: 80,
        });

        await Promise.all([onDataUpdate(), loadCompleteHistory()]);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert(
        "❌ Error al crear cita: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const renderHome = () => {
    const stats = completeHistory || {};

    return (
      <div>
        {/* Welcome Message */}
        <div
          className="card"
          style={{
            marginBottom: "2rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <div className="card-body">
            <h2 style={{ color: "white", marginBottom: "1rem" }}>
              Bienvenido, {user.nombre}
            </h2>
            <p style={{ opacity: 0.9, marginBottom: "1.5rem" }}>
              Tu bienestar mental es nuestra prioridad. Aquí puedes gestionar
              tus citas y seguir tu progreso.
            </p>
            <button
              className="btn btn-primary"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "2px solid white",
              }}
              onClick={() => onNavigate("newAppointment")}
            >
              ➕ Agendar Nueva Cita
            </button>
          </div>
        </div>

        {/* Stats Cards con datos reales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.totalSesiones || 0}</div>
            <div className="stat-label">Sesiones Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {data.appointments?.filter((a) => a.estado === "RESERVADA")
                .length || 0}
            </div>
            <div className="stat-label">Próximas Citas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.sesionesCompletadas || 0}</div>
            <div className="stat-label">Sesiones Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {stats.totalGastado?.toFixed(2) || "0.00"}
            </div>
            <div className="stat-label">Total Invertido</div>
          </div>
        </div>

        {/* Próxima Cita */}
        {(() => {
          const upcomingAppointments =
            data.appointments
              ?.filter((a) => {
                const appointmentDate = new Date(a.fechaHora);
                const today = new Date();
                return appointmentDate >= today && a.estado === "RESERVADA";
              })
              .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)) ||
            [];

          if (upcomingAppointments.length > 0) {
            const nextAppointment = upcomingAppointments[0];
            return (
              <div className="card" style={{ marginBottom: "2rem" }}>
                <div className="card-header">
                  <h3 className="card-title">Tu Próxima Cita</h3>
                  <span className="badge badge-success">Próxima</span>
                </div>
                <div className="card-body">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "2rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                        Cita con {nextAppointment.nombrePsicologo}
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <div>
                          <strong>📅 Fecha:</strong>
                          <br />
                          {new Date(
                            nextAppointment.fechaHora
                          ).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>⏰ Hora:</strong>
                          <br />
                          {new Date(
                            nextAppointment.fechaHora
                          ).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div>
                          <strong>📍 Modalidad:</strong>
                          <br />
                          <span
                            className={`badge ${
                              nextAppointment.modalidad === "PRESENCIAL"
                                ? "badge-info"
                                : "badge-success"
                            }`}
                          >
                            {nextAppointment.modalidad}
                          </span>
                        </div>
                        <div>
                          <strong>💰 Precio:</strong>
                          <br />
                          S/ {nextAppointment.precio}
                        </div>
                      </div>
                      <div>
                        <strong>💳 Estado de pago:</strong>
                        <span
                          className={`badge ${
                            nextAppointment.pagado
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                          style={{ marginLeft: "0.5rem" }}
                        >
                          {nextAppointment.pagado
                            ? "✅ Pagado"
                            : "⏳ Pendiente"}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      {!nextAppointment.pagado && (
                        <button
                          className="btn btn-success"
                          onClick={() => {
                            setSelectedPayment({
                              appointmentId: nextAppointment.id,
                              amount: nextAppointment.precio,
                              psychologist: nextAppointment.nombrePsicologo,
                            });
                            setModalType("payment");
                            setShowModal(true);
                          }}
                        >
                          💳 Pagar Ahora
                        </button>
                      )}
                      <button
                        className="btn btn-outline"
                        onClick={() => onNavigate("appointments")}
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div className="card">
            <div className="card-body" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
              <h4 style={{ marginBottom: "0.5rem" }}>Agendar Cita</h4>
              <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
                Programa una nueva sesión con tu psicólogo
              </p>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("newAppointment")}
              >
                Agendar Ahora
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
              <h4 style={{ marginBottom: "0.5rem" }}>Mis Pagos</h4>
              <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
                Gestiona tus pagos pendientes
              </p>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("payments")}
              >
                Ver Pagos (
                {stats.pendientePagar > 0
                  ? `S/ ${stats.pendientePagar.toFixed(2)} pendiente`
                  : "Al día"}
                )
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
              <h4 style={{ marginBottom: "0.5rem" }}>Mi Perfil</h4>
              <p style={{ color: "#718096", marginBottom: "1.5rem" }}>
                Actualiza tu información personal
              </p>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate("profile")}
              >
                Ver Perfil
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // RENDER DE PAGOS CON DATOS REALES
  const renderPayments = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mis Pagos</h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span className="badge badge-success">
              {payments.filter((p) => p.estado === "COMPLETADO").length}{" "}
              Completados
            </span>
            <span className="badge badge-warning">
              {payments.filter((p) => p.estado === "PENDIENTE").length}{" "}
              Pendientes
            </span>
          </div>
        </div>
        <div className="card-body no-padding">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha de Pago</th>
                  <th>Psicólogo</th>
                  <th>Monto</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Transacción</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.fechaPago).toLocaleDateString()}</td>
                    <td>{payment.nombrePsicologo}</td>
                    <td>
                      <strong>S/ {payment.monto}</strong>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {payment.metodoPago}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          payment.estado === "COMPLETADO"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {payment.estado === "COMPLETADO"
                          ? "✅ Completado"
                          : "⏳ Pendiente"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.85rem", color: "#4a5568" }}>
                      {payment.numeroTransaccion || "N/A"}
                    </td>
                    <td>
                      {payment.estado === "COMPLETADO" ? (
                        <button className="btn btn-outline btn-sm">
                          📄 Ver Recibo
                        </button>
                      ) : (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setSelectedPayment({
                              appointmentId: payment.appointmentId,
                              amount: payment.monto,
                              psychologist: payment.nombrePsicologo,
                            });
                            setModalType("payment");
                            setShowModal(true);
                          }}
                        >
                          💳 Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // RENDER DE HISTORIAL CON NOTAS CLÍNICAS REALES
  const renderHistory = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mi Historial Clínico</h3>
          <span className="badge badge-info">
            {clinicalNotes.length} notas clínicas
          </span>
        </div>
        <div className="card-body">
          {clinicalNotes.map((note) => (
            <div
              key={note.id}
              className="card"
              style={{ marginBottom: "1rem", border: "1px solid #e2e8f0" }}
            >
              <div className="card-body">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h4 style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}>
                      Sesión #{note.sesionNumero || "N/A"} - {note.tipoNota}
                    </h4>
                    <div style={{ color: "#718096", fontSize: "0.9rem" }}>
                      📅 {new Date(note.fechaCreacion).toLocaleDateString()} •
                      👩‍⚕️ {note.nombrePsicologo} • 📍 {note.modalidadSesion}
                    </div>
                  </div>
                  {note.requiereSeguimiento && (
                    <span className="badge badge-warning">
                      Requiere seguimiento
                    </span>
                  )}
                </div>

                {note.estadoEmocional && (
                  <div style={{ marginBottom: "1rem" }}>
                    <strong>Estado emocional:</strong>
                    <span
                      className={`badge ${
                        note.estadoEmocional === "ESTABLE"
                          ? "badge-success"
                          : note.estadoEmocional === "ANSIOSO"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                      style={{ marginLeft: "0.5rem" }}
                    >
                      {note.estadoEmocional}
                    </span>
                  </div>
                )}

                <div
                  style={{
                    background: "#f7fafc",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <strong>📝 Contenido de la sesión:</strong>
                  <div
                    style={{
                      marginTop: "0.5rem",
                      color: "#4a5568",
                      lineHeight: "1.6",
                    }}
                  >
                    {note.contenido}
                  </div>
                </div>

                {note.planTratamiento && (
                  <div
                    style={{
                      background: "#f0fff4",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      marginBottom: "1rem",
                      border: "1px solid #c6f6d5",
                    }}
                  >
                    <strong>🎯 Plan de tratamiento:</strong>
                    <div style={{ marginTop: "0.5rem", color: "#22543d" }}>
                      {note.planTratamiento}
                    </div>
                  </div>
                )}

                {note.tareasPaciente && (
                  <div
                    style={{
                      background: "#fffaf0",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #fbd38d",
                    }}
                  >
                    <strong>📋 Tareas asignadas:</strong>
                    <div style={{ marginTop: "0.5rem", color: "#744210" }}>
                      {note.tareasPaciente}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {clinicalNotes.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "3rem", color: "#718096" }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
              <h3>No tienes notas clínicas aún</h3>
              <p>
                Las notas aparecerán aquí después de tus sesiones completadas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mis Citas</h3>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("newAppointment")}
          >
            ➕ Agendar Nueva Cita
          </button>
        </div>
        <div className="card-body">
          {data.appointments?.map((appointment) => (
            <div
              key={appointment.id}
              className="card"
              style={{ marginBottom: "1rem", border: "1px solid #e2e8f0" }}
            >
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "2rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <h4 style={{ margin: 0, color: "#2d3748" }}>
                        Cita con: {appointment.nombrePsicologo}
                      </h4>
                      <span
                        className={`badge ${
                          appointment.estado === "COMPLETADA"
                            ? "badge-success"
                            : appointment.estado === "CANCELADA"
                            ? "badge-danger"
                            : "badge-warning"
                        }`}
                      >
                        {appointment.estado}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <strong>📅 Fecha:</strong>
                        <br />
                        {new Date(appointment.fechaHora).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>⏰ Hora:</strong>
                        <br />
                        {new Date(appointment.fechaHora).toLocaleTimeString(
                          "es-ES",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                      <div>
                        <strong>📍 Modalidad:</strong>
                        <br />
                        <span
                          className={`badge ${
                            appointment.modalidad === "PRESENCIAL"
                              ? "badge-info"
                              : "badge-success"
                          }`}
                        >
                          {appointment.modalidad}
                        </span>
                      </div>
                      <div>
                        <strong>💰 Precio:</strong>
                        <br />
                        S/ {appointment.precio}
                      </div>
                      <div>
                        <strong>💳 Pagado:</strong>
                        <br />
                        <span
                          className={`badge ${
                            appointment.pagado
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {appointment.pagado ? "✅ Sí" : "❌ No"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {!appointment.pagado &&
                      appointment.estado !== "CANCELADA" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setSelectedPayment({
                              appointmentId: appointment.id,
                              amount: appointment.precio,
                              psychologist: appointment.nombrePsicologo,
                            });
                            setModalType("payment");
                            setShowModal(true);
                          }}
                        >
                          💳 Pagar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNewAppointment = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Agendar Nueva Cita</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div>
              <label className="form-label">Psicólogo</label>
              <select
                className="form-control select-control"
                value={appointmentForm.psicologoId}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    psicologoId: e.target.value,
                  }))
                }
              >
                <option value="">Seleccionar psicólogo</option>
                {data.psicologos?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {p.especialidad}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-control"
                value={appointmentForm.fecha}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    fecha: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <div className="form-row">
            <div>
              <label className="form-label">Hora</label>
              <select
                className="form-control select-control"
                value={appointmentForm.hora}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    hora: e.target.value,
                  }))
                }
              >
                <option value="">Seleccionar hora</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="17:00">05:00 PM</option>
              </select>
            </div>
            <div>
              <label className="form-label">Modalidad</label>
              <select
                className="form-control select-control"
                value={appointmentForm.modalidad}
                onChange={(e) =>
                  setAppointmentForm((prev) => ({
                    ...prev,
                    modalidad: e.target.value,
                  }))
                }
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIDEOLLAMADA">Virtual</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary btn-lg"
            onClick={createAppointment}
            disabled={
              loading ||
              !appointmentForm.psicologoId ||
              !appointmentForm.fecha ||
              !appointmentForm.hora
            }
          >
            {loading ? "Agendando..." : "🗓️ Agendar Cita"}
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ MODAL PARA EDITAR PERFIL
  const renderEditProfileModal = () => {
    if (!showModal || modalType !== "editProfile") return null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">Editar Mi Perfil</h3>
            <button onClick={() => setShowModal(false)} className="modal-close">
              &times;
            </button>
          </div>
          <div className="modal-body">
            <div className="form-row">
              <div>
                <label className="form-label">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={profileData.nombre}
                  onChange={handleProfileInputChange}
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
                  onChange={handleProfileInputChange}
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
                  onChange={handleProfileInputChange}
                />
              </div>
              <div>
                <label className="form-label">DNI</label>
                <input
                  type="text"
                  name="dni"
                  className="form-control"
                  value={profileData.dni}
                  onChange={handleProfileInputChange}
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
                  onChange={handleProfileInputChange}
                />
              </div>
              <div>
                <label className="form-label">Género</label>
                <select
                  name="genero"
                  className="form-control select-control"
                  value={profileData.genero}
                  onChange={handleProfileInputChange}
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
                <label className="form-label">Estado Civil</label>
                <select
                  name="estadoCivil"
                  className="form-control select-control"
                  value={profileData.estadoCivil}
                  onChange={handleProfileInputChange}
                >
                  <option value="">Seleccionar</option>
                  <option value="Soltero/a">Soltero/a</option>
                  <option value="Casado/a">Casado/a</option>
                  <option value="Divorciado/a">Divorciado/a</option>
                  <option value="Viudo/a">Viudo/a</option>
                  <option value="Unión libre">Unión libre</option>
                </select>
              </div>
              <div>
                <label className="form-label">Teléfono de emergencia</label>
                <input
                  type="tel"
                  name="telefonoEmergencia"
                  className="form-control"
                  value={profileData.telefonoEmergencia}
                  onChange={handleProfileInputChange}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Dirección</label>
              <input
                type="text"
                name="direccion"
                className="form-control"
                value={profileData.direccion}
                onChange={handleProfileInputChange}
                placeholder="Dirección completa"
              />
            </div>
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
              className="btn btn-success"
              onClick={updateProfile}
              disabled={loading}
            >
              {loading ? "Guardando..." : "💾 Guardar Cambios"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ✅ MODAL MEJORADO PARA PAGOS CON QR CODES
  const renderPaymentModal = () => {
    if (!showModal || modalType !== "payment" || !selectedPayment) return null;

    const showQR = ["YAPE", "PLIN"].includes(paymentForm.metodoPago);
    const qrUrl = showQR
      ? generateQRCode(paymentForm.metodoPago, selectedPayment.amount)
      : null;

    return (
      <div className="modal-overlay" onClick={() => setShowModal(false)}>
        <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">💳 Procesar Pago</h3>
            <button onClick={() => setShowModal(false)} className="modal-close">
              &times;
            </button>
          </div>
          <div className="modal-body">
            {/* Detalles del Pago */}
            <div
              style={{
                marginBottom: "1.5rem",
                padding: "1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "1rem",
                color: "white",
                textAlign: "center",
              }}
            >
              <h4 style={{ color: "white", marginBottom: "1rem" }}>
                Detalles del Pago
              </h4>
              <p style={{ marginBottom: "0.5rem", opacity: 0.9 }}>
                <strong>Psicólogo:</strong> {selectedPayment.psychologist}
              </p>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginTop: "1rem",
                }}
              >
                S/ {selectedPayment.amount}
              </div>
            </div>

            {/* Selector de Método de Pago */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="form-label">Método de Pago</label>
              <select
                className="form-control select-control"
                value={paymentForm.metodoPago}
                onChange={(e) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    metodoPago: e.target.value,
                  }))
                }
              >
                <option value="YAPE">📱 Yape</option>
                <option value="PLIN">💜 Plin</option>
                <option value="TARJETA">💳 Tarjeta de Crédito/Débito</option>
                <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
                <option value="EFECTIVO">💵 Efectivo</option>
              </select>
            </div>

            {/* QR Code Section */}
            {showQR && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1.5rem",
                  background: "#f8f9fa",
                  borderRadius: "1rem",
                  textAlign: "center",
                  border: "2px dashed #3182ce",
                }}
              >
                <h4 style={{ color: "#3182ce", marginBottom: "1rem" }}>
                  {paymentForm.metodoPago === "YAPE"
                    ? "📱 Escanea con Yape"
                    : "💜 Escanea con Plin"}
                </h4>
                <div style={{ marginBottom: "1rem" }}>
                  <img
                    src={qrUrl}
                    alt={`QR ${paymentForm.metodoPago}`}
                    style={{
                      maxWidth: "200px",
                      height: "200px",
                      border: "4px solid #3182ce",
                      borderRadius: "1rem",
                      background: "white",
                      padding: "0.5rem",
                    }}
                  />
                </div>
                <div style={{ color: "#4a5568", fontSize: "0.9rem" }}>
                  <p>
                    <strong>Número:</strong> 987-654-321
                  </p>
                  <p>
                    <strong>Monto:</strong> S/ {selectedPayment.amount}
                  </p>
                  <p style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                    Después de realizar el pago, ingresa el número de
                    transacción abajo
                  </p>
                </div>
              </div>
            )}

            {/* Información adicional para otros métodos */}
            {paymentForm.metodoPago === "TARJETA" && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#e3f2fd",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>💳 Pago con Tarjeta:</strong>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
                  Puedes pagar directamente en el consultorio o solicitar un
                  link de pago seguro.
                </p>
              </div>
            )}

            {paymentForm.metodoPago === "TRANSFERENCIA" && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f3e5f5",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>🏦 Datos para Transferencia:</strong>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
                  <strong>Banco:</strong> BCP
                  <br />
                  <strong>Cuenta:</strong> 123-456-789-012
                  <br />
                  <strong>CCI:</strong> 00213412345678901234
                </p>
              </div>
            )}

            {paymentForm.metodoPago === "EFECTIVO" && (
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#fff3e0",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>💵 Pago en Efectivo:</strong>
                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
                  Puedes pagar directamente en el consultorio antes o después de
                  tu sesión.
                </p>
              </div>
            )}

            {/* Número de Transacción */}
            {["YAPE", "PLIN", "TARJETA", "TRANSFERENCIA"].includes(
              paymentForm.metodoPago
            ) && (
              <div>
                <label className="form-label">
                  Número de Transacción *
                  <span
                    style={{
                      color: "#e53e3e",
                      fontSize: "0.8rem",
                      marginLeft: "0.5rem",
                    }}
                  >
                    (Requerido)
                  </span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    paymentForm.metodoPago === "YAPE"
                      ? "Ej: YPE123456789"
                      : paymentForm.metodoPago === "PLIN"
                      ? "Ej: PLN123456789"
                      : paymentForm.metodoPago === "TARJETA"
                      ? "Ej: CARD123456789"
                      : "Ej: TRF123456789"
                  }
                  value={paymentForm.numeroTransaccion}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({
                      ...prev,
                      numeroTransaccion: e.target.value,
                    }))
                  }
                  required
                  style={{
                    fontSize: "1rem",
                    padding: "0.75rem",
                    border: paymentForm.numeroTransaccion.trim()
                      ? "2px solid #48bb78"
                      : "2px solid #e2e8f0",
                  }}
                />
                <small
                  style={{
                    color: "#718096",
                    fontSize: "0.85rem",
                    marginTop: "0.5rem",
                    display: "block",
                  }}
                >
                  💡 Este número aparecerá en los registros del consultorio para
                  verificar tu pago
                </small>
              </div>
            )}
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
              className="btn btn-success"
              onClick={() =>
                processPayment(
                  selectedPayment.appointmentId,
                  selectedPayment.amount,
                  paymentForm.metodoPago
                )
              }
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : `✅ Confirmar Pago S/ ${selectedPayment.amount}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case "appointments":
        return renderAppointments();
      case "newAppointment":
        return renderNewAppointment();
      case "payments":
        return renderPayments();
      case "history":
        return renderHistory();
      case "profile":
        return renderProfile();
      default:
        return renderHome();
    }
  };

  return (
    <>
      {renderContent()}
      {renderPaymentModal()}
      {renderEditProfileModal()}
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
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 700px;
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
    </>
  );
}

export default PacienteDashboard;
