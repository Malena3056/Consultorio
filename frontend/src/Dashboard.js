import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import PsicologoDashboard from "./PsicologoDashboard";
import PacienteDashboard from "./PacienteDashboard";
import ProfileComponent from "./ProfileComponent";
import ReportsComponent from "./ReportsComponent";
import "./Dashboard.css";

const API_BASE = "http://localhost:8080/api";

function Dashboard({ user, setUser }) {
  const [activeView, setActiveView] = useState("home");
  const [data, setData] = useState({
    appointments: [],
    users: [],
    psicologos: [],
    pacientes: [],
    reports: null,
    loading: false,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const loadDashboardData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setData((prev) => ({ ...prev, loading: true }));
      }

      try {
        if (user.role === "PACIENTE") {
          const [appointmentsRes, psicologosRes] = await Promise.all([
            axios.get(`${API_BASE}/appointments/patient/${user.id}`),
            axios.get(`${API_BASE}/psicologos`),
          ]);

          setData((prev) => ({
            ...prev,
            appointments: appointmentsRes.data || [],
            psicologos: psicologosRes.data || [],
            loading: false,
          }));
        } else if (user.role === "PSICOLOGO") {
          const appointmentsRes = await axios.get(
            `${API_BASE}/appointments/psychologist/${user.id}`
          );

          setData((prev) => ({
            ...prev,
            appointments: appointmentsRes.data || [],
            loading: false,
          }));
        } else if (user.role === "ADMIN") {
          const [usersRes, reportsRes, allAppointmentsRes] = await Promise.all([
            axios.get(`${API_BASE}/users`),
            axios.get(`${API_BASE}/reports`),
            axios.get(`${API_BASE}/appointments`),
          ]);

          const users = usersRes.data || [];
          setData((prev) => ({
            ...prev,
            users,
            reports: reportsRes.data,
            appointments: allAppointmentsRes.data || [],
            psicologos: users.filter((u) => u.role === "PSICOLOGO"),
            pacientes: users.filter((u) => u.role === "PACIENTE"),
            loading: false,
          }));
        }

        console.log("✅ Datos actualizados correctamente");
      } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
        setData((prev) => ({ ...prev, loading: false }));

        // Mostrar error al usuario
        alert("Error al cargar datos. Por favor, intenta nuevamente.");
      }
    },
    [user.role, user.id]
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, [user, navigate, loadDashboardData, refreshKey]);

  const handleDataUpdate = useCallback(async () => {
    console.log("🔄 Actualizando datos...");
    await loadDashboardData(false);
    setRefreshKey((prev) => prev + 1);
  }, [loadDashboardData]);

  const handleUserUpdate = useCallback(
    (updatedUser) => {
      console.log("👤 Actualizando usuario...");
      setUser(updatedUser);

      const rememberedUser = localStorage.getItem("rememberedUser");
      if (rememberedUser) {
        localStorage.setItem("rememberedUser", JSON.stringify(updatedUser));
      }

      setTimeout(() => {
        handleDataUpdate();
      }, 500);
    },
    [setUser, handleDataUpdate]
  );

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("rememberedUser");
    navigate("/");
  };

  const getNavigationItems = () => {
    const baseItems = [{ key: "home", label: "🏠 Inicio", icon: "🏠" }];

    switch (user.role) {
      case "PACIENTE":
        return [
          ...baseItems,
          { key: "appointments", label: "📅 Mis Citas", icon: "📅" },
          { key: "newAppointment", label: "➕ Agendar Cita", icon: "➕" },
          { key: "payments", label: "💳 Mis Pagos", icon: "💳" },
          { key: "history", label: "📋 Historial", icon: "📋" },
          { key: "profile", label: "👤 Mi Perfil", icon: "👤" },
          { key: "reports", label: "📊 Mis Reportes", icon: "📊" },
        ];
      case "PSICOLOGO":
        return [
          ...baseItems,
          { key: "agenda", label: "📋 Mi Agenda", icon: "📋" },
          { key: "patients", label: "👥 Mis Pacientes", icon: "👥" },
          {
            key: "virtualSessions",
            label: "🎥 Sesiones Virtuales",
            icon: "🎥",
          },
          { key: "notes", label: "📝 Notas Clínicas", icon: "📝" },
          { key: "profile", label: "👤 Mi Perfil", icon: "👤" },
          { key: "reports", label: "📊 Mis Estadísticas", icon: "📊" },
        ];
      case "ADMIN":
        return [
          ...baseItems,
          { key: "users", label: "👤 Gestionar Usuarios", icon: "👤" },
          { key: "allAppointments", label: "📅 Agenda de Citas", icon: "📅" },
          { key: "payments", label: "💰 Pagos por Cita", icon: "💰" },
          { key: "reports", label: "📊 Panel de Administrador", icon: "📊" },
          { key: "profile", label: "⚙️ Mi Perfil", icon: "⚙️" },
        ];
      default:
        return baseItems;
    }
  };

  const handleNavigation = (view) => {
    setActiveView(view);
    if (["home", "appointments", "agenda", "users", "reports"].includes(view)) {
      handleDataUpdate();
    }
  };

  const getDashboardComponent = () => {
    const props = {
      user,
      activeView,
      data,
      onNavigate: handleNavigation,
      onDataUpdate: handleDataUpdate,
      onUserUpdate: handleUserUpdate,
    };

    if (activeView === "profile") {
      return <ProfileComponent user={user} onUserUpdate={handleUserUpdate} />;
    }

    if (activeView === "reports") {
      return <ReportsComponent user={user} />;
    }

    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard {...props} />;
      case "PSICOLOGO":
        return <PsicologoDashboard {...props} />;
      case "PACIENTE":
        return <PacienteDashboard {...props} />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  const getPageTitle = () => {
    const currentItem = getNavigationItems().find(
      (item) => item.key === activeView
    );
    return currentItem?.label || "Panel de Control";
  };

  const getUserGreeting = () => {
    const hour = new Date().getHours();
    let greeting = "";

    if (hour < 12) {
      greeting = "Buenos días";
    } else if (hour < 18) {
      greeting = "Buenas tardes";
    } else {
      greeting = "Buenas noches";
    }

    return `${greeting}, ${user.nombre}`;
  };

  const getProfileImageUrl = () => {
    if (user.fotoPerfil) {
      return `${API_BASE}${user.fotoPerfil}`;
    }
    return null;
  };

  // Función corregida para manejar la imagen de perfil sin errores
  const renderProfileImage = () => {
    const imageUrl = getProfileImageUrl();

    if (imageUrl) {
      return (
        <div style={{ position: "relative" }}>
          <img
            src={imageUrl}
            alt="Foto de perfil"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid white",
            }}
            onError={(e) => {
              // Manejo seguro del error de imagen
              try {
                if (e.target) {
                  e.target.style.display = "none";
                  // Buscar el elemento fallback de manera segura
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
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "1.2rem",
              fontWeight: "bold",
              border: "2px solid white",
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
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "1.2rem",
          fontWeight: "bold",
          border: "2px solid white",
        }}
      >
        {user.nombre?.charAt(0)?.toUpperCase() || "U"}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🧠</div>
            <span>PSICÓLOGOS</span>
          </div>
        </div>

        <div className="user-info">
          <div className="user-avatar">{renderProfileImage()}</div>
          <div className="user-details">
            <div className="user-name">{user.nombre}</div>
            <div className="user-role">{user.role}</div>
            <div className="user-email">{user.email}</div>
            {user.role === "PSICOLOGO" && user.especialidad && (
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#cbd5e0",
                  marginTop: "0.25rem",
                }}
              >
                {user.especialidad}
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          {getNavigationItems().map((item) => (
            <div key={item.key} className="nav-item">
              <button
                className={`nav-link ${
                  activeView === item.key ? "active" : ""
                }`}
                onClick={() => handleNavigation(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <div className="page-title">{getPageTitle()}</div>
          <div className="user-menu">
            <span className="welcome-text">{getUserGreeting()}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {/* Botón de actualización manual */}
              <button
                className="btn btn-outline btn-sm"
                onClick={handleDataUpdate}
                disabled={data.loading}
                style={{ fontSize: "0.85rem" }}
                title="Actualizar datos"
              >
                {data.loading ? "🔄" : "↻"} Actualizar
              </button>

              {/* Quick Actions */}
              {user.role === "PACIENTE" && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleNavigation("newAppointment")}
                  style={{ fontSize: "0.85rem" }}
                >
                  ➕ Agendar Cita
                </button>
              )}

              {user.role === "ADMIN" && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleNavigation("users")}
                  style={{ fontSize: "0.85rem" }}
                >
                  👤 Usuarios
                </button>
              )}

              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleNavigation("profile")}
                style={{ fontSize: "0.85rem" }}
              >
                ⚙️ Perfil
              </button>

              <button className="logout-btn" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <div className="content-area">
          {data.loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando datos...</p>
            </div>
          ) : (
            <div key={refreshKey}>{getDashboardComponent()}</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
