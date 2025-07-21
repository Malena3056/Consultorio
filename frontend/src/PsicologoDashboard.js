import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function PsicologoDashboard({
  user,
  activeView,
  data,
  onNavigate,
  onDataUpdate,
}) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState([]);
  const [noteForm, setNoteForm] = useState({
    tipoNota: "SEGUIMIENTO",
    contenido: "",
    observacionesGenerales: "",
    planTratamiento: "",
    tareasPaciente: "",
    estadoEmocional: "ESTABLE",
    nivelFuncionalidad: "MEDIO",
    sesionNumero: 1,
    requiereSeguimiento: false,
    pacienteSeleccionado: "",
  });
  const [realTimeStats, setRealTimeStats] = useState({
    citasHoy: 0,
    citasSemana: 0,
    pacientesUnicos: 0,
    horasTrabajadasMes: 0,
  });

  // Cargar notas clínicas del psicólogo
  useEffect(() => {
    if (user && user.id) {
      loadClinicalNotes();
    }
  }, [user]);

  // Calcular estadísticas en tiempo real basadas en datos reales
  useEffect(() => {
    if (data.appointments) {
      calculateRealTimeStats();
    }
  }, [data.appointments]);

  const loadClinicalNotes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/clinical-notes/psychologist/${user.id}`
      );
      setClinicalNotes(response.data || []);
    } catch (error) {
      console.error("Error loading clinical notes:", error);
    }
  };

  const calculateRealTimeStats = () => {
    const appointments = data.appointments || [];
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setRealTimeStats({
      citasHoy: appointments.filter((a) => {
        const appointmentDate = new Date(a.fechaHora);
        return appointmentDate.toDateString() === new Date().toDateString();
      }).length,
      citasSemana: appointments.filter((a) => {
        const appointmentDate = new Date(a.fechaHora);
        return appointmentDate >= startOfWeek;
      }).length,
      pacientesUnicos: new Set(appointments.map((a) => a.pacienteId)).size,
      horasTrabajadasMes: appointments.filter((a) => {
        const appointmentDate = new Date(a.fechaHora);
        return appointmentDate >= startOfMonth && a.estado === "COMPLETADA";
      }).length,
    });
  };

  const updateAppointment = async (appointmentId, updates) => {
    setLoading(true);
    try {
      await axios.put(`${API_BASE}/appointments/${appointmentId}`, updates);
      alert("Cita actualizada exitosamente");
      setShowModal(false);
      setNotes("");
      onDataUpdate(); // Recargar datos reales
    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("Error al actualizar cita: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ============= FUNCIONES DE NOTAS CLÍNICAS =============

  const createClinicalNote = async (appointmentData, noteData) => {
    try {
      const clinicalNoteData = {
        appointmentId: appointmentData.id,
        pacienteId: appointmentData.pacienteId,
        psicologoId: user.id,
        tipoNota: noteData.tipoNota,
        contenido: noteData.contenido,
        observacionesGenerales: noteData.observacionesGenerales,
        planTratamiento: noteData.planTratamiento,
        tareasPaciente: noteData.tareasPaciente,
        estadoEmocional: noteData.estadoEmocional,
        nivelFuncionalidad: noteData.nivelFuncionalidad,
        sesionNumero: noteData.sesionNumero,
        requiereSeguimiento: noteData.requiereSeguimiento,
        nombrePaciente: appointmentData.nombrePaciente,
        nombrePsicologo: user.nombre,
        modalidadSesion: appointmentData.modalidad,
      };

      const response = await axios.post(
        `${API_BASE}/clinical-notes`,
        clinicalNoteData
      );

      if (response.status === 200) {
        alert("✅ Nota clínica creada exitosamente");
        await loadClinicalNotes(); // Recargar notas
        return response.data;
      }
    } catch (error) {
      console.error("Error creating clinical note:", error);
      alert(
        "❌ Error al crear nota clínica: " +
          (error.response?.data?.message || error.message)
      );
      throw error;
    }
  };

  const updateClinicalNote = async (noteId, updates) => {
    try {
      const response = await axios.put(
        `${API_BASE}/clinical-notes/${noteId}`,
        updates
      );

      if (response.status === 200) {
        alert("✅ Nota clínica actualizada exitosamente");
        await loadClinicalNotes(); // Recargar notas
        return response.data;
      }
    } catch (error) {
      console.error("Error updating clinical note:", error);
      alert(
        "❌ Error al actualizar nota clínica: " +
          (error.response?.data?.message || error.message)
      );
      throw error;
    }
  };

  const openNotesModal = (appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notas || "");

    // Calcular número de sesión basado en citas completadas del paciente
    const patientCompletedSessions =
      data.appointments?.filter(
        (a) =>
          a.pacienteId === appointment.pacienteId && a.estado === "COMPLETADA"
      ).length || 0;

    setNoteForm({
      tipoNota:
        patientCompletedSessions === 0 ? "EVALUACION_INICIAL" : "SEGUIMIENTO",
      contenido: "",
      observacionesGenerales: "",
      planTratamiento: "",
      tareasPaciente: "",
      estadoEmocional: "ESTABLE",
      nivelFuncionalidad: "MEDIO",
      sesionNumero: patientCompletedSessions + 1,
      requiereSeguimiento: true,
      pacienteSeleccionado: appointment.pacienteId.toString(),
    });

    setModalType("notes");
    setShowModal(true);
  };

  const openNoteDetailModal = (note) => {
    setSelectedNote(note);
    setNoteForm({
      tipoNota: note.tipoNota || "SEGUIMIENTO",
      contenido: note.contenido || "",
      observacionesGenerales: note.observacionesGenerales || "",
      planTratamiento: note.planTratamiento || "",
      tareasPaciente: note.tareasPaciente || "",
      estadoEmocional: note.estadoEmocional || "ESTABLE",
      nivelFuncionalidad: note.nivelFuncionalidad || "MEDIO",
      sesionNumero: note.sesionNumero || 1,
      requiereSeguimiento: note.requiereSeguimiento || false,
    });
    setModalType("viewNote");
    setShowModal(true);
  };

  const openCreateNoteModal = () => {
    setSelectedNote(null);
    setSelectedAppointment(null);
    setNoteForm({
      tipoNota: "SEGUIMIENTO",
      contenido: "",
      observacionesGenerales: "",
      planTratamiento: "",
      tareasPaciente: "",
      estadoEmocional: "ESTABLE",
      nivelFuncionalidad: "MEDIO",
      sesionNumero: 1,
      requiereSeguimiento: false,
      pacienteSeleccionado: "",
    });
    setModalType("createNote");
    setShowModal(true);
  };

  const handleCompleteSession = async () => {
    if (selectedAppointment && noteForm.contenido.trim()) {
      setLoading(true);
      try {
        // 1. Crear la nota clínica detallada
        await createClinicalNote(selectedAppointment, noteForm);

        // 2. Actualizar la cita como completada con referencia básica
        await updateAppointment(selectedAppointment.id, {
          estado: "COMPLETADA",
          notas: `Sesión ${noteForm.sesionNumero} completada - Ver nota clínica detallada`,
        });

        setShowModal(false);
        resetForms();
      } catch (error) {
        // Error ya manejado en las funciones individuales
      } finally {
        setLoading(false);
      }
    } else {
      alert(
        "Por favor, completa al menos el contenido principal de la nota clínica."
      );
    }
  };

  const handleSaveNote = async () => {
    if (selectedNote && noteForm.contenido.trim()) {
      setLoading(true);
      try {
        await updateClinicalNote(selectedNote.id, noteForm);
        setShowModal(false);
        resetForms();
      } catch (error) {
        // Error ya manejado en updateClinicalNote
      } finally {
        setLoading(false);
      }
    } else {
      alert("Por favor, completa al menos el contenido de la nota clínica.");
    }
  };

  const resetForms = () => {
    setNotes("");
    setSelectedAppointment(null);
    setSelectedNote(null);
    setNoteForm({
      tipoNota: "SEGUIMIENTO",
      contenido: "",
      observacionesGenerales: "",
      planTratamiento: "",
      tareasPaciente: "",
      estadoEmocional: "ESTABLE",
      nivelFuncionalidad: "MEDIO",
      sesionNumero: 1,
      requiereSeguimiento: false,
      pacienteSeleccionado: "",
    });
  };

  const handleCancelAppointment = (appointmentId) => {
    if (window.confirm("¿Está seguro de cancelar esta cita?")) {
      updateAppointment(appointmentId, { estado: "CANCELADA" });
    }
  };

  const handleNoteFormChange = (field, value) => {
    setNoteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============= COMPONENTES DE RENDERIZADO =============

  const renderHome = () => {
    const todayAppointments =
      data.appointments?.filter((a) => {
        const appointmentDate = new Date(a.fechaHora).toDateString();
        const today = new Date().toDateString();
        return appointmentDate === today && a.estado === "RESERVADA";
      }) || [];

    const upcomingAppointments =
      data.appointments
        ?.filter((a) => {
          const appointmentDate = new Date(a.fechaHora);
          const today = new Date();
          return appointmentDate > today && a.estado === "RESERVADA";
        })
        .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)) || [];

    return (
      <div>
        {/* Stats Cards con datos reales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{data.appointments?.length || 0}</div>
            <div className="stat-label">Citas Totales</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{realTimeStats.citasHoy}</div>
            <div className="stat-label">Citas Hoy</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {data.appointments?.filter((a) => a.estado === "COMPLETADA")
                .length || 0}
            </div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{clinicalNotes.length}</div>
            <div className="stat-label">Notas Clínicas</div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-header">
            <h3 className="card-title">Citas de Hoy</h3>
            <span className="badge badge-primary">
              {todayAppointments.length} citas
            </span>
          </div>
          <div className="card-body">
            {todayAppointments.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#718096",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
                <p>No tienes citas programadas para hoy</p>
                <p style={{ fontSize: "0.9rem" }}>
                  ¡Perfecto momento para ponerte al día con las notas clínicas!
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Modalidad</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td>
                          <strong>
                            {new Date(appointment.fechaHora).toLocaleTimeString(
                              "es-ES",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </strong>
                        </td>
                        <td>{appointment.nombrePaciente}</td>
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
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => openNotesModal(appointment)}
                            >
                              ✅ Completar
                            </button>
                            {appointment.modalidad === "VIDEOLLAMADA" && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => {
                                  window.open(
                                    `https://meet.google.com/new`,
                                    "_blank"
                                  );
                                }}
                              >
                                🎥 Videollamada
                              </button>
                            )}
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

        {/* Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Acciones Rápidas</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate("agenda")}
                >
                  📋 Ver Mi Agenda Completa
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate("patients")}
                >
                  👥 Gestionar Pacientes ({realTimeStats.pacientesUnicos})
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => onNavigate("notes")}
                >
                  📝 Notas Clínicas ({clinicalNotes.length})
                </button>
                <button
                  className="btn btn-outline"
                  onClick={openCreateNoteModal}
                >
                  ➕ Nueva Nota Clínica
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Notas Clínicas Recientes</h3>
            </div>
            <div className="card-body">
              {clinicalNotes.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#718096",
                    padding: "1rem",
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    📝
                  </div>
                  <p>No hay notas clínicas</p>
                </div>
              ) : (
                clinicalNotes.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: "0.75rem 0",
                      borderBottom: "1px solid #e2e8f0",
                      cursor: "pointer",
                    }}
                    onClick={() => openNoteDetailModal(note)}
                  >
                    <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                      {note.nombrePaciente} - Sesión {note.sesionNumero}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#718096",
                        marginBottom: "0.25rem",
                      }}
                    >
                      📅 {new Date(note.fechaCreacion).toLocaleDateString()} •
                      📍 {note.modalidadSesion} • 🎯 {note.tipoNota}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#4a5568" }}>
                      {note.contenido?.substring(0, 60)}...
                    </div>
                  </div>
                ))
              )}
              {clinicalNotes.length > 3 && (
                <button
                  className="btn btn-outline btn-sm"
                  style={{ width: "100%", marginTop: "1rem" }}
                  onClick={() => onNavigate("notes")}
                >
                  Ver todas las notas ({clinicalNotes.length})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNotes = () => (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Notas Clínicas</h3>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-outline" onClick={loadClinicalNotes}>
              🔄 Actualizar
            </button>
            <button className="btn btn-primary" onClick={openCreateNoteModal}>
              📝 Nueva Nota
            </button>
          </div>
        </div>
        <div className="card-body no-padding">
          {clinicalNotes.length === 0 ? (
            <div
              style={{ padding: "3rem", textAlign: "center", color: "#718096" }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📝</div>
              <h3>No hay notas clínicas</h3>
              <p>
                Las notas clínicas aparecerán aquí cuando completes sesiones
              </p>
              <button className="btn btn-primary" onClick={openCreateNoteModal}>
                Crear Primera Nota
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Paciente</th>
                    <th>Sesión</th>
                    <th>Tipo</th>
                    <th>Estado Emocional</th>
                    <th>Seguimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clinicalNotes.map((note) => (
                    <tr key={note.id}>
                      <td>
                        {new Date(note.fechaCreacion).toLocaleDateString()}
                        <br />
                        <small style={{ color: "#718096" }}>
                          {new Date(note.fechaCreacion).toLocaleTimeString(
                            "es-ES",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </small>
                      </td>
                      <td>
                        <strong>{note.nombrePaciente}</strong>
                        <br />
                        <span
                          className={`badge ${
                            note.modalidadSesion === "PRESENCIAL"
                              ? "badge-info"
                              : "badge-success"
                          }`}
                        >
                          {note.modalidadSesion}
                        </span>
                      </td>
                      <td>
                        <strong>#{note.sesionNumero}</strong>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            note.tipoNota === "EVALUACION_INICIAL"
                              ? "badge-warning"
                              : note.tipoNota === "SEGUIMIENTO"
                              ? "badge-info"
                              : note.tipoNota === "CIERRE"
                              ? "badge-success"
                              : "badge-danger"
                          }`}
                        >
                          {note.tipoNota}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            note.estadoEmocional === "ESTABLE"
                              ? "badge-success"
                              : note.estadoEmocional === "ANSIOSO"
                              ? "badge-warning"
                              : note.estadoEmocional === "DEPRIMIDO"
                              ? "badge-danger"
                              : "badge-info"
                          }`}
                        >
                          {note.estadoEmocional}
                        </span>
                      </td>
                      <td>
                        {note.requiereSeguimiento ? (
                          <span className="badge badge-warning">
                            ⚠️ Requerido
                          </span>
                        ) : (
                          <span className="badge badge-success">
                            ✅ No requerido
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => openNoteDetailModal(note)}
                          >
                            👁️ Ver
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
    </div>
  );

  // Resto de funciones de renderizado (renderAgenda, renderPatients, etc.) mantienen el código original...
  const renderAgenda = () => {
    const pendingAppointments =
      data.appointments?.filter((a) => a.estado === "RESERVADA") || [];
    const completedAppointments =
      data.appointments?.filter((a) => a.estado === "COMPLETADA") || [];
    const cancelledAppointments =
      data.appointments?.filter((a) => a.estado === "CANCELADA") || [];

    return (
      <div>
        {/* Statistics Summary */}
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-number">{pendingAppointments.length}</div>
            <div className="stat-label">Citas Pendientes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{completedAppointments.length}</div>
            <div className="stat-label">Completadas Este Mes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{cancelledAppointments.length}</div>
            <div className="stat-label">Canceladas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/{" "}
              {completedAppointments
                .reduce((sum, a) => sum + (a.precio || 0), 0)
                .toFixed(2)}
            </div>
            <div className="stat-label">Ingresos Generados</div>
          </div>
        </div>

        {/* Próximas Citas */}
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="card-header">
            <h3 className="card-title">Próximas Citas</h3>
            <div style={{ display: "flex", gap: "1rem" }}>
              <span className="badge badge-info">
                {pendingAppointments.length} Pendientes
              </span>
            </div>
          </div>
          <div className="card-body no-padding">
            {pendingAppointments.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "#718096",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📅</div>
                <h3>No tienes citas pendientes</h3>
                <p>
                  ¡Perfecto momento para revisar notas clínicas o planificar
                  sesiones futuras!
                </p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha y Hora</th>
                      <th>Paciente</th>
                      <th>Modalidad</th>
                      <th>Precio</th>
                      <th>Estado Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAppointments
                      .sort(
                        (a, b) => new Date(a.fechaHora) - new Date(b.fechaHora)
                      )
                      .map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div>
                              <strong>
                                {new Date(
                                  appointment.fechaHora
                                ).toLocaleDateString()}
                              </strong>
                              <br />
                              <small style={{ color: "#718096" }}>
                                {new Date(
                                  appointment.fechaHora
                                ).toLocaleTimeString("es-ES", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </small>
                            </div>
                          </td>
                          <td>
                            <strong>{appointment.nombrePaciente}</strong>
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
                          <td>
                            <strong>S/ {appointment.precio}</strong>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                appointment.pagado
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {appointment.pagado
                                ? "✅ Pagado"
                                : "⏳ Pendiente"}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => openNotesModal(appointment)}
                              >
                                ✅ Completar
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  handleCancelAppointment(appointment.id)
                                }
                              >
                                ❌ Cancelar
                              </button>
                              {appointment.modalidad === "VIDEOLLAMADA" && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => {
                                    window.open(
                                      `https://meet.google.com/new`,
                                      "_blank"
                                    );
                                  }}
                                >
                                  🎥 Videollamada
                                </button>
                              )}
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
      </div>
    );
  };

  const renderPatients = () => {
    // Calcular pacientes únicos con estadísticas reales
    const myPatients =
      data.appointments?.reduce((acc, appointment) => {
        const existingPatient = acc.find(
          (p) => p.pacienteId === appointment.pacienteId
        );
        if (!existingPatient) {
          acc.push({
            pacienteId: appointment.pacienteId,
            nombrePaciente: appointment.nombrePaciente,
            ultimaCita: appointment.fechaHora,
            totalCitas: 1,
            citasCompletadas: appointment.estado === "COMPLETADA" ? 1 : 0,
            estadoUltimaCita: appointment.estado,
            ultimasNotas: appointment.notas,
            totalPagado: appointment.pagado ? appointment.precio : 0,
            modalidadPreferida: appointment.modalidad,
          });
        } else {
          existingPatient.totalCitas++;
          if (appointment.estado === "COMPLETADA") {
            existingPatient.citasCompletadas++;
          }
          if (appointment.pagado) {
            existingPatient.totalPagado += appointment.precio;
          }
          if (
            new Date(appointment.fechaHora) >
            new Date(existingPatient.ultimaCita)
          ) {
            existingPatient.ultimaCita = appointment.fechaHora;
            existingPatient.estadoUltimaCita = appointment.estado;
            existingPatient.ultimasNotas = appointment.notas;
          }
        }
        return acc;
      }, []) || [];

    return (
      <div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Mis Pacientes</h3>
            <span className="badge badge-primary">
              {myPatients.length} pacientes
            </span>
          </div>
          <div className="card-body">
            {myPatients.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#718096",
                }}
              >
                <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👥</div>
                <h3>Aún no tienes pacientes asignados</h3>
                <p>
                  Los pacientes aparecerán aquí cuando agenden citas contigo
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {myPatients.map((patient) => (
                  <div
                    key={patient.pacienteId}
                    className="card"
                    style={{ margin: 0 }}
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
                          <h4
                            style={{ margin: "0 0 0.5rem 0", color: "#2d3748" }}
                          >
                            {patient.nombrePaciente}
                          </h4>
                          <div
                            style={{ fontSize: "0.85rem", color: "#718096" }}
                          >
                            <div>📊 Total de citas: {patient.totalCitas}</div>
                            <div>
                              ✅ Completadas: {patient.citasCompletadas}
                            </div>
                            <div>
                              💰 Total pagado: S/{" "}
                              {patient.totalPagado.toFixed(2)}
                            </div>
                            <div>
                              📝 Notas clínicas:{" "}
                              {
                                clinicalNotes.filter(
                                  (n) => n.pacienteId === patient.pacienteId
                                ).length
                              }
                            </div>
                          </div>
                        </div>
                        <span
                          className={`badge ${
                            patient.estadoUltimaCita === "COMPLETADA"
                              ? "badge-success"
                              : patient.estadoUltimaCita === "RESERVADA"
                              ? "badge-warning"
                              : "badge-danger"
                          }`}
                        >
                          {patient.estadoUltimaCita}
                        </span>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#4a5568",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <strong>Última cita:</strong>{" "}
                          {new Date(patient.ultimaCita).toLocaleDateString()}
                        </div>
                        <div
                          style={{
                            fontSize: "0.9rem",
                            color: "#4a5568",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <strong>Modalidad preferida:</strong>
                          <span
                            className={`badge ${
                              patient.modalidadPreferida === "PRESENCIAL"
                                ? "badge-info"
                                : "badge-success"
                            }`}
                            style={{ marginLeft: "0.5rem" }}
                          >
                            {patient.modalidadPreferida}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            // Mostrar historial completo del paciente
                            const patientAppointments =
                              data.appointments.filter(
                                (a) => a.pacienteId === patient.pacienteId
                              );
                            const patientNotes = clinicalNotes.filter(
                              (n) => n.pacienteId === patient.pacienteId
                            );

                            alert(`Historial de ${patient.nombrePaciente}:

CITAS:
${patientAppointments
  .map(
    (a) =>
      `• ${new Date(a.fechaHora).toLocaleDateString()} - ${a.estado} - S/${
        a.precio
      }`
  )
  .join("\n")}

NOTAS CLÍNICAS: ${patientNotes.length} registros
${patientNotes
  .slice(0, 3)
  .map(
    (n) =>
      `• Sesión ${n.sesionNumero} (${new Date(
        n.fechaCreacion
      ).toLocaleDateString()}) - ${n.tipoNota}`
  )
  .join("\n")}
${patientNotes.length > 3 ? `... y ${patientNotes.length - 3} más` : ""}`);
                          }}
                        >
                          📋 Ver Historial
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            // Mostrar notas clínicas específicas del paciente
                            const patientNotes = clinicalNotes.filter(
                              (n) => n.pacienteId === patient.pacienteId
                            );
                            if (patientNotes.length > 0) {
                              openNoteDetailModal(patientNotes[0]);
                            } else {
                              alert("No hay notas clínicas para este paciente");
                            }
                          }}
                        >
                          📝 Ver Notas
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Función para crear nota independiente
  const handleCreateIndependentNote = async () => {
    if (noteForm.contenido.trim() && noteForm.pacienteSeleccionado) {
      setLoading(true);
      try {
        const selectedPatient = data.appointments?.find(
          (a) => a.pacienteId == noteForm.pacienteSeleccionado
        );
        if (!selectedPatient) {
          alert("❌ Error: Paciente no encontrado");
          return;
        }

        const clinicalNoteData = {
          appointmentId: null, // Nota independiente
          pacienteId: noteForm.pacienteSeleccionado,
          psicologoId: user.id,
          tipoNota: noteForm.tipoNota,
          contenido: noteForm.contenido,
          observacionesGenerales: noteForm.observacionesGenerales,
          planTratamiento: noteForm.planTratamiento,
          tareasPaciente: noteForm.tareasPaciente,
          estadoEmocional: noteForm.estadoEmocional,
          nivelFuncionalidad: noteForm.nivelFuncionalidad,
          sesionNumero: noteForm.sesionNumero,
          requiereSeguimiento: noteForm.requiereSeguimiento,
          nombrePaciente: selectedPatient.nombrePaciente,
          nombrePsicologo: user.nombre,
          modalidadSesion: "INDEPENDIENTE",
        };

        const response = await axios.post(
          `${API_BASE}/clinical-notes`,
          clinicalNoteData
        );

        if (response.status === 200) {
          alert("✅ Nota clínica creada exitosamente");
          await loadClinicalNotes();
          setShowModal(false);
          resetForms();
        }
      } catch (error) {
        console.error("Error creating independent note:", error);
        alert(
          "❌ Error al crear nota: " +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setLoading(false);
      }
    } else {
      alert(
        "Por favor, selecciona un paciente y completa el contenido de la nota."
      );
    }
  };

  // Modal mejorado para notas clínicas
  const renderModal = () => {
    if (!showModal) return null;

    if (modalType === "createNote") {
      // Obtener lista de pacientes únicos
      const uniquePatients =
        data.appointments?.reduce((acc, appointment) => {
          if (!acc.find((p) => p.pacienteId === appointment.pacienteId)) {
            acc.push({
              pacienteId: appointment.pacienteId,
              nombrePaciente: appointment.nombrePaciente,
            });
          }
          return acc;
        }, []) || [];

      return (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">📝 Crear Nueva Nota Clínica</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#e3f2fd",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>ℹ️ Información:</strong> Esta nota será independiente de
                cualquier cita específica. Úsala para registrar observaciones,
                seguimientos o notas generales sobre el paciente.
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Seleccionar Paciente *</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.pacienteSeleccionado || ""}
                    onChange={(e) =>
                      handleNoteFormChange(
                        "pacienteSeleccionado",
                        e.target.value
                      )
                    }
                  >
                    <option value="">Selecciona un paciente</option>
                    {uniquePatients.map((patient) => (
                      <option
                        key={patient.pacienteId}
                        value={patient.pacienteId}
                      >
                        {patient.nombrePaciente}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Tipo de Nota *</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.tipoNota}
                    onChange={(e) =>
                      handleNoteFormChange("tipoNota", e.target.value)
                    }
                  >
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="EVALUACION_INICIAL">
                      Evaluación Inicial
                    </option>
                    <option value="CIERRE">Cierre de Tratamiento</option>
                    <option value="EMERGENCIA">Emergencia</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Estado Emocional</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.estadoEmocional}
                    onChange={(e) =>
                      handleNoteFormChange("estadoEmocional", e.target.value)
                    }
                  >
                    <option value="ESTABLE">Estable</option>
                    <option value="ANSIOSO">Ansioso</option>
                    <option value="DEPRIMIDO">Deprimido</option>
                    <option value="EUFÓRICO">Eufórico</option>
                    <option value="IRRITABLE">Irritable</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Nivel de Funcionalidad</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.nivelFuncionalidad}
                    onChange={(e) =>
                      handleNoteFormChange("nivelFuncionalidad", e.target.value)
                    }
                  >
                    <option value="ALTO">Alto</option>
                    <option value="MEDIO">Medio</option>
                    <option value="BAJO">Bajo</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Número de Nota</label>
                  <input
                    type="number"
                    className="form-control"
                    value={noteForm.sesionNumero}
                    onChange={(e) =>
                      handleNoteFormChange(
                        "sesionNumero",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                    placeholder="Número correlativo de la nota"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Contenido Principal de la Nota *
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe las observaciones, seguimiento, evaluación o cualquier información relevante del paciente..."
                  value={noteForm.contenido}
                  onChange={(e) =>
                    handleNoteFormChange("contenido", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="form-label">Observaciones Generales</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Observaciones adicionales sobre el comportamiento, actitud o progreso del paciente..."
                  value={noteForm.observacionesGenerales}
                  onChange={(e) =>
                    handleNoteFormChange(
                      "observacionesGenerales",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label className="form-label">Plan de Tratamiento</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Objetivos terapéuticos, estrategias recomendadas, modificaciones al tratamiento..."
                  value={noteForm.planTratamiento}
                  onChange={(e) =>
                    handleNoteFormChange("planTratamiento", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="form-label">
                  Recomendaciones para el Paciente
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Tareas, ejercicios o recomendaciones específicas para el paciente..."
                  value={noteForm.tareasPaciente}
                  onChange={(e) =>
                    handleNoteFormChange("tareasPaciente", e.target.value)
                  }
                />
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label
                  className="form-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={noteForm.requiereSeguimiento}
                    onChange={(e) =>
                      handleNoteFormChange(
                        "requiereSeguimiento",
                        e.target.checked
                      )
                    }
                  />
                  ⚠️ Requiere seguimiento especial
                </label>
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
                onClick={handleCreateIndependentNote}
                disabled={
                  loading ||
                  !noteForm.contenido.trim() ||
                  !noteForm.pacienteSeleccionado
                }
              >
                {loading ? "Creando..." : "📝 Crear Nota"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "notes") {
      return (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                Completar Sesión - {selectedAppointment?.nombrePaciente}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>📅 Fecha:</strong>{" "}
                {new Date(selectedAppointment?.fechaHora).toLocaleString()}
                <br />
                <strong>📍 Modalidad:</strong> {selectedAppointment?.modalidad}
                <br />
                <strong>💰 Precio:</strong> S/ {selectedAppointment?.precio}
                <br />
                <strong>🔢 Sesión número:</strong> {noteForm.sesionNumero}
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Tipo de Nota *</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.tipoNota}
                    onChange={(e) =>
                      handleNoteFormChange("tipoNota", e.target.value)
                    }
                  >
                    <option value="EVALUACION_INICIAL">
                      Evaluación Inicial
                    </option>
                    <option value="SEGUIMIENTO">Seguimiento</option>
                    <option value="CIERRE">Cierre de Tratamiento</option>
                    <option value="EMERGENCIA">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Estado Emocional</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.estadoEmocional}
                    onChange={(e) =>
                      handleNoteFormChange("estadoEmocional", e.target.value)
                    }
                  >
                    <option value="ESTABLE">Estable</option>
                    <option value="ANSIOSO">Ansioso</option>
                    <option value="DEPRIMIDO">Deprimido</option>
                    <option value="EUFÓRICO">Eufórico</option>
                    <option value="IRRITABLE">Irritable</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Nivel de Funcionalidad</label>
                  <select
                    className="form-control select-control"
                    value={noteForm.nivelFuncionalidad}
                    onChange={(e) =>
                      handleNoteFormChange("nivelFuncionalidad", e.target.value)
                    }
                  >
                    <option value="ALTO">Alto</option>
                    <option value="MEDIO">Medio</option>
                    <option value="BAJO">Bajo</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Sesión Número</label>
                  <input
                    type="number"
                    className="form-control"
                    value={noteForm.sesionNumero}
                    onChange={(e) =>
                      handleNoteFormChange(
                        "sesionNumero",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">
                  Contenido Principal de la Sesión *
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Describe los temas principales tratados, observaciones clave, progreso del paciente..."
                  value={noteForm.contenido}
                  onChange={(e) =>
                    handleNoteFormChange("contenido", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className="form-label">Observaciones Generales</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Observaciones sobre el comportamiento, actitud, participación del paciente..."
                  value={noteForm.observacionesGenerales}
                  onChange={(e) =>
                    handleNoteFormChange(
                      "observacionesGenerales",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label className="form-label">Plan de Tratamiento</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Objetivos terapéuticos, estrategias a implementar, próximos pasos..."
                  value={noteForm.planTratamiento}
                  onChange={(e) =>
                    handleNoteFormChange("planTratamiento", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="form-label">Tareas para el Paciente</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Ejercicios, tareas o actividades recomendadas para realizar entre sesiones..."
                  value={noteForm.tareasPaciente}
                  onChange={(e) =>
                    handleNoteFormChange("tareasPaciente", e.target.value)
                  }
                />
              </div>

              <div style={{ marginTop: "1rem" }}>
                <label
                  className="form-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={noteForm.requiereSeguimiento}
                    onChange={(e) =>
                      handleNoteFormChange(
                        "requiereSeguimiento",
                        e.target.checked
                      )
                    }
                  />
                  ⚠️ Requiere seguimiento especial
                </label>
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
                onClick={handleCompleteSession}
                disabled={loading || !noteForm.contenido.trim()}
              >
                {loading ? "Completando..." : "✅ Completar Sesión"}
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modalType === "viewNote" || modalType === "editNote") {
      const isEditing = modalType === "editNote";
      return (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {isEditing ? "Editar" : "Ver"} Nota Clínica -{" "}
                {selectedNote?.nombrePaciente}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "#f8f9fa",
                  borderRadius: "0.5rem",
                }}
              >
                <strong>📅 Fecha:</strong>{" "}
                {new Date(selectedNote?.fechaCreacion).toLocaleString()}
                <br />
                <strong>📍 Modalidad:</strong> {selectedNote?.modalidadSesion}
                <br />
                <strong>🔢 Sesión:</strong> #{selectedNote?.sesionNumero}
                <br />
                <strong>🎯 Tipo:</strong> {selectedNote?.tipoNota}
              </div>

              {isEditing ? (
                <>
                  <div className="form-row">
                    <div>
                      <label className="form-label">Tipo de Nota</label>
                      <select
                        className="form-control select-control"
                        value={noteForm.tipoNota}
                        onChange={(e) =>
                          handleNoteFormChange("tipoNota", e.target.value)
                        }
                      >
                        <option value="EVALUACION_INICIAL">
                          Evaluación Inicial
                        </option>
                        <option value="SEGUIMIENTO">Seguimiento</option>
                        <option value="CIERRE">Cierre de Tratamiento</option>
                        <option value="EMERGENCIA">Emergencia</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Estado Emocional</label>
                      <select
                        className="form-control select-control"
                        value={noteForm.estadoEmocional}
                        onChange={(e) =>
                          handleNoteFormChange(
                            "estadoEmocional",
                            e.target.value
                          )
                        }
                      >
                        <option value="ESTABLE">Estable</option>
                        <option value="ANSIOSO">Ansioso</option>
                        <option value="DEPRIMIDO">Deprimido</option>
                        <option value="EUFÓRICO">Eufórico</option>
                        <option value="IRRITABLE">Irritable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Contenido Principal</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={noteForm.contenido}
                      onChange={(e) =>
                        handleNoteFormChange("contenido", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Observaciones Generales
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={noteForm.observacionesGenerales}
                      onChange={(e) =>
                        handleNoteFormChange(
                          "observacionesGenerales",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label">Plan de Tratamiento</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={noteForm.planTratamiento}
                      onChange={(e) =>
                        handleNoteFormChange("planTratamiento", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Tareas para el Paciente
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={noteForm.tareasPaciente}
                      onChange={(e) =>
                        handleNoteFormChange("tareasPaciente", e.target.value)
                      }
                    />
                  </div>

                  <div style={{ marginTop: "1rem" }}>
                    <label
                      className="form-label"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={noteForm.requiereSeguimiento}
                        onChange={(e) =>
                          handleNoteFormChange(
                            "requiereSeguimiento",
                            e.target.checked
                          )
                        }
                      />
                      ⚠️ Requiere seguimiento especial
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h4 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
                      📝 Contenido Principal
                    </h4>
                    <div
                      style={{
                        padding: "1rem",
                        background: "#f8f9fa",
                        borderRadius: "0.5rem",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {selectedNote?.contenido || "Sin contenido"}
                    </div>
                  </div>

                  {selectedNote?.observacionesGenerales && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
                        👁️ Observaciones Generales
                      </h4>
                      <div
                        style={{
                          padding: "1rem",
                          background: "#f8f9fa",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedNote.observacionesGenerales}
                      </div>
                    </div>
                  )}

                  {selectedNote?.planTratamiento && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
                        🎯 Plan de Tratamiento
                      </h4>
                      <div
                        style={{
                          padding: "1rem",
                          background: "#f8f9fa",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedNote.planTratamiento}
                      </div>
                    </div>
                  )}

                  {selectedNote?.tareasPaciente && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h4 style={{ color: "#2d3748", marginBottom: "0.5rem" }}>
                        📋 Tareas para el Paciente
                      </h4>
                      <div
                        style={{
                          padding: "1rem",
                          background: "#f8f9fa",
                          borderRadius: "0.5rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {selectedNote.tareasPaciente}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "1rem",
                      marginTop: "1.5rem",
                    }}
                  >
                    <div>
                      <strong>🎭 Estado Emocional:</strong>
                      <br />
                      <span
                        className={`badge ${
                          selectedNote?.estadoEmocional === "ESTABLE"
                            ? "badge-success"
                            : selectedNote?.estadoEmocional === "ANSIOSO"
                            ? "badge-warning"
                            : selectedNote?.estadoEmocional === "DEPRIMIDO"
                            ? "badge-danger"
                            : "badge-info"
                        }`}
                      >
                        {selectedNote?.estadoEmocional}
                      </span>
                    </div>
                    <div>
                      <strong>📊 Funcionalidad:</strong>
                      <br />
                      <span
                        className={`badge ${
                          selectedNote?.nivelFuncionalidad === "ALTO"
                            ? "badge-success"
                            : selectedNote?.nivelFuncionalidad === "MEDIO"
                            ? "badge-warning"
                            : "badge-danger"
                        }`}
                      >
                        {selectedNote?.nivelFuncionalidad}
                      </span>
                    </div>
                    <div>
                      <strong>⚠️ Seguimiento:</strong>
                      <br />
                      <span
                        className={`badge ${
                          selectedNote?.requiereSeguimiento
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                      >
                        {selectedNote?.requiereSeguimiento
                          ? "Requerido"
                          : "No requerido"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowModal(false)}
              >
                {isEditing ? "Cancelar" : "Cerrar"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleSaveNote}
                  disabled={loading || !noteForm.contenido.trim()}
                >
                  {loading ? "Guardando..." : "💾 Guardar Cambios"}
                </button>
              ) : (
                <button></button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderContent = () => {
    switch (activeView) {
      case "agenda":
        return renderAgenda();
      case "patients":
        return renderPatients();
      case "notes":
        return renderNotes();
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

        .modal-large {
          max-width: 800px;
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

        .session-link {
          color: #3182ce;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.85rem;
        }

        .session-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </>
  );
}

export default PsicologoDashboard;
