package com.consultorio;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "clinical_notes")
public class ClinicalNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = true)  // ✅ Ahora es opcional para notas independientes
     private Long appointmentId;
    
    @Column(nullable = false)
    private Long pacienteId;
    
    @Column(nullable = false)
    private Long psicologoId;
    
    @Column(nullable = false)
    private LocalDateTime fechaCreacion;
    
    @Column(nullable = false)
    private String tipoNota; // EVALUACION_INICIAL, SEGUIMIENTO, CIERRE, EMERGENCIA
    
    @Lob
    @Column(nullable = false)
    private String contenido;
    
    @Lob
    private String observacionesGenerales;
    
    @Lob
    private String planTratamiento;
    
    @Lob
    private String tareasPaciente;
    
    private String estadoEmocional; // ESTABLE, ANSIOSO, DEPRIMIDO, EUFÓRICO, etc.
    private String nivelFuncionalidad; // ALTO, MEDIO, BAJO
    private Integer sesionNumero;
    private Boolean requiereSeguimiento = false;
    private LocalDateTime proximaRevision;
    
    // Datos para historial y búsquedas
    private String nombrePaciente;
    private String nombrePsicologo;
    private String modalidadSesion; // PRESENCIAL, VIDEOLLAMADA
    
    // Constructors
    public ClinicalNote() {
        this.fechaCreacion = LocalDateTime.now();
        this.requiereSeguimiento = false;
    }
    
    public ClinicalNote(Long appointmentId, Long pacienteId, Long psicologoId, 
                       String tipoNota, String contenido, String nombrePaciente, 
                       String nombrePsicologo, String modalidadSesion) {
        this();
        this.appointmentId = appointmentId;
        this.pacienteId = pacienteId;
        this.psicologoId = psicologoId;
        this.tipoNota = tipoNota;
        this.contenido = contenido;
        this.nombrePaciente = nombrePaciente;
        this.nombrePsicologo = nombrePsicologo;
        this.modalidadSesion = modalidadSesion;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    
    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }
    
    public Long getPsicologoId() { return psicologoId; }
    public void setPsicologoId(Long psicologoId) { this.psicologoId = psicologoId; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public String getTipoNota() { return tipoNota; }
    public void setTipoNota(String tipoNota) { this.tipoNota = tipoNota; }
    
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    
    public String getObservacionesGenerales() { return observacionesGenerales; }
    public void setObservacionesGenerales(String observacionesGenerales) { 
        this.observacionesGenerales = observacionesGenerales; 
    }
    
    public String getPlanTratamiento() { return planTratamiento; }
    public void setPlanTratamiento(String planTratamiento) { this.planTratamiento = planTratamiento; }
    
    public String getTareasPaciente() { return tareasPaciente; }
    public void setTareasPaciente(String tareasPaciente) { this.tareasPaciente = tareasPaciente; }
    
    public String getEstadoEmocional() { return estadoEmocional; }
    public void setEstadoEmocional(String estadoEmocional) { this.estadoEmocional = estadoEmocional; }
    
    public String getNivelFuncionalidad() { return nivelFuncionalidad; }
    public void setNivelFuncionalidad(String nivelFuncionalidad) { 
        this.nivelFuncionalidad = nivelFuncionalidad; 
    }
    
    public Integer getSesionNumero() { return sesionNumero; }
    public void setSesionNumero(Integer sesionNumero) { this.sesionNumero = sesionNumero; }
    
    public Boolean getRequiereSeguimiento() { return requiereSeguimiento; }
    public void setRequiereSeguimiento(Boolean requiereSeguimiento) { 
        this.requiereSeguimiento = requiereSeguimiento; 
    }
    
    public LocalDateTime getProximaRevision() { return proximaRevision; }
    public void setProximaRevision(LocalDateTime proximaRevision) { 
        this.proximaRevision = proximaRevision; 
    }
    
    public String getNombrePaciente() { return nombrePaciente; }
    public void setNombrePaciente(String nombrePaciente) { this.nombrePaciente = nombrePaciente; }
    
    public String getNombrePsicologo() { return nombrePsicologo; }
    public void setNombrePsicologo(String nombrePsicologo) { this.nombrePsicologo = nombrePsicologo; }
    
    public String getModalidadSesion() { return modalidadSesion; }
    public void setModalidadSesion(String modalidadSesion) { this.modalidadSesion = modalidadSesion; }
}

