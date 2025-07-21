-- BASE DE DATOS COMPLETA PARA CENTRO PSICOLÓGICO BIENESTAR
-- Incluye: Usuarios, Citas, Pagos y Notas Clínicas

-- ===============================================
-- ADMINISTRADORES
-- ===============================================
INSERT INTO users (username, password, email, role, nombre, telefono, activo, fecha_creacion) VALUES 
('admin', 'admin123', 'admin@consultorio.com', 'ADMIN', 'Administrador Sistema', '123456789', true, CURRENT_TIMESTAMP);

-- ===============================================
-- PSICÓLOGOS
-- ===============================================
INSERT INTO users (username, password, email, role, nombre, telefono, especialidad, activo, fecha_creacion, colegiatura, universidad, anios_experiencia, descripcion, tarifa_consulta, horario_atencion) VALUES 
('psicologo1', 'psi123', 'juan.perez@consultorio.com', 'PSICOLOGO', 'Dr. Juan Pérez', '987654321', 'Psicología Clínica', true, CURRENT_TIMESTAMP, 'CMP-12345', 'UNMSM', 10, 'Especialista en ansiedad y depresión', 80.00, 'Lunes a Viernes 9AM-6PM');

INSERT INTO users (username, password, email, role, nombre, telefono, especialidad, activo, fecha_creacion, colegiatura, universidad, anios_experiencia, descripcion, tarifa_consulta, horario_atencion) VALUES 
('psicologo2', 'psi123', 'maria.rodriguez@consultorio.com', 'PSICOLOGO', 'Dra. María Rodríguez', '987654322', 'Terapia Familiar', true, CURRENT_TIMESTAMP, 'CMP-23456', 'PUCP', 8, 'Experta en terapia familiar y de pareja', 70.00, 'Lunes a Viernes 2PM-8PM');

INSERT INTO users (username, password, email, role, nombre, telefono, especialidad, activo, fecha_creacion, colegiatura, universidad, anios_experiencia, descripcion, tarifa_consulta, horario_atencion) VALUES 
('psicologo3', 'psi123', 'carlos.mendoza@consultorio.com', 'PSICOLOGO', 'Dr. Carlos Mendoza', '987654323', 'Psicología Infantil', true, CURRENT_TIMESTAMP, 'CMP-34567', 'UPCH', 12, 'Especialista en niños y adolescentes', 75.00, 'Lunes a Viernes 8AM-4PM');

-- ===============================================
-- PACIENTES
-- ===============================================
INSERT INTO users (username, password, email, role, nombre, telefono, activo, fecha_creacion, dni, fecha_nacimiento, direccion, genero, telefono_emergencia) VALUES 
('paciente1', 'pac123', 'ana.garcia@email.com', 'PACIENTE', 'Ana García Mendoza', '456789123', true, CURRENT_TIMESTAMP, '12345678', '1990-05-15', 'Av. Javier Prado 123, San Isidro', 'Femenino', '999888777');

INSERT INTO users (username, password, email, role, nombre, telefono, activo, fecha_creacion, dni, fecha_nacimiento, direccion, genero, telefono_emergencia) VALUES 
('paciente2', 'pac123', 'carlos.lopez@email.com', 'PACIENTE', 'Carlos López Vargas', '456789124', true, CURRENT_TIMESTAMP, '87654321', '1985-08-22', 'Calle Las Flores 456, Miraflores', 'Masculino', '988777666');

INSERT INTO users (username, password, email, role, nombre, telefono, activo, fecha_creacion, dni, fecha_nacimiento, direccion, genero, telefono_emergencia) VALUES 
('paciente3', 'pac123', 'lucia.torres@email.com', 'PACIENTE', 'Lucía Torres Ramírez', '456789125', true, CURRENT_TIMESTAMP, '11223344', '1992-12-03', 'Jr. Amazonas 789, Lima', 'Femenino', '977666555');

-- ===============================================
-- CITAS MÉDICAS
-- ===============================================

-- Citas RESERVADAS (futuras)
INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo) VALUES 
((SELECT id FROM users WHERE username = 'paciente1'), (SELECT id FROM users WHERE username = 'psicologo1'), DATEADD('HOUR', 24, CURRENT_TIMESTAMP), 'RESERVADA', 'PRESENCIAL', 80.00, false, 'Ana García Mendoza', 'Dr. Juan Pérez');

INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo) VALUES 
((SELECT id FROM users WHERE username = 'paciente2'), (SELECT id FROM users WHERE username = 'psicologo2'), DATEADD('HOUR', 48, CURRENT_TIMESTAMP), 'RESERVADA', 'VIDEOLLAMADA', 70.00, false, 'Carlos López Vargas', 'Dra. María Rodríguez');

INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo) VALUES 
((SELECT id FROM users WHERE username = 'paciente3'), (SELECT id FROM users WHERE username = 'psicologo3'), DATEADD('HOUR', 72, CURRENT_TIMESTAMP), 'RESERVADA', 'PRESENCIAL', 75.00, true, 'Lucía Torres Ramírez', 'Dr. Carlos Mendoza');

-- Citas COMPLETADAS (con historia clínica)
INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente1'), (SELECT id FROM users WHERE username = 'psicologo1'), DATEADD('DAY', -7, CURRENT_TIMESTAMP), 'COMPLETADA', 'PRESENCIAL', 80.00, true, 'Ana García Mendoza', 'Dr. Juan Pérez', 'Sesión completada - Ver nota clínica detallada');

INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente1'), (SELECT id FROM users WHERE username = 'psicologo1'), DATEADD('DAY', -14, CURRENT_TIMESTAMP), 'COMPLETADA', 'VIDEOLLAMADA', 80.00, true, 'Ana García Mendoza', 'Dr. Juan Pérez', 'Segunda sesión - Progreso notable');

INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente2'), (SELECT id FROM users WHERE username = 'psicologo2'), DATEADD('DAY', -10, CURRENT_TIMESTAMP), 'COMPLETADA', 'PRESENCIAL', 70.00, true, 'Carlos López Vargas', 'Dra. María Rodríguez', 'Terapia de pareja - Primera sesión');

INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente3'), (SELECT id FROM users WHERE username = 'psicologo3'), DATEADD('DAY', -5, CURRENT_TIMESTAMP), 'COMPLETADA', 'PRESENCIAL', 75.00, true, 'Lucía Torres Ramírez', 'Dr. Carlos Mendoza', 'Trabajo con autoestima - Resultados positivos');

-- Citas con PAGOS PENDIENTES
INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente2'), (SELECT id FROM users WHERE username = 'psicologo2'), DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'COMPLETADA', 'VIDEOLLAMADA', 70.00, false, 'Carlos López Vargas', 'Dra. María Rodríguez', 'Segunda sesión de pareja - Pago pendiente');

-- Citas CANCELADAS
INSERT INTO appointments (paciente_id, psicologo_id, fecha_hora, estado, modalidad, precio, pagado, nombre_paciente, nombre_psicologo, notas) VALUES 
((SELECT id FROM users WHERE username = 'paciente3'), (SELECT id FROM users WHERE username = 'psicologo1'), DATEADD('DAY', -6, CURRENT_TIMESTAMP), 'CANCELADA', 'PRESENCIAL', 80.00, false, 'Lucía Torres Ramírez', 'Dr. Juan Pérez', 'Cancelada por motivos de salud del paciente');

-- ===============================================
-- PAGOS (Historial de pagos por paciente)
-- ===============================================

-- Pagos COMPLETADOS (usando IDs fijos)
INSERT INTO payments (appointment_id, paciente_id, psicologo_id, monto, metodo_pago, estado, fecha_pago, numero_transaccion, numero_comprobante, concepto_pago, nombre_paciente, nombre_psicologo) VALUES 
(4, 2, 2, 80.00, 'YAPE', 'COMPLETADO', DATEADD('DAY', -6, CURRENT_TIMESTAMP), 'YPE-20250107-001', 'F001-0001', 'Consulta psicológica', 'Ana García Mendoza', 'Dr. Juan Pérez');

INSERT INTO payments (appointment_id, paciente_id, psicologo_id, monto, metodo_pago, estado, fecha_pago, numero_transaccion, numero_comprobante, concepto_pago, nombre_paciente, nombre_psicologo) VALUES 
(5, 2, 2, 80.00, 'TARJETA', 'COMPLETADO', DATEADD('DAY', -13, CURRENT_TIMESTAMP), 'VISA-20250101-002', 'F001-0002', 'Consulta psicológica videollamada', 'Ana García Mendoza', 'Dr. Juan Pérez');

INSERT INTO payments (appointment_id, paciente_id, psicologo_id, monto, metodo_pago, estado, fecha_pago, numero_transaccion, numero_comprobante, concepto_pago, nombre_paciente, nombre_psicologo) VALUES 
(6, 3, 3, 70.00, 'PLIN', 'COMPLETADO', DATEADD('DAY', -9, CURRENT_TIMESTAMP), 'PLN-20250102-001', 'F001-0003', 'Terapia familiar', 'Carlos López Vargas', 'Dra. María Rodríguez');

