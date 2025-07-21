package com.consultorio;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Buscar pagos por paciente
    List<Payment> findByPacienteId(Long pacienteId);
    
    // Buscar pagos por psicólogo
    List<Payment> findByPsicologoId(Long psicologoId);
    
    // Buscar pagos por estado
    List<Payment> findByEstado(String estado);
    
    // Buscar pagos por método de pago
    List<Payment> findByMetodoPago(String metodoPago);
    
    // Buscar pagos por cita
    List<Payment> findByAppointmentId(Long appointmentId);
    
    // Buscar pagos por rango de fechas
    List<Payment> findByFechaPagoBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar pagos completados por paciente
    List<Payment> findByPacienteIdAndEstado(Long pacienteId, String estado);
    
    // Buscar pagos completados por psicólogo
    List<Payment> findByPsicologoIdAndEstado(Long psicologoId, String estado);
    
    // Obtener suma de ingresos por psicólogo
    @Query("SELECT SUM(p.monto) FROM Payment p WHERE p.psicologoId = :psicologoId AND p.estado = 'COMPLETADO'")
    Double sumMontoByPsicologoIdAndEstadoCompletado(@Param("psicologoId") Long psicologoId);
    
    // Obtener suma total de ingresos
    @Query("SELECT SUM(p.monto) FROM Payment p WHERE p.estado = 'COMPLETADO'")
    Double sumTotalIngresos();
    
    // Obtener pagos pendientes
    @Query("SELECT p FROM Payment p WHERE p.estado = 'PENDIENTE' ORDER BY p.fechaPago ASC")
    List<Payment> findPagosPendientes();
}














