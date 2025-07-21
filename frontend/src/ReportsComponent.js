import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8080/api";

function ReportsComponent({ user }) {
  const [reports, setReports] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedPsychologist, setSelectedPsychologist] = useState("all");
  const [psychologists, setPsychologists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("general");

  // NUEVOS ESTADOS PARA FILTROS AVANZADOS
  const [timeFilter, setTimeFilter] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredData, setFilteredData] = useState(null);
  const [rawAppointments, setRawAppointments] = useState([]);
  const [rawPayments, setRawPayments] = useState([]);

  useEffect(() => {
    loadReports();
    loadRawData();
    if (user.role === "ADMIN") {
      loadPsychologists();
    }
  }, [user.role]);

  // Filtrar datos cuando cambien los filtros
  useEffect(() => {
    if (rawAppointments.length > 0) {
      applyTimeFilters();
    }
  }, [timeFilter, startDate, endDate, rawAppointments, rawPayments]);

  const loadReports = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/reports`;

      if (user.role === "PSICOLOGO") {
        url = `${API_BASE}/reports/psychologist/${user.id}`;
      } else if (user.role === "PACIENTE") {
        url = `${API_BASE}/reports/patient/${user.id}`;
      }

      const response = await axios.get(url);
      setReports(response.data);
    } catch (error) {
      console.error("Error loading reports:", error);
      alert("Error al cargar reportes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // NUEVA FUNCIÓN PARA CARGAR DATOS CRUDOS
  const loadRawData = async () => {
    try {
      let appointmentsUrl = `${API_BASE}/appointments`;
      let paymentsUrl = `${API_BASE}/payments`;

      if (user.role === "PSICOLOGO") {
        appointmentsUrl = `${API_BASE}/appointments/psychologist/${user.id}`;
        paymentsUrl = `${API_BASE}/payments/psychologist/${user.id}`;
      } else if (user.role === "PACIENTE") {
        appointmentsUrl = `${API_BASE}/appointments/patient/${user.id}`;
        paymentsUrl = `${API_BASE}/payments/patient/${user.id}`;
      }

      const [appointmentsRes, paymentsRes] = await Promise.all([
        axios.get(appointmentsUrl),
        axios.get(paymentsUrl),
      ]);

      setRawAppointments(appointmentsRes.data || []);
      setRawPayments(paymentsRes.data || []);
    } catch (error) {
      console.error("Error loading raw data:", error);
    }
  };

  // NUEVA FUNCIÓN PARA APLICAR FILTROS DE TIEMPO
  const applyTimeFilters = () => {
    const now = new Date();
    let filterStartDate, filterEndDate;

    switch (timeFilter) {
      case "today":
        filterStartDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        filterEndDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "week":
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        filterStartDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate()
        );
        filterEndDate = new Date(
          startOfWeek.getFullYear(),
          startOfWeek.getMonth(),
          startOfWeek.getDate() + 7
        );
        break;
      case "month":
        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "quarter":
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        filterStartDate = new Date(now.getFullYear(), quarterMonth, 1);
        filterEndDate = new Date(now.getFullYear(), quarterMonth + 3, 1);
        break;
      case "year":
        filterStartDate = new Date(now.getFullYear(), 0, 1);
        filterEndDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case "custom":
        if (startDate && endDate) {
          filterStartDate = new Date(startDate);
          filterEndDate = new Date(endDate);
          filterEndDate.setDate(filterEndDate.getDate() + 1); // Incluir el día final
        } else {
          return;
        }
        break;
      default:
        return;
    }

    // Filtrar citas
    const filteredAppointments = rawAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.fechaHora);
      return (
        appointmentDate >= filterStartDate && appointmentDate < filterEndDate
      );
    });

    // Filtrar pagos
    const filteredPayments = rawPayments.filter((payment) => {
      const paymentDate = new Date(payment.fechaPago);
      return paymentDate >= filterStartDate && paymentDate < filterEndDate;
    });

    // Calcular estadísticas filtradas
    const completedAppointments = filteredAppointments.filter(
      (a) => a.estado === "COMPLETADA"
    );
    const cancelledAppointments = filteredAppointments.filter(
      (a) => a.estado === "CANCELADA"
    );
    const pendingAppointments = filteredAppointments.filter(
      (a) => a.estado === "RESERVADA"
    );
    const paidAppointments = filteredAppointments.filter((a) => a.pagado);

    const completedPayments = filteredPayments.filter(
      (p) => p.estado === "COMPLETADO"
    );
    const pendingPayments = filteredPayments.filter(
      (p) => p.estado === "PENDIENTE"
    );

    const totalIngresos = completedPayments.reduce(
      (sum, p) => sum + p.monto,
      0
    );
    const ingresosPendientes = pendingPayments.reduce(
      (sum, p) => sum + p.monto,
      0
    );

    // Estadísticas por psicólogo (solo para admin)
    let estadisticasPsicologos = {};
    if (user.role === "ADMIN") {
      const psychologistStats = {};
      filteredAppointments.forEach((appointment) => {
        const psyName = appointment.nombrePsicologo;
        if (!psychologistStats[psyName]) {
          psychologistStats[psyName] = {
            totalCitas: 0,
            citasCompletadas: 0,
            ingresos: 0,
          };
        }
        psychologistStats[psyName].totalCitas++;
        if (appointment.estado === "COMPLETADA") {
          psychologistStats[psyName].citasCompletadas++;
        }
      });

      filteredPayments.forEach((payment) => {
        const psyName = payment.nombrePsicologo;
        if (psychologistStats[psyName] && payment.estado === "COMPLETADO") {
          psychologistStats[psyName].ingresos += payment.monto;
        }
      });

      estadisticasPsicologos = psychologistStats;
    }

    setFilteredData({
      totalCitas: filteredAppointments.length,
      citasCompletadas: completedAppointments.length,
      citasCanceladas: cancelledAppointments.length,
      citasPendientes: pendingAppointments.length,
      citasPagadas: paidAppointments.length,
      ingresoTotal: totalIngresos,
      ingresosPendientes: ingresosPendientes,
      estadisticasPsicologos: estadisticasPsicologos,
      pacientesUnicos:
        user.role === "PSICOLOGO"
          ? new Set(filteredAppointments.map((a) => a.pacienteId)).size
          : 0,
      totalGastado: user.role === "PACIENTE" ? totalIngresos : 0,
      pendientePagar: user.role === "PACIENTE" ? ingresosPendientes : 0,
      period: `${filterStartDate.toLocaleDateString()} - ${filterEndDate.toLocaleDateString()}`,
      appointments: filteredAppointments,
      payments: filteredPayments,
    });
  };

  const loadPsychologists = async () => {
    try {
      const response = await axios.get(`${API_BASE}/psicologos`);
      setPsychologists(response.data);
    } catch (error) {
      console.error("Error loading psychologists:", error);
    }
  };

  const generatePrintableReport = () => {
    const printWindow = window.open("", "_blank");
    const currentDate = new Date().toLocaleDateString();
    const reportData = filteredData || reports;

    const reportContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte - Centro Psicológico Bienestar</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3182ce;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3182ce;
            margin-bottom: 10px;
          }
          .report-title {
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .stat-card {
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #3182ce;
          }
          .stat-label {
            color: #666;
            margin-top: 5px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .table th, .table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .table th {
            background-color: #f8f9fa;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .period-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🧠 Centro Psicológico Bienestar</div>
          <h1>Reporte Estadístico</h1>
          <p>Generado el: ${currentDate}</p>
          <p>Usuario: ${user.nombre} (${user.role})</p>
        </div>

        ${
          filteredData
            ? `<div class="period-info">📊 Período: ${filteredData.period}</div>`
            : ""
        }

        ${generateReportContent(reportData)}

        <div class="footer">
          <p>© 2025 Centro Psicológico Bienestar - Reporte confidencial</p>
          <p>Este documento contiene información privada y confidencial</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportContent);
    printWindow.document.close();
  };

  const generateReportContent = (reportData) => {
    if (!reportData) return "";

    if (user.role === "ADMIN") {
      return `
        <div class="report-title">Reporte General del Sistema</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${
              reportData.totalUsuarios || reportData.totalCitas || 0
            }</div>
            <div class="stat-label">${
              reportData.totalUsuarios ? "Total Usuarios" : "Total Citas"
            }</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${
              reportData.totalPsicologos || reportData.citasCompletadas || 0
            }</div>
            <div class="stat-label">${
              reportData.totalPsicologos
                ? "Total Psicólogos"
                : "Citas Completadas"
            }</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${
              reportData.totalPacientes || reportData.citasCanceladas || 0
            }</div>
            <div class="stat-label">${
              reportData.totalPacientes ? "Total Pacientes" : "Citas Canceladas"
            }</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">S/ ${(
              reportData.ingresoTotal || 0
            ).toFixed(2)}</div>
            <div class="stat-label">Ingresos Totales</div>
          </div>
        </div>

        ${
          reportData.estadisticasPsicologos
            ? `
        <div class="report-title">Estadísticas por Psicólogo</div>
        <table class="table">
          <thead>
            <tr>
              <th>Psicólogo</th>
              <th>Total Citas</th>
              <th>Citas Completadas</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(reportData.estadisticasPsicologos)
              .map(
                ([nombre, stats]) => `
              <tr>
                <td>${nombre}</td>
                <td>${stats.totalCitas || 0}</td>
                <td>${stats.citasCompletadas || 0}</td>
                <td>S/ ${(stats.ingresos || 0).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }
      `;
    } else if (user.role === "PSICOLOGO") {
      return `
        <div class="report-title">Reporte de Actividad - ${user.nombre}</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${reportData.totalCitas || 0}</div>
            <div class="stat-label">Total Citas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.citasCompletadas || 0}</div>
            <div class="stat-label">Citas Completadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.citasPendientes || 0}</div>
            <div class="stat-label">Citas Pendientes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.pacientesUnicos || 0}</div>
            <div class="stat-label">Pacientes Únicos</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">S/ ${(
              reportData.ingresoTotal || 0
            ).toFixed(2)}</div>
            <div class="stat-label">Ingresos Totales</div>
          </div>
        </div>
      `;
    } else if (user.role === "PACIENTE") {
      return `
        <div class="report-title">Reporte Personal - ${user.nombre}</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${reportData.totalCitas || 0}</div>
            <div class="stat-label">Total Sesiones</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.citasCompletadas || 0}</div>
            <div class="stat-label">Sesiones Completadas</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">S/ ${(
              reportData.totalGastado || 0
            ).toFixed(2)}</div>
            <div class="stat-label">Total Invertido</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">S/ ${(
              reportData.pendientePagar || 0
            ).toFixed(2)}</div>
            <div class="stat-label">Pendiente de Pago</div>
          </div>
        </div>
      `;
    }
  };

  const exportToCSV = () => {
    const reportData = filteredData || reports;
    if (!reportData) {
      alert("No hay datos para exportar");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";

    if (user.role === "ADMIN") {
      csvContent += "Métrica,Valor\n";
      csvContent += `Total Citas,${reportData.totalCitas || 0}\n`;
      csvContent += `Citas Completadas,${reportData.citasCompletadas || 0}\n`;
      csvContent += `Citas Canceladas,${reportData.citasCanceladas || 0}\n`;
      csvContent += `Citas Pendientes,${reportData.citasPendientes || 0}\n`;
      csvContent += `Ingresos Totales,${reportData.ingresoTotal || 0}\n`;
      csvContent += `Ingresos Pendientes,${
        reportData.ingresosPendientes || 0
      }\n`;

      if (filteredData && filteredData.period) {
        csvContent += `Período,${filteredData.period}\n`;
      }
    } else if (user.role === "PSICOLOGO") {
      csvContent += "Métrica,Valor\n";
      csvContent += `Total Citas,${reportData.totalCitas || 0}\n`;
      csvContent += `Citas Completadas,${reportData.citasCompletadas || 0}\n`;
      csvContent += `Citas Pendientes,${reportData.citasPendientes || 0}\n`;
      csvContent += `Pacientes Únicos,${reportData.pacientesUnicos || 0}\n`;
      csvContent += `Ingresos Totales,${reportData.ingresoTotal || 0}\n`;
    } else {
      csvContent += "Métrica,Valor\n";
      csvContent += `Total Sesiones,${reportData.totalCitas || 0}\n`;
      csvContent += `Sesiones Completadas,${
        reportData.citasCompletadas || 0
      }\n`;
      csvContent += `Total Gastado,${reportData.totalGastado || 0}\n`;
      csvContent += `Pendiente de Pago,${reportData.pendientePagar || 0}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `reporte_${user.role.toLowerCase()}_${timeFilter}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const reportData = filteredData || reports;
    if (!reportData) {
      alert("No hay datos para exportar");
      return;
    }

    // Crear contenido Excel básico
    let excelContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .header { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">Reporte ${
            user.role
          } - Centro Psicológico Bienestar</div>
          <div>Fecha: ${new Date().toLocaleDateString()}</div>
          ${filteredData ? `<div>Período: ${filteredData.period}</div>` : ""}
          <br>
          <table>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
            </tr>
    `;

    if (user.role === "ADMIN") {
      excelContent += `
        <tr><td>Total Citas</td><td>${reportData.totalCitas || 0}</td></tr>
        <tr><td>Citas Completadas</td><td>${
          reportData.citasCompletadas || 0
        }</td></tr>
        <tr><td>Citas Canceladas</td><td>${
          reportData.citasCanceladas || 0
        }</td></tr>
        <tr><td>Ingresos Totales</td><td>S/ ${(
          reportData.ingresoTotal || 0
        ).toFixed(2)}</td></tr>
      `;
    } else if (user.role === "PSICOLOGO") {
      excelContent += `
        <tr><td>Total Citas</td><td>${reportData.totalCitas || 0}</td></tr>
        <tr><td>Citas Completadas</td><td>${
          reportData.citasCompletadas || 0
        }</td></tr>
        <tr><td>Pacientes Únicos</td><td>${
          reportData.pacientesUnicos || 0
        }</td></tr>
        <tr><td>Ingresos Totales</td><td>S/ ${(
          reportData.ingresoTotal || 0
        ).toFixed(2)}</td></tr>
      `;
    } else {
      excelContent += `
        <tr><td>Total Sesiones</td><td>${reportData.totalCitas || 0}</td></tr>
        <tr><td>Sesiones Completadas</td><td>${
          reportData.citasCompletadas || 0
        }</td></tr>
        <tr><td>Total Gastado</td><td>S/ ${(
          reportData.totalGastado || 0
        ).toFixed(2)}</td></tr>
        <tr><td>Pendiente de Pago</td><td>S/ ${(
          reportData.pendientePagar || 0
        ).toFixed(2)}</td></tr>
      `;
    }

    excelContent += `
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([excelContent], { type: "application/vnd.ms-excel" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_${user.role.toLowerCase()}_${timeFilter}_${
      new Date().toISOString().split("T")[0]
    }.xls`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderFilters = () => (
    <div className="card" style={{ marginBottom: "2rem" }}>
      <div className="card-header">
        <h3 className="card-title">📊 Filtros de Reporte</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn btn-success" onClick={generatePrintableReport}>
            🖨️ Imprimir
          </button>
          <button className="btn btn-primary" onClick={exportToCSV}>
            📊 CSV
          </button>
          <button className="btn btn-warning" onClick={exportToExcel}>
            📈 Excel
          </button>
        </div>
      </div>
      <div className="card-body">
        <div className="form-row">
          <div>
            <label className="form-label">🕐 Período de Tiempo</label>
            <select
              className="form-control select-control"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="today">📅 Hoy</option>
              <option value="week">📊 Esta Semana</option>
              <option value="month">📆 Este Mes</option>
              <option value="quarter">📈 Este Trimestre</option>
              <option value="year">🗓️ Este Año</option>
              <option value="custom">🎯 Personalizado</option>
            </select>
          </div>
        </div>

        {timeFilter === "custom" && (
          <div className="form-row" style={{ marginTop: "1rem" }}>
            <div>
              <label className="form-label">📅 Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">📅 Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {filteredData && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#e3f2fd",
              borderRadius: "0.5rem",
              borderLeft: "4px solid #1976d2",
            }}
          >
            <strong>📊 Datos Filtrados:</strong> {filteredData.period} |
            <strong> Total Citas:</strong> {filteredData.totalCitas} |
            <strong> Ingresos:</strong> S/{" "}
            {filteredData.ingresoTotal.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );

  const renderAdminReports = () => {
    const reportData = filteredData || reports;

    return (
      <div>
        {renderFilters()}

        {/* Stats Overview */}
        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.totalCitas || reportData?.totalUsuarios || 0}
            </div>
            <div className="stat-label">
              {filteredData ? "Total Citas" : "Total Usuarios"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.citasCompletadas || reportData?.totalCitas || 0}
            </div>
            <div className="stat-label">
              {filteredData ? "Citas Completadas" : "Total Citas"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.citasCanceladas || reportData?.citasCompletadas || 0}
            </div>
            <div className="stat-label">
              {filteredData ? "Citas Canceladas" : "Citas Completadas"}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {(reportData?.ingresoTotal || 0).toFixed(2)}
            </div>
            <div className="stat-label">Ingresos Totales</div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        {filteredData && (
          <div className="card" style={{ marginBottom: "2rem" }}>
            <div className="card-header">
              <h3 className="card-title">🎯 Métricas de Eficiencia</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    background: "#f0fff4",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#22543d",
                    }}
                  >
                    {filteredData.totalCitas > 0
                      ? Math.round(
                          (filteredData.citasCompletadas /
                            filteredData.totalCitas) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div style={{ color: "#22543d" }}>Tasa de Finalización</div>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    background: "#fff5f5",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#742a2a",
                    }}
                  >
                    {filteredData.totalCitas > 0
                      ? Math.round(
                          (filteredData.citasCanceladas /
                            filteredData.totalCitas) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div style={{ color: "#742a2a" }}>Tasa de Cancelación</div>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    background: "#f7fafc",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#2d3748",
                    }}
                  >
                    S/{" "}
                    {filteredData.citasCompletadas > 0
                      ? (
                          filteredData.ingresoTotal /
                          filteredData.citasCompletadas
                        ).toFixed(0)
                      : 0}
                  </div>
                  <div style={{ color: "#2d3748" }}>Promedio por Cita</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Statistics */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
          }}
        >
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">👩‍⚕️ Estadísticas por Psicólogo</h3>
            </div>
            <div className="card-body no-padding">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Psicólogo</th>
                      <th>Citas</th>
                      <th>Completadas</th>
                      <th>Ingresos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      reportData?.estadisticasPsicologos || {}
                    ).map(([nombre, stats]) => (
                      <tr key={nombre}>
                        <td>{nombre}</td>
                        <td>{stats.totalCitas || 0}</td>
                        <td>{stats.citasCompletadas || 0}</td>
                        <td>S/ {(stats.ingresos || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💰 Resumen Financiero</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <strong>💵 Ingresos Confirmados:</strong>
                  <span style={{ color: "#48bb78", fontWeight: "bold" }}>
                    S/ {(reportData?.ingresoTotal || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <strong>⏳ Ingresos Pendientes:</strong>
                  <span style={{ color: "#ed8936", fontWeight: "bold" }}>
                    S/ {(reportData?.ingresosPendientes || 0).toFixed(2)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <strong>✅ Citas Pagadas:</strong>
                  <span>{reportData?.citasPagadas || 0}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "1rem",
                    background: "#f8f9fa",
                    borderRadius: "0.5rem",
                  }}
                >
                  <strong>📅 Citas Pendientes:</strong>
                  <span>{reportData?.citasPendientes || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPsychologistReports = () => {
    const reportData = filteredData || reports;

    return (
      <div>
        {renderFilters()}

        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-number">{reportData?.totalCitas || 0}</div>
            <div className="stat-label">Total Citas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.citasCompletadas || 0}
            </div>
            <div className="stat-label">Citas Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.pacientesUnicos || 0}
            </div>
            <div className="stat-label">Pacientes Únicos</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {(reportData?.ingresoTotal || 0).toFixed(2)}
            </div>
            <div className="stat-label">Ingresos Generados</div>
          </div>
        </div>

        {/* Performance Chart */}
        {filteredData && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📈 Análisis de Rendimiento</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                  textAlign: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#3182ce",
                    }}
                  >
                    {filteredData.totalCitas > 0
                      ? Math.round(
                          (filteredData.citasCompletadas /
                            filteredData.totalCitas) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div>Tasa de Éxito</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#48bb78",
                    }}
                  >
                    S/{" "}
                    {filteredData.citasCompletadas > 0
                      ? (
                          filteredData.ingresoTotal /
                          filteredData.citasCompletadas
                        ).toFixed(0)
                      : 0}
                  </div>
                  <div>Ingreso Promedio</div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#ed8936",
                    }}
                  >
                    {filteredData.pacientesUnicos || 0}
                  </div>
                  <div>Pacientes Activos</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPatientReports = () => {
    const reportData = filteredData || reports;

    return (
      <div>
        {renderFilters()}

        <div className="stats-grid" style={{ marginBottom: "2rem" }}>
          <div className="stat-card">
            <div className="stat-number">{reportData?.totalCitas || 0}</div>
            <div className="stat-label">Total Sesiones</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {reportData?.citasCompletadas || 0}
            </div>
            <div className="stat-label">Sesiones Completadas</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {(reportData?.totalGastado || 0).toFixed(2)}
            </div>
            <div className="stat-label">Total Invertido</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              S/ {(reportData?.pendientePagar || 0).toFixed(2)}
            </div>
            <div className="stat-label">Pendiente de Pago</div>
          </div>
        </div>

        {/* Progress Chart */}
        {filteredData && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📊 Mi Progreso</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    background: "#f0fff4",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#22543d",
                    }}
                  >
                    {filteredData.totalCitas > 0
                      ? Math.round(
                          (filteredData.citasCompletadas /
                            filteredData.totalCitas) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div style={{ color: "#22543d" }}>Asistencia</div>
                </div>
                <div
                  style={{
                    padding: "1rem",
                    background: "#e3f2fd",
                    borderRadius: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    S/{" "}
                    {filteredData.citasCompletadas > 0
                      ? (
                          filteredData.totalGastado /
                          filteredData.citasCompletadas
                        ).toFixed(0)
                      : 0}
                  </div>
                  <div style={{ color: "#1976d2" }}>Costo Promedio</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando reportes...</p>
      </div>
    );
  }

  return (
    <div>
      {user.role === "ADMIN" && renderAdminReports()}
      {user.role === "PSICOLOGO" && renderPsychologistReports()}
      {user.role === "PACIENTE" && renderPatientReports()}
    </div>
  );
}

export default ReportsComponent;
