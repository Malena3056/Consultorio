import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function AdminDashboard({ user, activeView, data, onNavigate, onDataUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // NUEVOS ESTADOS PARA GESTIÓN DE PAGOS
  const [payments, setPayments] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("all"); // all, completed, pending

  // NUEVOS ESTADOS PARA FILTROS DE REPORTES
  const [reportTimeFilter, setReportTimeFilter] = useState("month"); // daily, weekly, month
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [filteredReports, setFilteredReports] = useState(null);

  // NUEVOS ESTADOS PARA VALIDACIONES
  const [formErrors, setFormErrors] = useState({});

  // Cargar pagos cuando el componente se monta
  useEffect(() => {
    if (activeView === "payments") {
      loadPayments();
    }
  }, [activeView]);

  // Filtrar reportes cuando cambian los filtros de tiempo
  useEffect(() => {
    if (data.appointments && activeView === "reports") {
      filterReportsByTime();
    }
  }, [
    reportTimeFilter,
    reportStartDate,
    reportEndDate,
    data.appointments,
    activeView,
  ]);

  // FUNCIÓN PARA CARGAR PAGOS REALES
  const loadPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/payments`);
      setPayments(response.data || []);
      console.log("✅ Pagos cargados:", response.data.length);
    } catch (error) {
      console.error("Error loading payments:", error);
      alert("Error al cargar pagos: " + error.message);
    }
  };

  // NUEVA FUNCIÓN PARA FILTRAR REPORTES POR TIEMPO
  const filterReportsByTime = () => {
    if (!data.appointments) return;

    const now = new Date();
    let startDate, endDate;

    switch (reportTimeFilter) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "weekly":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate()
        );
        endDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate() + 7
        );
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "custom":
        if (reportStartDate && reportEndDate) {
          startDate = new Date(reportStartDate);
          endDate = new Date(reportEndDate);
        } else {
          return;
        }
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    const filteredAppointments = data.appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.fechaHora);
      return appointmentDate >= startDate && appointmentDate < endDate;
    });

    const filteredPaymentData = payments.filter((payment) => {
      const paymentDate = new Date(payment.fechaPago);
      return paymentDate >= startDate && paymentDate < endDate;
    });

    // Calcular estadísticas filtradas
    const completedAppointments = filteredAppointments.filter(
      (a) => a.estado === "COMPLETADA"
    );
    const cancelledAppointments = filteredAppointments.filter(
      (a) => a.estado === "CANCELADA"
    );
    const pendingAppointments = filteredAppointments.filter(
      (a) => a.estado === "RESERVADA"
    );
    const paidAppointments = filteredAppointments.filter((a) => a.pagado);

    const totalIngresos = paidAppointments.reduce(
      (sum, a) => sum + (a.precio || 0),
      0
    );
    const completedPayments = filteredPaymentData.filter(
      (p) => p.estado === "COMPLETADO"
    );
    const totalIngresosPayments = completedPayments.reduce(
      (sum, p) => sum + p.monto,
      0
    );

    setFilteredReports({
      totalCitas: filteredAppointments.length,
      citasCompletadas: completedAppointments.length,
      citasCanceladas: cancelledAppointments.length,
      citasPendientes: pendingAppointments.length,
      citasPagadas: paidAppointments.length,
      ingresoTotal: Math.max(totalIngresos, totalIngresosPayments),
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      appointments: filteredAppointments,
      payments: filteredPaymentData,
    });
  };

  // FUNCIONES DE VALIDACIÓN
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return nameRegex.test(name);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateSpecialty = (specialty) => {
    const specialtyRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return specialtyRegex.test(specialty);
  };

  // FUNCIÓN PARA VALIDAR FORMULARIO COMPLETO
  const validateForm = (data, isPatient) => {
    const errors = {};

    if (!data.nombre || !validateName(data.nombre)) {
      errors.nombre =
        "El nombre debe contener solo letras y tener entre 2-50 caracteres";
    }

    if (!data.username || !validateUsername(data.username)) {
      errors.username = "El usuario debe tener 3-20 caracteres alfanuméricos";
    }

    if (!data.email || !validateEmail(data.email)) {
      errors.email = "Ingrese un email válido";
    }

    if (!data.password || !validatePassword(data.password)) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (data.telefono && !validatePhone(data.telefono)) {
      errors.telefono = "Ingrese un número de teléfono válido";
    }

    if (!isPatient) {
      if (!data.especialidad || !validateSpecialty(data.especialidad)) {
        errors.especialidad =
          "La especialidad debe contener solo letras y tener entre 2-50 caracteres";
      }
    }

    return errors;
  };

  // FUNCIÓN MEJORADA PARA MANEJAR CAMBIOS EN FORMULARIO
  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }

    // Validación en tiempo real
    let error = "";
    switch (field) {
      case "nombre":
        if (value && !validateName(value)) {
          error = "Solo letras y espacios permitidos";
        }
        break;
      case "username":
        if (value && !validateUsername(value)) {
          error = "Solo letras, números y guiones bajos";
        }
        break;
      case "email":
        if (value && !validateEmail(value)) {
          error = "Formato de email inválido";
        }
        break;
      case "telefono":
        if (value && !validatePhone(value)) {
          error = "Solo números, espacios y símbolos telefónicos";
        }
        break;
      case "especialidad":
        if (value && !validateSpecialty(value)) {
          error = "Solo letras y espacios permitidos";
        }
        break;
    }

    if (error) {
      setFormErrors({ ...formErrors, [field]: error });
    }
  };

  // Función para crear usuario
  const handleCreateUser = async (userData) => {
    const isPatient = modalType === "createPatient";
    const errors = validateForm(userData, isPatient);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      alert("Por favor, corrija los errores en el formulario");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/users`, userData);
      alert("Usuario creado exitosamente");
      setShowModal(false);
      setFormData({});
      setFormErrors({});
      onDataUpdate();
    } catch (error) {
      alert(
        "Error al crear usuario: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await axios.delete(`${API_BASE}/users/${userId}`);
        alert("Usuario eliminado exitosamente");
        onDataUpdate();
      } catch (error) {
        alert(
          "Error al eliminar usuario: " +
            (error.response?.data?.message || error.message)
        );
      }
    }
  };

  // Función para actualizar cita
  const handleUpdateAppointment = async (appointmentId, updates) => {
    try {
      await axios.put(`${API_BASE}/appointments/${appointmentId}`, updates);
      alert("Cita actualizada exitosamente");
      onDataUpdate();
    } catch (error) {
      alert(
        "Error al actualizar cita: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  // Función para cancelar cita
  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm("¿Confirmar la cancelación de esta cita?")) {
      handleUpdateAppointment(appointmentId, { estado: "CANCELADA" });
    }
  };

  // NUEVA FUNCIÓN PARA ACTUALIZAR ESTADO DEL PAGO
  const handleUpdatePaymentStatus = async (paymentId, newStatus) => {
    try {
      await axios.put(`${API_BASE}/payments/${paymentId}`, {
        estado: newStatus,
      });
      alert(`Pago marcado como ${newStatus.toLowerCase()}`);
      loadPayments(); // Recargar pagos
    } catch (error) {
      alert("Error al actualizar pago: " + error.message);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType("");
    setSelectedItem(null);
    setFormData({});
    setFormErrors({});
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalType === "createPatient") {
      handleCreateUser({
        ...formData,
        role: "PACIENTE",
      });
    } else if (modalType === "createPsychologist") {
      handleCreateUser({
        ...formData,
        role: "PSICOLOGO",
      });
    }
  };

  const renderHome = () => (
    <div>
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{data.pacientes?.length || 0}</div>
          <div className="stat-label">Pacientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.psicologos?.length || 0}</div>
          <div className="stat-label">Psicólogos</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {data.appointments?.filter((a) => a.estado === "RESERVADA")
              .length || 0}
          </div>
          <div className="stat-label">Citas programadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            S/ {data.reports?.ingresoTotal?.toFixed(2) || "0.00"}
          </div>
          <div className="stat-label">Ingresos del mes</div>
        </div>
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Citas por estado</h3>
          </div>
          <div className="card-body">
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                textAlign: "center",
              }}
            >
              <div>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#2c5282",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    margin: "0 auto 0.5rem",
                  }}
                >
                  {data.appointments?.filter((a) => a.estado === "RESERVADA")
                    .length || 0}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                  Pendiente
                </div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                  {data.appointments?.filter((a) => a.estado === "RESERVADA")
                    .length || 0}
                </div>
              </div>

              <div>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#48bb78",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    margin: "0 auto 0.5rem",
                  }}
                >
                  {data.appointments?.filter((a) => a.estado === "COMPLETADA")
                    .length || 0}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                  Confirmada
                </div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                  {data.appointments?.filter((a) => a.estado === "COMPLETADA")
                    .length || 0}
                </div>
              </div>

              <div>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "#718096",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    margin: "0 auto 0.5rem",
                  }}
                >
                  {data.appointments?.filter((a) => a.estado === "CANCELADA")
                    .length || 0}
                </div>
                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                  Cancelada
                </div>
                <div style={{ fontSize: "0.85rem", color: "#718096" }}>
                  {data.appointments?.filter((a) => a.estado === "CANCELADA")
                    .length || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Resumen Financiero</h3>
          </div>
          <div className="card-body">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>Ingresos Totales:</strong>
                <span style={{ color: "#48bb78", fontWeight: "bold" }}>
                  S/ {data.reports?.ingresoTotal?.toFixed(2) || "0.00"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>Citas Pagadas:</strong>
                <span>{data.reports?.citasPagadas || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div>
      {/* User Creation Forms */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crear Paciente</h3>
          </div>
          <div className="card-body">
            <button
              className="btn btn-primary"
              onClick={() => openModal("createPatient")}
            >
              ➕ Agregar Paciente
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Crear Psicólogo</h3>
          </div>
          <div className="card-body">
            <button
              className="btn btn-primary"
              onClick={() => openModal("createPsychologist")}
            >
              ➕ Agregar Psicólogo
            </button>
          </div>
        </div>
      </div>

      {/* Users Lists */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pacientes Registrados</h3>
          </div>
          <div className="card-body no-padding">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pacientes?.map((paciente) => (
                    <tr key={paciente.id}>
                      <td>{paciente.nombre}</td>
                      <td>{paciente.email}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(paciente.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Psicólogos Registrados</h3>
          </div>
          <div className="card-body no-padding">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.psicologos?.map((psicologo) => (
                    <tr key={psicologo.id}>
                      <td>{psicologo.nombre}</td>
                      <td>{psicologo.especialidad}</td>
                      <td>{psicologo.telefono}</td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(psicologo.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAllAppointments = () => (
    <div>
      {/* Appointments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Todas las Citas</h3>
        </div>
        <div className="card-body no-padding">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha y hora</th>
                  <th>Paciente</th>
                  <th>Psicólogo</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments?.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{new Date(appointment.fechaHora).toLocaleString()}</td>
                    <td>{appointment.nombrePaciente}</td>
                    <td>{appointment.nombrePsicologo}</td>
                    <td>
                      <span
                        className={`badge ${
                          appointment.modalidad === "PRESENCIAL"
                            ? "badge-info"
                            : "badge-success"
                        }`}
                      >
                        {appointment.modalidad}
                      </span>
                    </td>
                    <td>
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
                    </td>
                    <td>S/ {appointment.precio}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() =>
                            handleUpdateAppointment(appointment.id, {
                              estado: "COMPLETADA",
                            })
                          }
                        >
                          Completar
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            handleCancelAppointment(appointment.id)
                          }
                        >
                          Cancelar
                        </button>
                      </div>
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

  // RENDER MEJORADO DE PAGOS CON NÚMEROS DE TRANSACCIÓN
  const renderPayments = () => {
    const filteredPayments = payments.filter((payment) => {
      if (paymentFilter === "completed") return payment.estado === "COMPLETADO";
      if (paymentFilter === "pending") return payment.estado === "PENDIENTE";
      return true; // all
    });

    return (
      <div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">💰 Gestión de Pagos</h3>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {/* Filtro de pagos */}
              <select
                className="form-control select-control"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{ width: "150px" }}
              >
                <option value="all">Todos</option>
                <option value="completed">Completados</option>
                <option value="pending">Pendientes</option>
              </select>

              {/* Estadísticas rápidas */}
              <span className="badge badge-success">
                {payments.filter((p) => p.estado === "COMPLETADO").length}{" "}
                Completados
              </span>
              <span className="badge badge-warning">
                {payments.filter((p) => p.estado === "PENDIENTE").length}{" "}
                Pendientes
              </span>

              <button className="btn btn-outline btn-sm" onClick={loadPayments}>
                🔄 Actualizar
              </button>
            </div>
          </div>
          <div className="card-body no-padding">
            {filteredPayments.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "#718096",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💳</div>
                <h3>
                  No hay pagos{" "}
                  {paymentFilter === "all"
                    ? ""
                    : paymentFilter === "completed"
                    ? "completados"
                    : "pendientes"}
                </h3>
                <p>
                  Los pagos aparecerán aquí cuando los pacientes realicen
                  transacciones
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>📅 Fecha</th>
                      <th>👤 Paciente</th>
                      <th>👩‍⚕️ Psicólogo</th>
                      <th>💰 Monto</th>
                      <th>💳 Método</th>
                      <th>📊 Estado</th>
                      <th>🔢 N° Transacción</th>
                      <th>⚙️ Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <div>
                            <strong>
                              {new Date(payment.fechaPago).toLocaleDateString()}
                            </strong>
                            <br />
                            <small style={{ color: "#718096" }}>
                              {new Date(payment.fechaPago).toLocaleTimeString(
                                "es-ES",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </small>
                          </div>
                        </td>
                        <td>
                          <strong>{payment.nombrePaciente}</strong>
                        </td>
                        <td>{payment.nombrePsicologo}</td>
                        <td>
                          <strong
                            style={{ color: "#48bb78", fontSize: "1.1rem" }}
                          >
                            S/ {payment.monto}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              payment.metodoPago === "YAPE"
                                ? "badge-success"
                                : payment.metodoPago === "PLIN"
                                ? "badge-primary"
                                : payment.metodoPago === "TARJETA"
                                ? "badge-info"
                                : payment.metodoPago === "TRANSFERENCIA"
                                ? "badge-warning"
                                : "badge-secondary"
                            }`}
                          >
                            {payment.metodoPago === "YAPE"
                              ? "📱 YAPE"
                              : payment.metodoPago === "PLIN"
                              ? "💜 PLIN"
                              : payment.metodoPago === "TARJETA"
                              ? "💳 TARJETA"
                              : payment.metodoPago === "TRANSFERENCIA"
                              ? "🏦 TRANSFER."
                              : "💵 EFECTIVO"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              payment.estado === "COMPLETADO"
                                ? "badge-success"
                                : payment.estado === "PENDIENTE"
                                ? "badge-warning"
                                : "badge-danger"
                            }`}
                          >
                            {payment.estado === "COMPLETADO"
                              ? "✅ Completado"
                              : payment.estado === "PENDIENTE"
                              ? "⏳ Pendiente"
                              : "❌ Fallido"}
                          </span>
                        </td>
                        <td>
                          {payment.numeroTransaccion ? (
                            <div
                              style={{
                                padding: "0.25rem 0.5rem",
                                background: "#f8f9fa",
                                borderRadius: "0.25rem",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <strong>{payment.numeroTransaccion}</strong>
                            </div>
                          ) : (
                            <span
                              style={{ color: "#a0aec0", fontSize: "0.85rem" }}
                            >
                              Sin número
                            </span>
                          )}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {payment.estado === "PENDIENTE" && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() =>
                                    handleUpdatePaymentStatus(
                                      payment.id,
                                      "COMPLETADO"
                                    )
                                  }
                                  title="Marcar como completado"
                                >
                                  ✅
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() =>
                                    handleUpdatePaymentStatus(
                                      payment.id,
                                      "FALLIDO"
                                    )
                                  }
                                  title="Marcar como fallido"
                                >
                                  ❌
                                </button>
                              </>
                            )}

                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                // Mostrar detalles del pago
                                alert(`Detalles del Pago:

ID: ${payment.id}
Paciente: ${payment.nombrePaciente}
Psicólogo: ${payment.nombrePsicologo}
Monto: S/ ${payment.monto}
Método: ${payment.metodoPago}
Estado: ${payment.estado}
N° Transacción: ${payment.numeroTransaccion || "N/A"}
Fecha: ${new Date(payment.fechaPago).toLocaleString()}
Concepto: ${payment.conceptoPago || "Consulta psicológica"}
${payment.observaciones ? `Observaciones: ${payment.observaciones}` : ""}`);
                              }}
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de pagos */}
        {payments.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📊 Resumen de Pagos</h3>
              </div>
              <div className="card-body">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f0fff4",
                      borderRadius: "0.5rem",
                      border: "1px solid #c6f6d5",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#22543d",
                      }}
                    >
                      S/{" "}
                      {payments
                        .filter((p) => p.estado === "COMPLETADO")
                        .reduce((sum, p) => sum + p.monto, 0)
                        .toFixed(2)}
                    </div>
                    <div style={{ color: "#22543d", fontSize: "0.9rem" }}>
                      Ingresos Confirmados
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "#fffaf0",
                      borderRadius: "0.5rem",
                      border: "1px solid #fbd38d",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#744210",
                      }}
                    >
                      S/{" "}
                      {payments
                        .filter((p) => p.estado === "PENDIENTE")
                        .reduce((sum, p) => sum + p.monto, 0)
                        .toFixed(2)}
                    </div>
                    <div style={{ color: "#744210", fontSize: "0.9rem" }}>
                      Pagos Pendientes
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "#f8f9fa",
                      borderRadius: "0.5rem",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#4a5568",
                      }}
                    >
                      {payments.length}
                    </div>
                    <div style={{ color: "#4a5568", fontSize: "0.9rem" }}>
                      Total Transacciones
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "#edf2f7",
                      borderRadius: "0.5rem",
                      border: "1px solid #cbd5e0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        color: "#2d3748",
                      }}
                    >
                      {Math.round(
                        (payments.filter((p) => p.estado === "COMPLETADO")
                          .length /
                          payments.length) *
                          100
                      )}
                      %
                    </div>
                    <div style={{ color: "#2d3748", fontSize: "0.9rem" }}>
                      Tasa de Éxito
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // NUEVA FUNCIÓN PARA RENDERIZAR REPORTES CON FILTROS
  const renderReports = () => {
    const reportData = filteredReports || {
      totalCitas: data.appointments?.length || 0,
      citasCompletadas:
        data.appointments?.filter((a) => a.estado === "COMPLETADA").length || 0,
      citasCanceladas:
        data.appointments?.filter((a) => a.estado === "CANCELADA").length || 0,
      citasPendientes:
        data.appointments?.filter((a) => a.estado === "RESERVADA").length || 0,
      citasPagadas: data.reports?.citasPagadas || 0,
      ingresoTotal: data.reports?.ingresoTotal || 0,
      period: "Todo el tiempo",
    };

    return (
      <div>
        {/* Filtros de Reportes */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-header">
            <h3 className="card-title">📊 Reportes y Estadísticas</h3>
            <button
              className="btn btn-success"
              onClick={() => {
                // Generar reporte imprimible
                window.print();
              }}
            >
              🖨️ Imprimir Reporte
            </button>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div>
                <label className="form-label">📅 Período de Tiempo</label>
                <select
                  className="form-control select-control"
                  value={reportTimeFilter}
                  onChange={(e) => setReportTimeFilter(e.target.value)}
                >
                  <option value="daily">📊 Hoy</option>
                  <option value="weekly">📈 Esta Semana</option>
                  <option value="month">📆 Este Mes</option>
                  <option value="custom">🎯 Rango Personalizado</option>
                </select>
              </div>

              {reportTimeFilter === "custom" && (
                <>
                  <div>
                    <label className="form-label">📅 Fecha Inicio</label>
                    <input
                      type="date"
                      className="form-control"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">📅 Fecha Fin</label>
                    <input
                      type="date"
                      className="form-control"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  className="btn btn-outline"
                  onClick={filterReportsByTime}
                >
                  🔄 Actualizar Reporte
                </button>
              </div>
            </div>

            {filteredReports && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#e3f2fd",
                  borderRadius: "0.5rem",
                  borderLeft: "4px solid #1976d2",
                }}
              >
                <strong>📊 Período Seleccionado:</strong> {reportData.period}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards con datos filtrados */}
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-number">{reportData.totalCitas}</div>
            <div className="stat-label">Total Citas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{reportData.citasCompletadas}</div>
            <div className="stat-label">Citas Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{reportData.citasCanceladas}</div>
            <div className="stat-label">Citas Canceladas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {reportData.ingresoTotal.toFixed(2)}
            </div>
            <div className="stat-label">Ingresos del Período</div>
          </div>
        </div>

        {/* Gráficos y análisis */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🎯 Eficiencia de Citas</h3>
            </div>
            <div className="card-body">
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: "bold",
                    color: reportData.totalCitas > 0 ? "#48bb78" : "#a0aec0",
                    marginBottom: "1rem",
                  }}
                >
                  {reportData.totalCitas > 0
                    ? Math.round(
                        (reportData.citasCompletadas / reportData.totalCitas) *
                          100
                      )
                    : 0}
                  %
                </div>
                <p>Tasa de Finalización</p>
                <div style={{ fontSize: "0.9rem", color: "#718096" }}>
                  {reportData.citasCompletadas} de {reportData.totalCitas} citas
                  completadas
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💰 Análisis Financiero</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    background: "#f0fff4",
                    borderRadius: "0.5rem",
                    border: "1px solid #c6f6d5",
                  }}
                >
                  <span>💵 Ingresos Confirmados:</span>
                  <strong style={{ color: "#22543d" }}>
                    S/ {reportData.ingresoTotal.toFixed(2)}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <span>📊 Promedio por Cita:</span>
                  <strong>
                    S/{" "}
                    {reportData.citasCompletadas > 0
                      ? (
                          reportData.ingresoTotal / reportData.citasCompletadas
                        ).toFixed(2)
                      : "0.00"}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de citas del período filtrado */}
        {filteredReports &&
          filteredReports.appointments &&
          filteredReports.appointments.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  📋 Citas del Período Seleccionado
                </h3>
              </div>
              <div className="card-body no-padding">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Psicólogo</th>
                        <th>Estado</th>
                        <th>Modalidad</th>
                        <th>Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            {new Date(
                              appointment.fechaHora
                            ).toLocaleDateString()}
                          </td>
                          <td>{appointment.nombrePaciente}</td>
                          <td>{appointment.nombrePsicologo}</td>
                          <td>
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
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                appointment.modalidad === "PRESENCIAL"
                                  ? "badge-info"
                                  : "badge-success"
                              }`}
                            >
                              {appointment.modalidad}
                            </span>
                          </td>
                          <td>S/ {appointment.precio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  // MODAL MEJORADO CON VALIDACIONES
  const renderModal = () => {
    if (!showModal) return null;

    const isPatient = modalType === "createPatient";
    const title = isPatient ? "Agregar Paciente" : "Agregar Psicólogo";

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button onClick={closeModal} className="modal-close">
              &times;
            </button>
          </div>
          <form onSubmit={handleFormSubmit}>
            <div className="modal-body">
              <div className="form-row">
                <div>
                  <label className="form-label">Nombre completo *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.nombre ? "error" : ""
                    }`}
                    value={formData.nombre || ""}
                    onChange={(e) => handleFormChange("nombre", e.target.value)}
                    placeholder="Solo letras y espacios"
                    required
                  />
                  {formErrors.nombre && (
                    <small className="error-text">{formErrors.nombre}</small>
                  )}
                </div>
                <div>
                  <label className="form-label">Usuario *</label>
                  <input
                    type="text"
                    className={`form-control ${
                      formErrors.username ? "error" : ""
                    }`}
                    value={formData.username || ""}
                    onChange={(e) =>
                      handleFormChange("username", e.target.value)
                    }
                    placeholder="Letras, números y guiones bajos"
                    required
                  />
                  {formErrors.username && (
                    <small className="error-text">{formErrors.username}</small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className={`form-control ${
                      formErrors.email ? "error" : ""
                    }`}
                    value={formData.email || ""}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    placeholder="ejemplo@email.com"
                    required
                  />
                  {formErrors.email && (
                    <small className="error-text">{formErrors.email}</small>
                  )}
                </div>
                <div>
                  <label className="form-label">Contraseña *</label>
                  <input
                    type="password"
                    className={`form-control ${
                      formErrors.password ? "error" : ""
                    }`}
                    value={formData.password || ""}
                    onChange={(e) =>
                      handleFormChange("password", e.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  {formErrors.password && (
                    <small className="error-text">{formErrors.password}</small>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div>
                  <label className="form-label">Teléfono</label>
                  <input
                    type="tel"
                    className={`form-control ${
                      formErrors.telefono ? "error" : ""
                    }`}
                    value={formData.telefono || ""}
                    onChange={(e) =>
                      handleFormChange("telefono", e.target.value)
                    }
                    placeholder="999888777"
                  />
                  {formErrors.telefono && (
                    <small className="error-text">{formErrors.telefono}</small>
                  )}
                </div>
                {!isPatient && (
                  <div>
                    <label className="form-label">Especialidad *</label>
                    <input
                      type="text"
                      className={`form-control ${
                        formErrors.especialidad ? "error" : ""
                      }`}
                      value={formData.especialidad || ""}
                      onChange={(e) =>
                        handleFormChange("especialidad", e.target.value)
                      }
                      placeholder="Solo letras y espacios"
                      required
                    />
                    {formErrors.especialidad && (
                      <small className="error-text">
                        {formErrors.especialidad}
                      </small>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  loading ||
                  Object.keys(formErrors).some((key) => formErrors[key])
                }
              >
                {loading ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case "users":
        return renderUsers();
      case "allAppointments":
        return renderAllAppointments();
      case "payments":
        return renderPayments();
      case "reports":
        return renderReports();
      default:
        return renderHome();
    }
  };

  return (
    <>
      {renderContent()}
      {renderModal()}
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
          max-width: 600px;
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

        .form-control.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
        }

        .error-text {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

export default AdminDashboard;
