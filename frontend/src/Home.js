import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo">
            <span className="logo-icon">🧠</span>
            <span className="logo-text">Centro Psicológico Bienestar</span>
          </div>
          <div className="nav-buttons">
            <Link to="/register" className="register-link">
              Registrarse
            </Link>
            <Link to="/login" className="login-link">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Tu Bienestar Mental es Nuestra Prioridad
          </h1>
          <p className="hero-subtitle">
            Ofrecemos servicios profesionales de psicología con un enfoque
            integral para ayudarte a alcanzar tu máximo potencial emocional y
            mental.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Registrarse Ahora
            </Link>
            <Link to="/login" className="btn btn-outline">
              Ya tengo cuenta
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt="Consultorio Psicológico"
          />
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="services">
        <div className="container">
          <div className="section-header">
            <h2>Nuestros Servicios</h2>
            <p>
              Brindamos atención psicológica especializada en diferentes áreas
            </p>
          </div>

          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">👤</div>
              <h3>Terapia Individual</h3>
              <p>
                Sesiones personalizadas para abordar ansiedad, depresión, estrés
                y otros desafíos emocionales.
              </p>
              <ul>
                <li>Trastornos de ansiedad</li>
                <li>Depresión</li>
                <li>Manejo del estrés</li>
                <li>Autoestima</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Terapia Familiar</h3>
              <p>
                Mejoramos la comunicación y fortalecemos los vínculos familiares
                a través de terapia especializada.
              </p>
              <ul>
                <li>Conflictos familiares</li>
                <li>Terapia de pareja</li>
                <li>Comunicación familiar</li>
                <li>Separación y divorcio</li>
              </ul>
            </div>

            <div className="service-card">
              <div className="service-icon">💻</div>
              <h3>Consulta Online</h3>
              <p>
                Accede a nuestros servicios desde la comodidad de tu hogar con
                videollamadas seguras.
              </p>
              <ul>
                <li>Videollamadas seguras</li>
                <li>Horarios flexibles</li>
                <li>Mismo nivel de atención</li>
                <li>Comodidad desde casa</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>¿Por qué Elegirnos?</h2>
            <p>Comprometidos con tu bienestar y recuperación</p>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <h3>Enfoque Personalizado</h3>
              <p>
                Cada tratamiento es diseñado específicamente para tus
                necesidades únicas y objetivos personales.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🏆</div>
              <h3>Profesionales Certificados</h3>
              <p>
                Nuestro equipo cuenta con las más altas certificaciones y
                experiencia comprobada.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">💻</div>
              <h3>Modalidad Flexible</h3>
              <p>
                Elige entre sesiones presenciales o virtuales según tu
                conveniencia y necesidades.
              </p>
            </div>

            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Confidencialidad Total</h3>
              <p>
                Garantizamos la privacidad y confidencialidad en todos nuestros
                servicios y tratamientos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="container">
          <div className="contact-content">
            <div className="contact-info">
              <h2>Contáctanos</h2>
              <p>Estamos aquí para ayudarte en tu camino hacia el bienestar</p>

              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h4>Dirección</h4>
                    <p>Av. Principal 123, San Isidro, Lima</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h4>Teléfono</h4>
                    <p>+51 999 888 777</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <div>
                    <h4>Email</h4>
                    <p>contacto@centrobienestar.com</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">🕒</span>
                  <div>
                    <h4>Horarios</h4>
                    <p>
                      Lun - Vie: 8:00 AM - 8:00 PM
                      <br />
                      Sáb: 9:00 AM - 2:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-cta">
              <h3>¿Listo para comenzar?</h3>
              <p>
                Agenda tu primera consulta y da el primer paso hacia una mejor
                salud mental.
              </p>
              <Link to="/register" className="btn btn-primary btn-large">
                Registrarse Gratis
              </Link>
              <p className="cta-note">
                Primera consulta con descuento especial
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
    </div>
  );
}

export default Home;
