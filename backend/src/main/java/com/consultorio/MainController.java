package com.consultorio;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class MainController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    // NUEVOS REPOSITORIOS PARA PAGOS Y NOTAS CLÍNICAS
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private ClinicalNoteRepository clinicalNoteRepository;
    
    private final String UPLOAD_DIR = "uploads/profile-images/";

    
    // ============= AUTENTICACIÓN =============
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        
        Optional<User> user = userRepository.findByUsernameAndPassword(username, password);
        if (user.isPresent()) {
            User userFound = user.get();
            // Actualizar última conexión
            userFound.setUltimaConexion(LocalDateTime.now());
            userRepository.save(userFound);
            return ResponseEntity.ok(userFound);
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Credenciales inválidas"));
    }
    
    // ============= GESTIÓN DE USUARIOS =============
    
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/users/{id}")
public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
    try {
        Optional<User> existingUser = userRepository.findById(id);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Actualizar campos básicos
            if (updates.containsKey("nombre")) {
                user.setNombre(updates.get("nombre").toString());
            }
            if (updates.containsKey("email")) {
                user.setEmail(updates.get("email").toString());
            }
            if (updates.containsKey("telefono")) {
                user.setTelefono(updates.get("telefono").toString());
            }
            if (updates.containsKey("direccion")) {
                user.setDireccion(updates.get("direccion").toString());
            }
            
            // Campos personales
            if (updates.containsKey("dni")) {
                user.setDni(updates.get("dni").toString());
            }
            if (updates.containsKey("fechaNacimiento")) {
                String fechaStr = updates.get("fechaNacimiento").toString();
                if (fechaStr != null && !fechaStr.isEmpty()) {
                    try {
                        user.setFechaNacimiento(LocalDate.parse(fechaStr));
                    } catch (Exception e) {
                        System.err.println("Error parsing date: " + fechaStr);
                    }
                }
            }
            if (updates.containsKey("genero")) {
                user.setGenero(updates.get("genero").toString());
            }
            if (updates.containsKey("estadoCivil")) {
                user.setEstadoCivil(updates.get("estadoCivil").toString());
            }
            if (updates.containsKey("telefonoEmergencia")) {
                user.setTelefonoEmergencia(updates.get("telefonoEmergencia").toString());
            }
            
            // Campos específicos para psicólogos
            if (updates.containsKey("especialidad")) {
                user.setEspecialidad(updates.get("especialidad").toString());
            }
            if (updates.containsKey("colegiatura")) {
                user.setColegiatura(updates.get("colegiatura").toString());
            }
            if (updates.containsKey("universidad")) {
                user.setUniversidad(updates.get("universidad").toString());
            }
            if (updates.containsKey("aniosExperiencia")) {
                Object aniosExp = updates.get("aniosExperiencia");
                if (aniosExp != null && !aniosExp.toString().isEmpty()) {
                    try {
                        user.setAniosExperiencia(Integer.valueOf(aniosExp.toString()));
                    } catch (NumberFormatException e) {
                        System.err.println("Error parsing años experiencia: " + aniosExp);
                    }
                }
            }
            if (updates.containsKey("descripcion")) {
                user.setDescripcion(updates.get("descripcion").toString());
            }
            if (updates.containsKey("tarifaConsulta")) {
                Object tarifa = updates.get("tarifaConsulta");
                if (tarifa != null && !tarifa.toString().isEmpty()) {
                    try {
                        user.setTarifaConsulta(Double.valueOf(tarifa.toString()));
                    } catch (NumberFormatException e) {
                        System.err.println("Error parsing tarifa consulta: " + tarifa);
                    }
                }
            }
            if (updates.containsKey("horarioAtencion")) {
                user.setHorarioAtencion(updates.get("horarioAtencion").toString());
            }
            
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        }
        return ResponseEntity.notFound().build();
    } catch (Exception e) {
        System.err.println("Error updating user: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).build();
    }
}
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // ============= GESTIÓN DE FOTOS DE PERFIL =============
    
    @PostMapping("/users/{id}/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile file) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Validar archivo
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "No se seleccionó archivo"));
            }
            
            // Validar tipo de archivo
            String contentType = file.getContentType();
            if (!contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten imágenes"));
            }
            
            // Crear directorio si no existe
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generar nombre único para el archivo
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "profile_" + id + "_" + UUID.randomUUID().toString() + extension;
            
            // Guardar archivo
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Actualizar usuario con la ruta de la foto
            String photoUrl = "/api/users/" + id + "/photo/" + newFilename;
            user.setFotoPerfil(photoUrl);
            userRepository.save(user);
            
            return ResponseEntity.ok(Map.of("photoUrl", photoUrl, "message", "Foto subida exitosamente"));
            
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al subir archivo: " + e.getMessage()));
        }
    }
    
    @GetMapping("/users/{id}/photo/{filename}")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable Long id, @PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            if (Files.exists(filePath)) {
                byte[] imageBytes = Files.readAllBytes(filePath);
                return ResponseEntity.ok()
                    .header("Content-Type", "image/jpeg")
                    .body(imageBytes);
            }
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // ============= OBTENER USUARIOS POR ROL =============
    
    @GetMapping("/psicologos")
    public List<User> getPsicologos() {
        return userRepository.findByRole("PSICOLOGO");
    }
    
    @GetMapping("/pacientes")
    public List<User> getPacientes() {
        return userRepository.findByRole("PACIENTE");
    }
    
    // ============= GESTIÓN DE CITAS =============
    
    @PostMapping("/appointments")
    public ResponseEntity<Appointment> createAppointment(@RequestBody Map<String, Object> appointmentData) {
        try {
            Appointment appointment = new Appointment();
            appointment.setPacienteId(Long.valueOf(appointmentData.get("pacienteId").toString()));
            appointment.setPsicologoId(Long.valueOf(appointmentData.get("psicologoId").toString()));
            appointment.setFechaHora(LocalDateTime.parse(appointmentData.get("fechaHora").toString()));
            appointment.setModalidad(appointmentData.get("modalidad").toString());
            appointment.setPrecio(Double.valueOf(appointmentData.get("precio").toString()));
            appointment.setEstado("RESERVADA");
            appointment.setPagado(false);
            
            // Obtener nombres
            Optional<User> paciente = userRepository.findById(appointment.getPacienteId());
            Optional<User> psicologo = userRepository.findById(appointment.getPsicologoId());
            
            if (paciente.isPresent() && psicologo.isPresent()) {
                appointment.setNombrePaciente(paciente.get().getNombre());
                appointment.setNombrePsicologo(psicologo.get().getNombre());
            }
            
            Appointment saved = appointmentRepository.save(appointment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/appointments")
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    @GetMapping("/appointments/patient/{id}")
    public List<Appointment> getPatientAppointments(@PathVariable Long id) {
        return appointmentRepository.findByPacienteId(id);
    }
    
    @GetMapping("/appointments/psychologist/{id}")
    public List<Appointment> getPsychologistAppointments(@PathVariable Long id) {
        return appointmentRepository.findByPsicologoId(id);
    }
    
    @GetMapping("/appointments/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        return appointment.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/appointments/{id}")
    public ResponseEntity<Appointment> updateAppointment(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Appointment> existingAppointment = appointmentRepository.findById(id);
        if (existingAppointment.isPresent()) {
            Appointment appointment = existingAppointment.get();
            
            if (updates.containsKey("estado")) {
                appointment.setEstado(updates.get("estado").toString());
            }
            if (updates.containsKey("notas")) {
                appointment.setNotas(updates.get("notas").toString());
            }
            if (updates.containsKey("pagado")) {
                appointment.setPagado(Boolean.valueOf(updates.get("pagado").toString()));
            }
            if (updates.containsKey("fechaHora")) {
                appointment.setFechaHora(LocalDateTime.parse(updates.get("fechaHora").toString()));
            }
            if (updates.containsKey("modalidad")) {
                appointment.setModalidad(updates.get("modalidad").toString());
            }
            if (updates.containsKey("precio")) {
                appointment.setPrecio(Double.valueOf(updates.get("precio").toString()));
            }
            
            return ResponseEntity.ok(appointmentRepository.save(appointment));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/appointments/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        if (appointmentRepository.existsById(id)) {
            appointmentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    @PutMapping("/appointments/{id}/pay")
    public ResponseEntity<Appointment> payAppointment(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentRepository.findById(id);
        if (appointment.isPresent()) {
            Appointment updated = appointment.get();
            updated.setPagado(true);
            return ResponseEntity.ok(appointmentRepository.save(updated));
        }
        return ResponseEntity.notFound().build();
    }
    
    // ============= GESTIÓN DE PAGOS =============
   @PostMapping("/payments")
public ResponseEntity<Payment> createPayment(@RequestBody Map<String, Object> paymentData) {
    try {
        Payment payment = new Payment();
        payment.setAppointmentId(((Number) paymentData.get("appointmentId")).longValue());
        payment.setPacienteId(((Number) paymentData.get("pacienteId")).longValue());
        payment.setPsicologoId(((Number) paymentData.get("psicologoId")).longValue());
        payment.setMonto(((Number) paymentData.get("monto")).doubleValue());
        payment.setMetodoPago((String) paymentData.get("metodoPago"));
        payment.setEstado("COMPLETADO");
        payment.setNombrePaciente((String) paymentData.get("nombrePaciente"));
        payment.setNombrePsicologo((String) paymentData.get("nombrePsicologo"));
        payment.setNumeroTransaccion("TXN-" + System.currentTimeMillis());
        payment.setConceptoPago("Consulta psicológica");
        payment.setFechaPago(LocalDateTime.now()); // 👈💥 AQUI EL FIX

        Payment savedPayment = paymentRepository.save(payment);

        Optional<Appointment> appointment = appointmentRepository.findById(payment.getAppointmentId());
        appointment.ifPresent(apt -> {
            apt.setPagado(true);
            appointmentRepository.save(apt);
        });

        return ResponseEntity.ok(savedPayment);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().build();
    }
}
    
    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
    
    @GetMapping("/payments/patient/{id}")
    public List<Payment> getPaymentsByPatient(@PathVariable Long id) {
        return paymentRepository.findByPacienteId(id);
    }
    
    @GetMapping("/payments/psychologist/{id}")
    public List<Payment> getPaymentsByPsychologist(@PathVariable Long id) {
        return paymentRepository.findByPsicologoId(id);
    }
    
    @GetMapping("/payments/pending")
    public List<Payment> getPendingPayments() {
        return paymentRepository.findPagosPendientes();
    }
    
    @PutMapping("/payments/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<Payment> existingPayment = paymentRepository.findById(id);
        if (existingPayment.isPresent()) {
            Payment payment = existingPayment.get();
            
            if (updates.containsKey("estado")) {
                payment.setEstado(updates.get("estado").toString());
            }
            if (updates.containsKey("numeroTransaccion")) {
                payment.setNumeroTransaccion(updates.get("numeroTransaccion").toString());
            }
            if (updates.containsKey("observaciones")) {
                payment.setObservaciones(updates.get("observaciones").toString());
            }
            
            return ResponseEntity.ok(paymentRepository.save(payment));
        }
        return ResponseEntity.notFound().build();
    }
    



@PostMapping("/clinical-notes")
public ResponseEntity<ClinicalNote> createClinicalNote(@RequestBody Map<String, Object> noteData) {
    try {
        ClinicalNote note = new ClinicalNote();
        
        // appointmentId puede ser null para notas independientes
        if (noteData.containsKey("appointmentId") && noteData.get("appointmentId") != null) {
            note.setAppointmentId(Long.valueOf(noteData.get("appointmentId").toString()));
        }
        
        note.setPacienteId(Long.valueOf(noteData.get("pacienteId").toString()));
        note.setPsicologoId(Long.valueOf(noteData.get("psicologoId").toString()));
        note.setTipoNota(noteData.get("tipoNota").toString());
        note.setContenido(noteData.get("contenido").toString());
        note.setNombrePaciente(noteData.get("nombrePaciente").toString());
        note.setNombrePsicologo(noteData.get("nombrePsicologo").toString());
        note.setModalidadSesion(noteData.get("modalidadSesion").toString());
        
        if (noteData.containsKey("observacionesGenerales")) {
            note.setObservacionesGenerales(noteData.get("observacionesGenerales").toString());
        }
        if (noteData.containsKey("planTratamiento")) {
            note.setPlanTratamiento(noteData.get("planTratamiento").toString());
        }
        if (noteData.containsKey("tareasPaciente")) {
            note.setTareasPaciente(noteData.get("tareasPaciente").toString());
        }
        if (noteData.containsKey("estadoEmocional")) {
            note.setEstadoEmocional(noteData.get("estadoEmocional").toString());
        }
        if (noteData.containsKey("nivelFuncionalidad")) {
            note.setNivelFuncionalidad(noteData.get("nivelFuncionalidad").toString());
        }
        if (noteData.containsKey("sesionNumero")) {
            note.setSesionNumero(Integer.valueOf(noteData.get("sesionNumero").toString()));
        }
        if (noteData.containsKey("requiereSeguimiento")) {
            note.setRequiereSeguimiento(Boolean.valueOf(noteData.get("requiereSeguimiento").toString()));
        }
        
        ClinicalNote savedNote = clinicalNoteRepository.save(note);
        
        // Solo actualizar la cita si existe appointmentId
        if (savedNote.getAppointmentId() != null) {
            Optional<Appointment> appointment = appointmentRepository.findById(savedNote.getAppointmentId());
            if (appointment.isPresent()) {
                Appointment apt = appointment.get();
                apt.setNotas("Ver nota clínica detallada ID: " + savedNote.getId());
                appointmentRepository.save(apt);
            }
        }
        
        return ResponseEntity.ok(savedNote);
    } catch (Exception e) {
        System.err.println("Error creating clinical note: " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.badRequest().build();
    }
}






















   
    @GetMapping("/clinical-notes")
    public List<ClinicalNote> getAllClinicalNotes() {
        return clinicalNoteRepository.findAll();
    }
    
    @GetMapping("/clinical-notes/patient/{id}")
    public List<ClinicalNote> getClinicalNotesByPatient(@PathVariable Long id) {
        return clinicalNoteRepository.findByPacienteIdOrderByFechaCreacionDesc(id);
    }
    
    @GetMapping("/clinical-notes/psychologist/{id}")
    public List<ClinicalNote> getClinicalNotesByPsychologist(@PathVariable Long id) {
        return clinicalNoteRepository.findByPsicologoIdOrderByFechaCreacionDesc(id);
    }
    
    @GetMapping("/clinical-notes/appointment/{id}")
    public List<ClinicalNote> getClinicalNotesByAppointment(@PathVariable Long id) {
        return clinicalNoteRepository.findByAppointmentId(id);
    }
    
    @GetMapping("/clinical-notes/{id}")
    public ResponseEntity<ClinicalNote> getClinicalNoteById(@PathVariable Long id) {
        Optional<ClinicalNote> note = clinicalNoteRepository.findById(id);
        return note.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/clinical-notes/{id}")
    public ResponseEntity<ClinicalNote> updateClinicalNote(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        Optional<ClinicalNote> existingNote = clinicalNoteRepository.findById(id);
        if (existingNote.isPresent()) {
            ClinicalNote note = existingNote.get();
            
            if (updates.containsKey("contenido")) {
                note.setContenido(updates.get("contenido").toString());
            }
            if (updates.containsKey("observacionesGenerales")) {
                note.setObservacionesGenerales(updates.get("observacionesGenerales").toString());
            }
            if (updates.containsKey("planTratamiento")) {
                note.setPlanTratamiento(updates.get("planTratamiento").toString());
            }
            if (updates.containsKey("tareasPaciente")) {
                note.setTareasPaciente(updates.get("tareasPaciente").toString());
            }
            if (updates.containsKey("estadoEmocional")) {
                note.setEstadoEmocional(updates.get("estadoEmocional").toString());
            }
            if (updates.containsKey("requiereSeguimiento")) {
                note.setRequiereSeguimiento(Boolean.valueOf(updates.get("requiereSeguimiento").toString()));
            }
            
            return ResponseEntity.ok(clinicalNoteRepository.save(note));
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/clinical-notes/{id}")
    public ResponseEntity<?> deleteClinicalNote(@PathVariable Long id) {
        if (clinicalNoteRepository.existsById(id)) {
            clinicalNoteRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
    
    // ============= REPORTES MEJORADOS =============
    
    @GetMapping("/reports")
    public ResponseEntity<Map<String, Object>> getReports() {
        long totalUsers = userRepository.count();
        long totalPsicologos = userRepository.findByRole("PSICOLOGO").size();
        long totalPacientes = userRepository.findByRole("PACIENTE").size();
        long totalAppointments = appointmentRepository.count();
        
        List<Appointment> allAppointments = appointmentRepository.findAll();
        List<Appointment> paidAppointments = appointmentRepository.findByPagado(true);
        List<Appointment> pendingAppointments = allAppointments.stream()
            .filter(a -> "RESERVADA".equals(a.getEstado()))
            .collect(Collectors.toList());
        List<Appointment> completedAppointments = allAppointments.stream()
            .filter(a -> "COMPLETADA".equals(a.getEstado()))
            .collect(Collectors.toList());
        List<Appointment> cancelledAppointments = allAppointments.stream()
            .filter(a -> "CANCELADA".equals(a.getEstado()))
            .collect(Collectors.toList());
        
        double totalIngresos = paidAppointments.stream()
            .mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0)
            .sum();
        
        double ingresosPendientes = pendingAppointments.stream()
            .filter(a -> !a.getPagado())
            .mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0)
            .sum();
        
        // Estadísticas por psicólogo
        Map<String, Object> estadisticasPsicologos = new HashMap<>();
        userRepository.findByRole("PSICOLOGO").forEach(psicologo -> {
            List<Appointment> citasPsicologo = appointmentRepository.findByPsicologoId(psicologo.getId());
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCitas", citasPsicologo.size());
            stats.put("citasCompletadas", citasPsicologo.stream().filter(a -> "COMPLETADA".equals(a.getEstado())).count());
            stats.put("ingresos", citasPsicologo.stream().filter(a -> a.getPagado()).mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0).sum());
            estadisticasPsicologos.put(psicologo.getNombre(), stats);
        });
        
        Map<String, Object> reports = new HashMap<>();
        reports.put("totalUsuarios", totalUsers);
        reports.put("totalPsicologos", totalPsicologos);
        reports.put("totalPacientes", totalPacientes);
        reports.put("totalCitas", totalAppointments);
        reports.put("citasPendientes", pendingAppointments.size());
        reports.put("citasCompletadas", completedAppointments.size());
        reports.put("citasCanceladas", cancelledAppointments.size());
        reports.put("citasPagadas", paidAppointments.size());
        reports.put("ingresoTotal", totalIngresos);
        reports.put("ingresosPendientes", ingresosPendientes);
        reports.put("estadisticasPsicologos", estadisticasPsicologos);
        
        return ResponseEntity.ok(reports);
    }
    
    // ============= REPORTES DETALLADOS CON PAGOS Y NOTAS =============
    
    @GetMapping("/reports/detailed")
    public ResponseEntity<Map<String, Object>> getDetailedReports() {
        Map<String, Object> reports = new HashMap<>();
        
        // Estadísticas básicas
        long totalUsers = userRepository.count();
        long totalAppointments = appointmentRepository.count();
        long totalPayments = paymentRepository.count();
        long totalClinicalNotes = clinicalNoteRepository.count();
        
        // Estadísticas financieras detalladas
        Double totalIngresos = paymentRepository.sumTotalIngresos();
        List<Payment> pagosPendientes = paymentRepository.findPagosPendientes();
        
        // Estadísticas clínicas
        List<ClinicalNote> notasRecientes = clinicalNoteRepository.findAll().stream()
            .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
            .limit(10)
            .collect(Collectors.toList());
        
        reports.put("totalUsers", totalUsers);
        reports.put("totalAppointments", totalAppointments);
        reports.put("totalPayments", totalPayments);
        reports.put("totalClinicalNotes", totalClinicalNotes);
        reports.put("totalIngresos", totalIngresos != null ? totalIngresos : 0.0);
        reports.put("pagosPendientes", pagosPendientes.size());
        reports.put("notasRecientes", notasRecientes);
        
        // Estadísticas por psicólogo con pagos
        Map<String, Object> estadisticasPsicologos = new HashMap<>();
        userRepository.findByRole("PSICOLOGO").forEach(psicologo -> {
            List<Appointment> citasPsicologo = appointmentRepository.findByPsicologoId(psicologo.getId());
            List<Payment> pagosPsicologo = paymentRepository.findByPsicologoIdAndEstado(psicologo.getId(), "COMPLETADO");
            List<ClinicalNote> notasPsicologo = clinicalNoteRepository.findByPsicologoIdOrderByFechaCreacionDesc(psicologo.getId());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCitas", citasPsicologo.size());
            stats.put("citasCompletadas", citasPsicologo.stream().filter(a -> "COMPLETADA".equals(a.getEstado())).count());
            stats.put("totalPagos", pagosPsicologo.size());
            stats.put("ingresos", pagosPsicologo.stream().mapToDouble(Payment::getMonto).sum());
            stats.put("totalNotasClinicas", notasPsicologo.size());
            
            estadisticasPsicologos.put(psicologo.getNombre(), stats);
        });
        
        reports.put("estadisticasPsicologos", estadisticasPsicologos);
        
        return ResponseEntity.ok(reports);
    }
    
    // ============= HISTORIAL COMPLETO DEL PACIENTE =============
    
    @GetMapping("/patients/{id}/complete-history")
    public ResponseEntity<Map<String, Object>> getCompletePatientHistory(@PathVariable Long id) {
        Map<String, Object> history = new HashMap<>();
        
        // Información del paciente
        Optional<User> patient = userRepository.findById(id);
        if (!patient.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        // Historial de citas
        List<Appointment> appointments = appointmentRepository.findByPacienteId(id);
        
        // Historial de pagos
        List<Payment> payments = paymentRepository.findByPacienteId(id);
        
        // Historial de notas clínicas
        List<ClinicalNote> clinicalNotes = clinicalNoteRepository.findByPacienteIdOrderByFechaCreacionDesc(id);
        
        // Estadísticas del paciente
        long totalSesiones = appointments.size();
        long sesionesCompletadas = appointments.stream().filter(a -> "COMPLETADA".equals(a.getEstado())).count();
        double totalGastado = payments.stream().filter(p -> "COMPLETADO".equals(p.getEstado())).mapToDouble(Payment::getMonto).sum();
        double pendientePagar = payments.stream().filter(p -> "PENDIENTE".equals(p.getEstado())).mapToDouble(Payment::getMonto).sum();
        
        history.put("paciente", patient.get());
        history.put("appointments", appointments);
        history.put("payments", payments);
        history.put("clinicalNotes", clinicalNotes);
        history.put("totalSesiones", totalSesiones);
        history.put("sesionesCompletadas", sesionesCompletadas);
        history.put("totalGastado", totalGastado);
        history.put("pendientePagar", pendientePagar);
        
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/reports/psychologist/{id}")
    public ResponseEntity<Map<String, Object>> getPsychologistReports(@PathVariable Long id) {
        List<Appointment> appointments = appointmentRepository.findByPsicologoId(id);
        
        long totalCitas = appointments.size();
        long citasCompletadas = appointments.stream().filter(a -> "COMPLETADA".equals(a.getEstado())).count();
        long citasPendientes = appointments.stream().filter(a -> "RESERVADA".equals(a.getEstado())).count();
        long citasCanceladas = appointments.stream().filter(a -> "CANCELADA".equals(a.getEstado())).count();
        
        double ingresoTotal = appointments.stream()
            .filter(a -> a.getPagado())
            .mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0)
            .sum();
        
        long pacientesUnicos = appointments.stream()
            .map(Appointment::getPacienteId)
            .distinct()
            .count();
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalCitas", totalCitas);
        report.put("citasCompletadas", citasCompletadas);
        report.put("citasPendientes", citasPendientes);
        report.put("citasCanceladas", citasCanceladas);
        report.put("ingresoTotal", ingresoTotal);
        report.put("pacientesUnicos", pacientesUnicos);
        report.put("appointments", appointments);
        
        return ResponseEntity.ok(report);
    }
    
    @GetMapping("/reports/patient/{id}")
    public ResponseEntity<Map<String, Object>> getPatientReports(@PathVariable Long id) {
        List<Appointment> appointments = appointmentRepository.findByPacienteId(id);
        
        long totalCitas = appointments.size();
        long citasCompletadas = appointments.stream().filter(a -> "COMPLETADA".equals(a.getEstado())).count();
        double totalGastado = appointments.stream()
            .filter(a -> a.getPagado())
            .mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0)
            .sum();
        
        double pendientePagar = appointments.stream()
            .filter(a -> !a.getPagado() && !"CANCELADA".equals(a.getEstado()))
            .mapToDouble(a -> a.getPrecio() != null ? a.getPrecio() : 0.0)
            .sum();
        
        Map<String, Object> report = new HashMap<>();
        report.put("totalCitas", totalCitas);
        report.put("citasCompletadas", citasCompletadas);
        report.put("totalGastado", totalGastado);
        report.put("pendientePagar", pendientePagar);
        report.put("appointments", appointments);
        
        return ResponseEntity.ok(report);
    }
    
    // ============= BÚSQUEDAS Y FILTROS =============
    
    @GetMapping("/appointments/search")
    public List<Appointment> searchAppointments(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String modalidad,
            @RequestParam(required = false) Long psicologoId,
            @RequestParam(required = false) Long pacienteId) {
        
        List<Appointment> appointments = appointmentRepository.findAll();
        
        if (estado != null && !estado.isEmpty()) {
            appointments = appointments.stream()
                .filter(a -> estado.equals(a.getEstado()))
                .collect(Collectors.toList());
        }
        
        if (modalidad != null && !modalidad.isEmpty()) {
            appointments = appointments.stream()
                .filter(a -> modalidad.equals(a.getModalidad()))
                .collect(Collectors.toList());
        }
        
        if (psicologoId != null) {
            appointments = appointments.stream()
                .filter(a -> psicologoId.equals(a.getPsicologoId()))
                .collect(Collectors.toList());
        }
        
        if (pacienteId != null) {
            appointments = appointments.stream()
                .filter(a -> pacienteId.equals(a.getPacienteId()))
                .collect(Collectors.toList());
        }
        
        return appointments;
    }
    
    // ============= ENDPOINT DE VERIFICACIÓN =============
    
    @GetMapping("/test-data")
    public ResponseEntity<Map<String, Object>> testData() {
        Map<String, Object> result = new HashMap<>();
        result.put("users", userRepository.count());
        result.put("appointments", appointmentRepository.count());
        result.put("payments", paymentRepository.count());
        result.put("clinicalNotes", clinicalNoteRepository.count());
        result.put("admin_exists", userRepository.findByUsername("admin").isPresent());
        return ResponseEntity.ok(result);
    }
}