INSERT INTO payments (appointment_id, paciente_id, psicologo_id, monto, metodo_pago, estado, fecha_pago, numero_transaccion, numero_comprobante, concepto_pago, nombre_paciente, nombre_psicologo) VALUES 
(7, 4, 4, 75.00, 'EFECTIVO', 'COMPLETADO', DATEADD('DAY', -4, CURRENT_TIMESTAMP), 'EFE-20250105-001', 'B001-0001', 'Terapia individual', 'Lucía Torres Ramírez', 'Dr. Carlos Mendoza');

-- Pago PENDIENTE
INSERT INTO payments (appointment_id, paciente_id, psicologo_id, monto, metodo_pago, estado, fecha_pago, concepto_pago, observaciones, nombre_paciente, nombre_psicologo) VALUES 
(8, 3, 3, 70.00, 'YAPE', 'PENDIENTE', DATEADD('DAY', -3, CURRENT_TIMESTAMP), 'Terapia de pareja - Segunda sesión', 'Paciente indica que realizará pago en próximos días', 'Carlos López Vargas', 'Dra. María Rodríguez');

-- ===============================================
-- NOTAS CLÍNICAS (Historia clínica detallada)
-- ===============================================

-- Nota clínica para Ana García - Primera sesión
INSERT INTO clinical_notes (appointment_id, paciente_id, psicologo_id, fecha_creacion, tipo_nota, contenido, observaciones_generales, plan_tratamiento, tareas_paciente, estado_emocional, nivel_funcionalidad, sesion_numero, requiere_seguimiento, proxima_revision, nombre_paciente, nombre_psicologo, modalidad_sesion) VALUES 
(4, 2, 2, DATEADD('DAY', -7, CURRENT_TIMESTAMP), 'EVALUACION_INICIAL',
'MOTIVO DE CONSULTA: Paciente acude por síntomas de ansiedad generalizada que interfieren con su rendimiento laboral y relaciones interpersonales. Refiere episodios de palpitaciones, sudoración y pensamientos catastróficos desde hace 3 meses.

HISTORIA CLÍNICA: Sin antecedentes psiquiátricos familiares relevantes. Episodio desencadenante relacionado con cambio laboral. No consumo de sustancias.

EVALUACIÓN MENTAL: Paciente consciente, orientada, cooperativa. Ansiedad visible durante la sesión. Insight conservado, motivación alta para el tratamiento.

DIAGNÓSTICO PROVISIONAL: Trastorno de Ansiedad Generalizada (F41.1)',
'Paciente presenta buena alianza terapéutica. Comprende la naturaleza de sus síntomas y muestra disposición para el trabajo terapéutico.',
'1. Psicoeducación sobre ansiedad
2. Técnicas de relajación muscular progresiva
3. Identificación y reestructuración de pensamientos automáticos
4. Programa de actividades graduales',
'1. Practicar ejercicios de respiración diafragmática 2 veces al día
2. Registro de situaciones ansiógenas y pensamientos asociados
3. Implementar técnica de relajación antes de dormir',
'ANSIOSO', 'MEDIO', 1, true, DATEADD('DAY', 0, CURRENT_TIMESTAMP), 'Ana García Mendoza', 'Dr. Juan Pérez', 'PRESENCIAL');

-- Nota clínica para Ana García - Segunda sesión
INSERT INTO clinical_notes (appointment_id, paciente_id, psicologo_id, fecha_creacion, tipo_nota, contenido, observaciones_generales, plan_tratamiento, tareas_paciente, estado_emocional, nivel_funcionalidad, sesion_numero, requiere_seguimiento, proxima_revision, nombre_paciente, nombre_psicologo, modalidad_sesion) VALUES 
(5, 2, 2, DATEADD('DAY', -14, CURRENT_TIMESTAMP), 'SEGUIMIENTO',
'PROGRESO: Paciente reporta mejora significativa en manejo de síntomas ansiosos. Ha implementado técnicas de respiración con buenos resultados. Disminución de episodios de palpitaciones.

TRABAJO EN SESIÓN: Se profundizó en identificación de pensamientos automáticos negativos. Paciente logra reconocer patrones de pensamiento catastrófico. Se trabajó reestructuración cognitiva con técnica de evidencias a favor y en contra.

COMPLIANCE: Excelente adherencia a tareas asignadas. Completó registro de pensamientos de manera detallada.',
'Evolución favorable. Paciente demuestra mayor insight y herramientas de autocontrol. Modalidad virtual resultó efectiva.',
'1. Continuar con reestructuración cognitiva
2. Introducir técnicas de mindfulness
3. Trabajo con autoestima y autoeficacia
4. Planificación de actividades placenteras',
'1. Continuar registro de pensamientos con nuevas estrategias aprendidas
2. Práctica de mindfulness 10 minutos diarios
3. Programar una actividad placentera cada día',
'ESTABLE', 'ALTO', 2, true, DATEADD('DAY', 7, CURRENT_TIMESTAMP), 'Ana García Mendoza', 'Dr. Juan Pérez', 'VIDEOLLAMADA');

