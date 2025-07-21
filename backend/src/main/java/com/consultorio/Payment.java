package com.consultorio;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "payments")
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long appointmentId;
    
    @Column(nullable = false)
    private Long pacienteId;
    
    @Column(nullable = false)
    private Long psicologoId;
    
    @Column(nullable = false)
    private Double monto;
    
    @Column(nullable = false)
    private String metodoPago; // EFECTIVO, TARJETA, YAPE, PLIN, TRANSFERENCIA
    
    @Column(nullable = false)
    private String estado; // PENDIENTE, COMPLETADO, FALLIDO, REEMBOLSADO
    
    @Column(nullable = false)
    private LocalDateTime fechaPago;
    
    private String numeroTransaccion;
    private String numeroComprobante;
    private String conceptoPago;
    private String observaciones;
    
    // Datos del paciente y psicólogo para historial
    private String nombrePaciente;
    private String nombrePsicologo;
    
    // Constructors
    public Payment() {}
    
    public Payment(Long appointmentId, Long pacienteId, Long psicologoId, Double monto, 
                   String metodoPago, String estado, String nombrePaciente, String nombrePsicologo) {
        this.appointmentId = appointmentId;
        this.pacienteId = pacienteId;
        this.psicologoId = psicologoId;
        this.monto = monto;
        this.metodoPago = metodoPago;
        this.estado = estado;
        this.fechaPago = LocalDateTime.now();
        this.nombrePaciente = nombrePaciente;
        this.nombrePsicologo = nombrePsicologo;
        this.conceptoPago = "Consulta psicológica";
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
    
    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }
    
    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
    
    public String getNumeroTransaccion() { return numeroTransaccion; }
    public void setNumeroTransaccion(String numeroTransaccion) { this.numeroTransaccion = numeroTransaccion; }
    
    public String getNumeroComprobante() { return numeroComprobante; }
    public void setNumeroComprobante(String numeroComprobante) { this.numeroComprobante = numeroComprobante; }
    
    public String getConceptoPago() { return conceptoPago; }
    public void setConceptoPago(String conceptoPago) { this.conceptoPago = conceptoPago; }
    
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    
    public String getNombrePaciente() { return nombrePaciente; }
    public void setNombrePaciente(String nombrePaciente) { this.nombrePaciente = nombrePaciente; }
    
    public String getNombrePsicologo() { return nombrePsicologo; }
    public void setNombrePsicologo(String nombrePsicologo) { this.nombrePsicologo = nombrePsicologo; }
}