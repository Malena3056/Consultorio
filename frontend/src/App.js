import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import "./Global.css";

// Configuración de la aplicación
const APP_CONFIG = {
  name: "Centro Psicológico Bienestar",
  version: "1.0.0",
  apiBaseUrl: "http://localhost:8080/api",
  storageKeys: {
    rememberedUser: "rememberedUser",
    sessionToken: "sessionToken",
    preferences: "userPreferences",
  },
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appReady, setAppReady] = useState(false);

  // Check for remembered user and validate session on app startup
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Simular verificación de conectividad
      await checkConnectivity();

      // Verificar usuario recordado
      const rememberedUser = localStorage.getItem(
        APP_CONFIG.storageKeys.rememberedUser
      );

      if (rememberedUser) {
        try {
          const userData = JSON.parse(rememberedUser);

          // Validar estructura de datos del usuario
          if (validateUserData(userData)) {
            setUser(userData);
            console.log(
              "Usuario recordado cargado exitosamente:",
              userData.nombre
            );
          } else {
            console.warn("Datos de usuario inválidos, limpiando localStorage");
            localStorage.removeItem(APP_CONFIG.storageKeys.rememberedUser);
          }
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          localStorage.removeItem(APP_CONFIG.storageKeys.rememberedUser);
        }
      }

      // Cargar preferencias del usuario
      loadUserPreferences();

      setAppReady(true);
    } catch (error) {
      console.error("Error initializing app:", error);
      setError(
        "Error al inicializar la aplicación. Por favor, recarga la página."
      );
    } finally {
      setLoading(false);
    }
  };

  const checkConnectivity = () => {
    return new Promise((resolve, reject) => {
      // Verificar si la API está disponible
      fetch(`${APP_CONFIG.apiBaseUrl}/reports`, { method: "HEAD" })
        .then(() => resolve())
        .catch(() => {
          // Si falla, intentar con un endpoint básico o resolver anyway para modo offline
          console.warn("API no disponible, continuando en modo offline");
          resolve();
        });
    });
  };

  const validateUserData = (userData) => {
    return (
      userData &&
      typeof userData === "object" &&
      userData.id &&
      userData.username &&
      userData.nombre &&
      userData.email &&
      userData.role &&
      ["ADMIN", "PSICOLOGO", "PACIENTE"].includes(userData.role)
    );
  };

  const loadUserPreferences = () => {
    try {
      const preferences = localStorage.getItem(
        APP_CONFIG.storageKeys.preferences
      );
      if (preferences) {
        const parsedPreferences = JSON.parse(preferences);
        applyUserPreferences(parsedPreferences);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }
  };

  const applyUserPreferences = (preferences) => {
    // Aplicar tema si está guardado
    if (preferences.theme) {
      document.documentElement.setAttribute("data-theme", preferences.theme);
    }

    // Aplicar configuraciones de accesibilidad
    if (preferences.fontSize) {
      document.documentElement.style.fontSize = preferences.fontSize;
    }

    if (preferences.highContrast) {
      document.documentElement.classList.add("high-contrast");
    }
  };

  const handleUserLogin = (userData) => {
    if (validateUserData(userData)) {
      setUser(userData);
      setError(null);

      // Log del inicio de sesión exitoso
      console.log(`Usuario logueado: ${userData.nombre} (${userData.role})`);

      // Guardar métricas de uso (opcional)
      trackUserLogin(userData);
    } else {
      setError("Datos de usuario inválidos recibidos del servidor");
    }
  };

  const handleUserLogout = () => {
    if (user) {
      console.log(`Usuario deslogueado: ${user.nombre}`);

      // Limpiar datos de sesión
      setUser(null);
      setError(null);

      // Limpiar localStorage
      localStorage.removeItem(APP_CONFIG.storageKeys.rememberedUser);
      localStorage.removeItem(APP_CONFIG.storageKeys.sessionToken);

      // Opcional: enviar métricas de logout
      trackUserLogout();
    }
  };

  const trackUserLogin = (userData) => {
    try {
      // Aquí podrías enviar métricas a un servicio de analytics
      const loginEvent = {
        timestamp: new Date().toISOString(),
        userId: userData.id,
        role: userData.role,
        userAgent: navigator.userAgent,
      };

      // Por ahora solo lo guardamos en localStorage para debugging
      const metrics = JSON.parse(localStorage.getItem("userMetrics") || "[]");
      metrics.push(loginEvent);
      localStorage.setItem("userMetrics", JSON.stringify(metrics.slice(-10))); // Mantener últimos 10
    } catch (error) {
      console.error("Error tracking login:", error);
    }
  };

  const trackUserLogout = () => {
    try {
      const logoutEvent = {
        timestamp: new Date().toISOString(),
        action: "logout",
      };

      const metrics = JSON.parse(localStorage.getItem("userMetrics") || "[]");
      metrics.push(logoutEvent);
      localStorage.setItem("userMetrics", JSON.stringify(metrics.slice(-10)));
    } catch (error) {
      console.error("Error tracking logout:", error);
    }
  };

  // Error boundary para capturar errores en componentes hijos
  const handleError = (error, errorInfo) => {
    console.error("Error boundary caught an error:", error, errorInfo);
    setError("Ha ocurrido un error inesperado. Por favor, recarga la página.");
  };

  // Loading screen mejorado
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">{APP_CONFIG.name}</span>
          </div>
          <div className="loading-spinner"></div>
          <p>Cargando aplicación...</p>
          <div style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
            Versión {APP_CONFIG.version}
          </div>
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !appReady) {
    return (
      <div
        className="loading-screen"
        style={{
          background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
        }}
      >
        <div className="loading-content">
          <div className="loading-logo">
            <span className="logo-icon" style={{ fontSize: "3rem" }}>
              ⚠️
            </span>
            <span className="logo-text">Error de Aplicación</span>
          </div>
          <p style={{ textAlign: "center", marginBottom: "2rem" }}>{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "2px solid white",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "0.75rem",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "600",
            }}
          >
            🔄 Recargar Página
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Meta información de la app */}
        <div style={{ display: "none" }}>
          <span id="app-name">{APP_CONFIG.name}</span>
          <span id="app-version">{APP_CONFIG.version}</span>
        </div>

        {/* Error global display */}
        {error && appReady && (
          <div
            style={{
              position: "fixed",
              top: "1rem",
              right: "1rem",
              background: "#fed7d7",
              color: "#742a2a",
              padding: "1rem",
              borderRadius: "0.75rem",
              border: "1px solid #f56565",
              zIndex: 9999,
              maxWidth: "400px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  marginLeft: "1rem",
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" replace /> : <Home />}
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  setUser={handleUserLogin}
                  onError={setError}
                  appConfig={APP_CONFIG}
                />
              )
            }
          />

          {/* NUEVA RUTA DE REGISTRO */}
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard/*"
            element={
              user ? (
                <Dashboard
                  user={user}
                  setUser={setUser}
                  onLogout={handleUserLogout}
                  onError={setError}
                  appConfig={APP_CONFIG}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Footer de información de desarrollo (solo en desarrollo) */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "fixed",
              bottom: "1rem",
              left: "1rem",
              background: "rgba(0,0,0,0.8)",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              zIndex: 9999,
              fontFamily: "monospace",
            }}
          >
            {APP_CONFIG.name} v{APP_CONFIG.version} - DEV
            {user && ` | ${user.role}: ${user.nombre}`}
          </div>
        )}
      </div>
    </Router>
  );
}

// Envoltorio de error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="loading-screen"
          style={{
            background: "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
          }}
        >
          <div className="loading-content">
            <div className="loading-logo">
              <span className="logo-icon" style={{ fontSize: "3rem" }}>
                💥
              </span>
              <span className="logo-text">Error Crítico</span>
            </div>
            <p style={{ textAlign: "center", marginBottom: "2rem" }}>
              La aplicación ha encontrado un error crítico y necesita
              reiniciarse.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "2px solid white",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "0.75rem",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              🔄 Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Envolver la App con Error Boundary
function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
