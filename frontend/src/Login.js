import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login({ setUser, onError, appConfig }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("El usuario es requerido");
      return false;
    }
    if (!formData.password.trim()) {
      setError("La contraseña es requerida");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 Intentando login con:", {
        username: formData.username,
        backend: "http://localhost:8080/api/login",
      });

      const response = await axios.post(
        "http://localhost:8080/api/login",
        {
          username: formData.username.trim(),
          password: formData.password.trim(),
        },
        {
          timeout: 10000, // 10 segundos timeout
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Login exitoso, respuesta:", response.data);

      const userData = response.data;

      // Validar datos recibidos del backend
      if (!userData || !userData.id || !userData.username || !userData.role) {
        throw new Error("Datos de usuario inválidos recibidos del servidor");
      }

      // Verificar que el rol sea válido
      const validRoles = ["ADMIN", "PSICOLOGO", "PACIENTE"];
      if (!validRoles.includes(userData.role)) {
        throw new Error("Rol de usuario no válido");
      }

      setUser(userData);

      // Guardar en localStorage si remember está marcado
      if (formData.remember) {
        try {
          localStorage.setItem("rememberedUser", JSON.stringify(userData));
          console.log("💾 Usuario guardado en localStorage");
        } catch (storageError) {
          console.warn("⚠️ No se pudo guardar en localStorage:", storageError);
          // No es crítico, continuar
        }
      }

      // Limpiar formulario
      setFormData({
        username: "",
        password: "",
        remember: false,
      });

      console.log(`🚀 Redirigiendo al dashboard para rol: ${userData.role}`);

      // Navegación con un pequeño delay para mejor UX
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    } catch (error) {
      console.error("❌ Error en login:", error);

      let errorMessage =
        "Error de conexión. Verifica que el servidor esté funcionando.";

      if (error.response) {
        // Error del servidor (4xx, 5xx)
        switch (error.response.status) {
          case 400:
          case 401:
            errorMessage =
              error.response.data?.error ||
              "Credenciales inválidas. Verifica tu usuario y contraseña.";
            break;
          case 403:
            errorMessage = "Acceso denegado. Usuario no autorizado.";
            break;
          case 404:
            errorMessage = "Servicio no disponible. Contacta al administrador.";
            break;
          case 500:
            errorMessage = "Error interno del servidor. Intenta más tarde.";
            break;
          default:
            errorMessage =
              error.response.data?.error ||
              `Error del servidor (${error.response.status})`;
        }
      } else if (error.request) {
        // Error de red
        errorMessage =
          "No se puede conectar con el servidor. Verifica tu conexión a internet.";
      } else if (error.code === "ECONNABORTED") {
        // Timeout
        errorMessage = "La conexión tardó demasiado. Intenta nuevamente.";
      }

      setError(errorMessage);

      // Notificar error a componente padre si existe
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (role) => {
    const credentials = {
      ADMIN: { username: "admin", password: "admin123" },
      PSICOLOGO: { username: "psicologo1", password: "psi123" },
      PACIENTE: { username: "paciente1", password: "pac123" },
    };

    if (credentials[role]) {
      setFormData((prev) => ({
        ...prev,
        ...credentials[role],
      }));
      setError(""); // Limpiar errores al llenar credenciales
      console.log(`🎭 Credenciales demo cargadas para: ${role}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Inicio de sesión</h1>
          <p
            style={{ color: "#718096", fontSize: "0.9rem", margin: "0.5rem 0" }}
          >
            Ingresa a tu cuenta del Centro Psicológico Bienestar
          </p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Usuario"
                className="form-input"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña"
                className="form-input"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-checkbox">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleInputChange}
                disabled={loading}
              />
              <span className="checkmark"></span>
              RECORDARME
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Funcionalidad de recuperación de contraseña próximamente..."
                );
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          <button
            type="submit"
            className={`login-btn ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              "🚀 Ingresar"
            )}
          </button>
        </form>


      </div>

      {/* Background decoration */}
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>
    </div>
  );
}

export default Login;
