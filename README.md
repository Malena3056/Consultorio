# Sistema Web de Psicología - Consultorio

Sistema completo de gestión para consultorios psicológicos con backend en Spring Boot y frontend en React.

## 🏗️ Arquitectura

- **Backend**: Spring Boot 3.2.0 + Java 17 + PostgreSQL
- **Frontend**: React 18.2.0 + Axios + React Router
- **Base de Datos**: PostgreSQL (H2 para desarrollo)

## 🚀 Deployment en Railway

### Requisitos Previos
- Cuenta en [Railway.app](https://railway.app)
- Repositorio en GitHub

### Pasos para Deployment

1. **Conectar Repositorio**
   - Ir a Railway.app
   - Crear nuevo proyecto
   - Conectar con GitHub
   - Seleccionar este repositorio

2. **Configurar Base de Datos**
   - Agregar servicio PostgreSQL
   - Railway configurará automáticamente las variables de entorno

3. **Variables de Entorno (se configuran automáticamente)**
   - `DATABASE_URL`: URL de conexión PostgreSQL
   - `DB_USERNAME`: Usuario de la base de datos
   - `DB_PASSWORD`: Contraseña de la base de datos
   - `PORT`: Puerto del servidor (Railway lo asigna)

4. **Deploy del Backend**
   - Railway detectará automáticamente el proyecto Java
   - Usará el archivo `railway.toml` para la configuración
   - El backend se ejecutará con el perfil `prod`

5. **Deploy del Frontend**
   - Crear un segundo servicio en Railway para el frontend
   - O usar Netlify/Vercel para el frontend estático
   - Actualizar `REACT_APP_API_URL` con la URL del backend

## 🔧 Configuración Local

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📁 Estructura del Proyecto

```
consultorio-psicologico/
├── backend/                 # Spring Boot API
│   ├── src/main/java/      # Código fuente Java
│   ├── src/main/resources/ # Configuraciones
│   └── pom.xml             # Dependencias Maven
├── frontend/               # React App
│   ├── src/                # Código fuente React
│   ├── public/             # Archivos estáticos
│   └── package.json        # Dependencias npm
├── railway.toml            # Configuración Railway
└── README.md               # Este archivo
```

## 🌐 URLs de Producción

- **Backend**: https://your-backend-url.railway.app
- **Frontend**: https://your-frontend-url.railway.app (o Netlify/Vercel)

## 📝 Notas Importantes

- El backend usa PostgreSQL en producción y H2 en desarrollo
- Los archivos se almacenan en `/tmp/uploads/` en Railway
- CORS está configurado para permitir el frontend
- El perfil `prod` se activa automáticamente en Railway

## 🔒 Seguridad

- Variables de entorno para credenciales sensibles
- CORS configurado correctamente
- Validaciones en backend y frontend
