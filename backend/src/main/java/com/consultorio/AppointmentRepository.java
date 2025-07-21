package com.consultorio;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPacienteId(Long pacienteId);
    List<Appointment> findByPsicologoId(Long psicologoId);
    List<Appointment> findByEstado(String estado);
    List<Appointment> findByPagado(Boolean pagado);
}





