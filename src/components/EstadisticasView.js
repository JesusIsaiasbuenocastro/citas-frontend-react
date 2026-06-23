import React from 'react';
import { useCitas } from '../context/CitasContext';

// ─── ESTADÍSTICAS VIEW ────────────────────────────────────────────────────────
// Vista de análisis de datos. Muestra métricas derivadas de las citas.
// No depende de librerías externas: los gráficos son CSS puro.
//
// Concepto importante para el currículo: data aggregation en el frontend.
// Tomamos el array de citas y lo transformamos en distintas vistas
// de los mismos datos (por status, por especie, por día de la semana).
// Esto demuestra pensamiento analítico además de UI.

const EstadisticasView = () => {
  const { citas, citasPendientes, citasUrgentes, citasCompletadas } = useCitas();

  // ── Distribución por especie ──────────────────────────────────────────────
  const porEspecie = citas.reduce((acc, c) => {
    const especie = c.especie || 'otro';
    acc[especie] = (acc[especie] || 0) + 1;
    return acc;
  }, {});

  const especieInfo = {
    perro: { label: 'Perros', emoji: '🐶', color: '#7F77DD' },
    gato: { label: 'Gatos', emoji: '🐱', color: '#1D9E75' },
    ave: { label: 'Aves', emoji: '🦜', color: '#EF9F27' },
    conejo: { label: 'Conejos', emoji: '🐰', color: '#D85A30' },
    pez: { label: 'Peces', emoji: '🐠', color: '#378ADD' },
    otro: { label: 'Otros', emoji: '🐾', color: '#888780' },
  };

  // ── Citas por día de la semana ────────────────────────────────────────────
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const porDia = Array(7).fill(0);
  citas.forEach(c => {
    if (c.fecha) {
      // Creamos la fecha con hora para evitar el problema de zona horaria UTC
      const [year, month, day] = c.fecha.split('-').map(Number);
      const fecha = new Date(year, month - 1, day);
      porDia[fecha.getDay()]++;
    }
  });
  const maxDia = Math.max(...porDia, 1);

  // ── Tasa de completado ────────────────────────────────────────────────────
  const tasaCompletado = citas.length > 0
    ? Math.round((citasCompletadas.length / citas.length) * 100)
    : 0;

  return (
    <div className="pantalla">
      <div className="topbar">
        <div className="topbar__titulo">
          <span className="topbar__icono">📊</span>
          Estadísticas
        </div>
      </div>

      <div className="pantalla__contenido">

        {/* ── Métricas resumen ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__label">📋 Total citas</span>
            <span className="stat-card__valor">{citas.length}</span>
            <span className="stat-card__sub">Historial completo</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">⏳ Pendientes</span>
            <span className="stat-card__valor">{citasPendientes.length}</span>
            <span className="stat-card__sub">Por atender</span>
          </div>
          <div className="stat-card stat-card--urgente">
            <span className="stat-card__label">🚨 Urgentes</span>
            <span className="stat-card__valor">{citasUrgentes.length}</span>
            <span className="stat-card__sub">Prioridad alta</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">✅ Tasa completado</span>
            <span className="stat-card__valor">{tasaCompletado}%</span>
            <span className="stat-card__sub">{citasCompletadas.length} completadas</span>
          </div>
        </div>

        <div className="estadisticas-grid">

          {/* ── Gráfico de barras por día ── */}
          <div className="grafico-card">
            <h2 className="grafico-titulo">Citas por día de la semana</h2>
            <div className="bar-chart" role="img" aria-label="Gráfico de barras: citas por día de semana">
              {dias.map((dia, i) => (
                <div key={dia} className="bar-chart__col">
                  <span className="bar-chart__valor">{porDia[i]}</span>
                  <div className="bar-chart__barra-wrapper">
                    <div
                      className="bar-chart__barra"
                      style={{ height: `${(porDia[i] / maxDia) * 100}%` }}
                      aria-label={`${dia}: ${porDia[i]} citas`}
                    />
                  </div>
                  <span className="bar-chart__label">{dia}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Distribución por especie ── */}
          <div className="grafico-card">
            <h2 className="grafico-titulo">Pacientes por especie</h2>
            {citas.length === 0 ? (
              <div className="estado-vacio" style={{ padding: '1rem 0' }}>
                <p className="estado-vacio__texto">Sin datos todavía</p>
              </div>
            ) : (
              <div className="especie-lista">
                {Object.entries(porEspecie)
                  .sort((a, b) => b[1] - a[1])
                  .map(([especie, count]) => {
                    const info = especieInfo[especie] || especieInfo.otro;
                    const porcentaje = Math.round((count / citas.length) * 100);
                    return (
                      <div key={especie} className="especie-row">
                        <span className="especie-row__emoji">{info.emoji}</span>
                        <span className="especie-row__label">{info.label}</span>
                        <div className="especie-row__barra-wrapper">
                          <div
                            className="especie-row__barra"
                            style={{ width: `${porcentaje}%`, background: info.color }}
                          />
                        </div>
                        <span className="especie-row__count">{count}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>

        {/* ── Distribución por status ── */}
        <div className="grafico-card">
          <h2 className="grafico-titulo">Estado de las citas</h2>
          <div className="status-resumen">
            {[
              { label: 'Pendientes', count: citasPendientes.length, clase: 'chip--pendiente' },
              { label: 'Urgentes', count: citasUrgentes.length, clase: 'chip--urgente' },
              { label: 'Completadas', count: citasCompletadas.length, clase: 'chip--completada' },
            ].map(({ label, count, clase }) => (
              <div key={label} className="status-resumen__item">
                <span className={`status-chip ${clase}`}>{label}</span>
                <span className="status-resumen__count">{count}</span>
                <span className="status-resumen__pct">
                  {citas.length > 0 ? Math.round((count / citas.length) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default EstadisticasView;
