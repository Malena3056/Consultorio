import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css"; // Reutilizamos los estilos del login

function Register() {
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    dni: "",
    fechaNacimiento: "",
    genero: "",
    direccion: "",
    telefonoEmergencia: "",
    estadoCivil: "",
    acceptTerms: false,
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
    if (!formData.nombre.trim()) {
      setError("El nombre completo es requerido");
      return false;
    }
    if (!formData.username.trim()) {
      setError("El nombre de usuario es requerido");
      return false;
    }
    if (!formData.email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("El email no tiene un formato válido");
      return false;
    }
    if (!formData.password.trim()) {
      setError("La contraseña es requerida");
      return false;
    }
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    if (!formData.acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("🔐 Registrando nuevo paciente:", {
        username: formData.username,
        email: formData.email,
      });

      const userData = {
        username: formData.username.trim(),
        password: formData.password.trim(),
        email: formData.email.trim(),
        role: "PACIENTE",
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        dni: formData.dni.trim(),
        fechaNacimiento: formData.fechaNacimiento,
        genero: formData.genero,
        direccion: formData.direccion.trim(),
        telefonoEmergencia: formData.telefonoEmergencia.trim(),
        estadoCivil: formData.estadoCivil,
      };

      const response = await axios.post(
        "http://localhost:8080/api/users",
        userData,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Registro exitoso:", response.data);

      alert("🎉 ¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");

      // Limpiar formulario
      setFormData({
        nombre: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        dni: "",
        fechaNacimiento: "",
        genero: "",
        direccion: "",
        telefonoEmergencia: "",
        estadoCivil: "",
        acceptTerms: false,
      });

      // Redirigir al login después de 1 segundo
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("❌ Error en registro:", error);

      let errorMessage = "Error de conexión. Intenta nuevamente.";

      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              "Datos inválidos. Verifica la información ingresada.";
            break;
          case 409:
            errorMessage =
              "El usuario o email ya existe. Intenta con otros datos.";
            break;
          case 500:
            errorMessage = "Error interno del servidor. Intenta más tarde.";
            break;
          default:
            errorMessage =
              error.response.data?.message ||
              `Error del servidor (${error.response.status})`;
        }
      } else if (error.request) {
        errorMessage =
          "No se puede conectar con el servidor. Verifica tu conexión a internet.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: "700px" }}>
        <div className="login-header">
          <h1>Registro de Paciente</h1>
          <p
            style={{ color: "#718096", fontSize: "0.9rem", margin: "0.5rem 0" }}
          >
            Crea tu cuenta para agendar citas en Centro Psicológico Bienestar
          </p>
        </div>

        <form onSubmit={handleRegister} className="login-form">
          {/* Información Básica */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#2d3748",
                marginBottom: "1rem",
                fontSize: "1.1rem",
              }}
            >
              📋 Información Personal
            </h3>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Nombre completo"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🆔</span>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    placeholder="DNI"
                    className="form-input"
                    maxLength="8"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">📞</span>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    placeholder="Teléfono"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🎂</span>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">👥</span>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                  >
                    <option value="">Seleccionar género</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Cuenta */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#2d3748",
                marginBottom: "1rem",
                fontSize: "1.1rem",
              }}
            >
              🔐 Datos de Cuenta
            </h3>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Nombre de usuario"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div>
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
                    disabled={loading}
                    minLength="6"
                  />
                </div>
              </div>
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirmar contraseña"
                    className="form-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                color: "#2d3748",
                marginBottom: "1rem",
                fontSize: "1.1rem",
              }}
            >
              📍 Información Adicional (Opcional)
            </h3>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🏠</span>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Dirección"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">🚨</span>
                  <input
                    type="tel"
                    name="telefonoEmergencia"
                    value={formData.telefonoEmergencia}
                    onChange={handleInputChange}
                    placeholder="Teléfono de emergencia"
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div>
                <div className="input-wrapper">
                  <span className="input-icon">💑</span>
                  <select
                    name="estadoCivil"
                    value={formData.estadoCivil}
                    onChange={handleInputChange}
                    className="form-input"
                    disabled={loading}
                  >
                    <option value="">Estado civil</option>
                    <option value="Soltero/a">Soltero/a</option>
                    <option value="Casado/a">Casado/a</option>
                    <option value="Divorciado/a">Divorciado/a</option>
                    <option value="Viudo/a">Viudo/a</option>
                    <option value="Unión libre">Unión libre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="form-options" style={{ marginBottom: "1rem" }}>
            <label className="remember-checkbox">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
              <span className="checkmark"></span>
              Acepto los términos y condiciones del servicio
            </label>
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
                Registrando...
              </>
            ) : (
              "🎉 Crear Cuenta"
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <p style={{ color: "#718096", marginBottom: "1rem" }}>
              ¿Ya tienes una cuenta?
            </p>
            <Link
              to="/login"
              className="forgot-password"
              style={{ fontSize: "1rem", fontWeight: "600" }}
            >
              🔑 Iniciar Sesión
            </Link>
          </div>
        </form>
      </div>

      {/* Background decoration */}
      <div className="login-background">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
      </div>

      <style jsx>{`
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .login-card {
            max-width: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;
