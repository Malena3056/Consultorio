package com.consultorio;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String role; // ADMIN, PSICOLOGO, PACIENTE
    
    @Column(nullable = false)
    private String nombre;
    
    private String telefono;
    private String especialidad; // Para psicólogos
    
    // Nuevos campos agregados
    private String dni;
    private LocalDate fechaNacimiento;
    private String direccion;
    private String telefonoEmergencia;
    private String genero;
    private String estadoCivil;
    
    // Para psicólogos
    private String colegiatura; // CMP
    private String universidad;
    private Integer aniosExperiencia;
    private String descripcion;
    private Double tarifaConsulta;
    
    // Gestión de perfil
    private String fotoPerfil; // URL o path de la imagen
    private Boolean activo = true;
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    private LocalDateTime ultimaConexion;
    
    // Para configuraciones
    private String configuracionNotificaciones; // JSON string
    private String horarioAtencion; // JSON string
    
    // Constructors
    public User() {}
    
    public User(String username, String password, String email, String role, 
                String nombre, String telefono, String especialidad) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.nombre = nombre;
        this.telefono = telefono;
        this.especialidad = especialidad;
        this.activo = true;
        this.fechaCreacion = LocalDateTime.now();
    }
    
    // Getters and Setters - TODOS los métodos necesarios
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    
    // Nuevos getters y setters
    public String getDni() { return dni; }
    public void setDni(String dni) { this.dni = dni; }
    
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getTelefonoEmergencia() { return telefonoEmergencia; }
    public void setTelefonoEmergencia(String telefonoEmergencia) { this.telefonoEmergencia = telefonoEmergencia; }
    
    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }
    
    public String getEstadoCivil() { return estadoCivil; }
    public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }
    
    public String getColegiatura() { return colegiatura; }
    public void setColegiatura(String colegiatura) { this.colegiatura = colegiatura; }
    
    public String getUniversidad() { return universidad; }
    public void setUniversidad(String universidad) { this.universidad = universidad; }
    
    public Integer getAniosExperiencia() { return aniosExperiencia; }
    public void setAniosExperiencia(Integer aniosExperiencia) { this.aniosExperiencia = aniosExperiencia; }
    
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    
    public Double getTarifaConsulta() { return tarifaConsulta; }
    public void setTarifaConsulta(Double tarifaConsulta) { this.tarifaConsulta = tarifaConsulta; }
    
    public String getFotoPerfil() { return fotoPerfil; }
    public void setFotoPerfil(String fotoPerfil) { this.fotoPerfil = fotoPerfil; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getUltimaConexion() { return ultimaConexion; }
    public void setUltimaConexion(LocalDateTime ultimaConexion) { this.ultimaConexion = ultimaConexion; }
    
    public String getConfiguracionNotificaciones() { return configuracionNotificaciones; }
    public void setConfiguracionNotificaciones(String configuracionNotificaciones) { 
        this.configuracionNotificaciones = configuracionNotificaciones; 
    }
    
    public String getHorarioAtencion() { return horarioAtencion; }
    public void setHorarioAtencion(String horarioAtencion) { this.horarioAtencion = horarioAtencion; }
}


