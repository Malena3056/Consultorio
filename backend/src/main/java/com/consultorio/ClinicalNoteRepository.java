package com.consultorio;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, Long> {
    
    // Buscar notas por paciente (historial completo)
    List<ClinicalNote> findByPacienteIdOrderByFechaCreacionDesc(Long pacienteId);
    
    // Buscar notas por psicólogo
    List<ClinicalNote> findByPsicologoIdOrderByFechaCreacionDesc(Long psicologoId);
    
    // Buscar notas por cita específica
    List<ClinicalNote> findByAppointmentId(Long appointmentId);
    
    // Buscar notas por tipo
    List<ClinicalNote> findByTipoNota(String tipoNota);
    
    // Buscar notas que requieren seguimiento
    List<ClinicalNote> findByRequiereSeguimientoTrueOrderByProximaRevisionAsc();
    
    // Buscar notas por rango de fechas
    List<ClinicalNote> findByFechaCreacionBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    // Buscar notas por paciente y psicólogo (historial de tratamiento)
    List<ClinicalNote> findByPacienteIdAndPsicologoIdOrderByFechaCreacionDesc(Long pacienteId, Long psicologoId);
    
    // Obtener última nota de un paciente
    @Query("SELECT cn FROM ClinicalNote cn WHERE cn.pacienteId = :pacienteId ORDER BY cn.fechaCreacion DESC")
    List<ClinicalNote> findLatestNoteByPacienteId(@Param("pacienteId") Long pacienteId);
    
    // Contar notas por paciente
    Long countByPacienteId(Long pacienteId);
    
    // Obtener notas con seguimiento pendiente para un psicólogo
    @Query("SELECT cn FROM ClinicalNote cn WHERE cn.psicologoId = :psicologoId AND cn.requiereSeguimiento = true AND cn.proximaRevision <= :fecha ORDER BY cn.proximaRevision ASC")
    List<ClinicalNote> findSeguimientosPendientesByPsicologo(@Param("psicologoId") Long psicologoId, @Param("fecha") LocalDateTime fecha);
    
    // Buscar notas por estado emocional
    List<ClinicalNote> findByEstadoEmocional(String estadoEmocional);
}
















