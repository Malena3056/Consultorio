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
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long pacienteId;
    
    @Column(nullable = false)
    private Long psicologoId;
    
    @Column(nullable = false)
    private LocalDateTime fechaHora;
    
    @Column(nullable = false)
    private String estado; // RESERVADA, COMPLETADA, CANCELADA
    
    @Column(nullable = false)
    private String modalidad; // PRESENCIAL, VIDEOLLAMADA
    
    @Lob
    private String notas;
    
    private Double precio;
    
    @Column(nullable = false)
    private Boolean pagado = false;
    
    private String nombrePaciente;
    private String nombrePsicologo;
    
    // Constructors
    public Appointment() {}
    
    public Appointment(Long pacienteId, Long psicologoId, LocalDateTime fechaHora, 
                      String estado, String modalidad, Double precio, String nombrePaciente, String nombrePsicologo) {
        this.pacienteId = pacienteId;
        this.psicologoId = psicologoId;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.modalidad = modalidad;
        this.precio = precio;
        this.pagado = false;
        this.nombrePaciente = nombrePaciente;
        this.nombrePsicologo = nombrePsicologo;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }
    
    public Long getPsicologoId() { return psicologoId; }
    public void setPsicologoId(Long psicologoId) { this.psicologoId = psicologoId; }
    
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getModalidad() { return modalidad; }
    public void setModalidad(String modalidad) { this.modalidad = modalidad; }
    
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    
    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
    
    public Boolean getPagado() { return pagado; }
    public void setPagado(Boolean pagado) { this.pagado = pagado; }
    
    public String getNombrePaciente() { return nombrePaciente; }
    public void setNombrePaciente(String nombrePaciente) { this.nombrePaciente = nombrePaciente; }
    
    public String getNombrePsicologo() { return nombrePsicologo; }
    public void setNombrePsicologo(String nombrePsicologo) { this.nombrePsicologo = nombrePsicologo; }
}