-- Nota clínica para Carlos López - Terapia de pareja
INSERT INTO clinical_notes (appointment_id, paciente_id, psicologo_id, fecha_creacion, tipo_nota, contenido, observaciones_generales, plan_tratamiento, tareas_paciente, estado_emocional, nivel_funcionalidad, sesion_numero, requiere_seguimiento, proxima_revision, nombre_paciente, nombre_psicologo, modalidad_sesion) VALUES 
(6, 3, 3, DATEADD('DAY', -10, CURRENT_TIMESTAMP), 'EVALUACION_INICIAL',
'MOTIVO DE CONSULTA: Pareja acude por dificultades en comunicación y conflictos frecuentes. Ambos miembros refieren deterioro en la relación durante los últimos 6 meses.

DINÁMICA OBSERVADA: Patrón de comunicación defensiva. Dificultad para expresar necesidades sin culpabilizar. Ambos muestran compromiso con el proceso terapéutico.

ÁREAS PROBLEMÁTICAS:
1. Comunicación inefectiva
2. Distribución de responsabilidades domésticas
3. Diferencias en manejo financiero
4. Intimidad afectada

FORTALEZAS: Amor mutuo preservado, historia compartida valiosa, motivación para mejorar.',
'Buen pronóstico terapéutico. Ambos miembros participan activamente y muestran insight sobre problemas relacionales.',
'1. Entrenamiento en comunicación asertiva
2. Técnicas de escucha activa
3. Negociación y resolución de conflictos
4. Tareas de reconexión emocional',
'1. Implementar "tiempo de pareja" 30 minutos diarios sin dispositivos
2. Práctica de técnica de parafraseo antes de responder en conflictos
3. Lista individual de cambios que cada uno puede hacer',
'ESTABLE', 'MEDIO', 1, true, DATEADD('DAY', 7, CURRENT_TIMESTAMP), 'Carlos López Vargas', 'Dra. María Rodríguez', 'PRESENCIAL');

-- Nota clínica para Lucía Torres
INSERT INTO clinical_notes (appointment_id, paciente_id, psicologo_id, fecha_creacion, tipo_nota, contenido, observaciones_generales, plan_tratamiento, tareas_paciente, estado_emocional, nivel_funcionalidad, sesion_numero, requiere_seguimiento, nombre_paciente, nombre_psicologo, modalidad_sesion) VALUES 
(7, 4, 4, DATEADD('DAY', -5, CURRENT_TIMESTAMP), 'SEGUIMIENTO',
'MOTIVO: Continuación de trabajo en autoestima y confianza personal iniciado en sesiones previas.

PROGRESO: Paciente muestra mejoras notables en autopercepción. Ha logrado establecer límites más claros en relaciones interpersonales. Reporta mayor seguridad en toma de decisiones.

TRABAJO EN SESIÓN: Se utilizaron técnicas cognitivo-conductuales para reforzar logros alcanzados. Revisión de metas personales y profesionales. Identificación de fortalezas personales.

ESTADO ACTUAL: Notable mejora en estado de ánimo. Mayor activación conductual y social.',
'Evolución muy satisfactoria. Paciente ha internalizado herramientas terapéuticas y las aplica de manera autónoma.',
'1. Consolidación de logros obtenidos
2. Prevención de recaídas
3. Planificación de metas a largo plazo
4. Espaciamiento gradual de sesiones',
'1. Diario de logros diarios (por pequeños que sean)
2. Mantener actividades sociales programadas
3. Aplicar técnicas de autorefuerzo positivo',
'ESTABLE', 'ALTO', 3, false, 'Lucía Torres Ramírez', 'Dr. Carlos Mendoza', 'PRESENCIAL');