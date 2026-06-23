import React from 'react';
import { useCitas } from '../context/CitasContext';
import CitaCard from './CitaCard';

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// Pantalla principal de la app. Muestra:
// 1. Tarjetas de estadísticas (datos derivados del contexto)
// 2. Las citas de HOY como lista prioritaria
// 3. Un estado vacío informativo si no hay citas hoy
//
// No tiene lógica de negocio propia: consume datos del contexto.
// Recibe `abrirModal` como prop para poder crear y editar citas.

const Dashboard = ({ abrirModal }) => {
  const {
    citas,
    citasHoy,
    citasPendientes,
    citasUrgentes,
    citasCompletadas,
  } = useCitas();

  return (
    <div className="pantalla">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar__titulo">
          <span className="topbar__icono">⊞</span>
          Dashboard
        </div>
        <button className="btn-primario" onClick={() => abrirModal()}>
          + Nueva cita
        </button>
      </div>

      <div className="pantalla__contenido">

        {/* ── Tarjetas de estadísticas ── */}
        <section className="stats-grid" aria-label="Resumen de citas">
          <div className="stat-card">
            <span className="stat-card__label">📅 Citas hoy</span>
            <span className="stat-card__valor">{citasHoy.length}</span>
            <span className="stat-card__sub">
              {citasHoy.filter(c => c.status === 'pendiente').length} pendientes
            </span>
          </div>
          <div className="stat-card stat-card--urgente">
            <span className="stat-card__label">🚨 Urgentes</span>
            <span className="stat-card__valor">{citasUrgentes.length}</span>
            <span className="stat-card__sub">Atención inmediata</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">✓ Completadas</span>
            <span className="stat-card__valor">{citasCompletadas.length}</span>
            <span className="stat-card__sub">Total histórico</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">🗂 Total citas</span>
            <span className="stat-card__valor">{citas.length}</span>
            <span className="stat-card__sub">{citasPendientes.length} pendientes</span>
          </div>
        </section>

        {/* ── Citas de hoy ── */}
        <section>
          <h2 className="seccion-titulo">Citas de hoy</h2>

          {citasHoy.length === 0 ? (
            <EstadoVacio onAgregar={() => abrirModal()} />
          ) : (
            <div className="citas-grid">
              {/* Primero urgentes, luego pendientes, luego completadas */}
              {[...citasHoy]
                .sort((a, b) => {
                  const orden = { urgente: 0, pendiente: 1, completada: 2 };
                  return orden[a.status] - orden[b.status];
                })
                .map(cita => (
                  <CitaCard key={cita.id} cita={cita} onEditar={abrirModal} />
                ))
              }
            </div>
          )}
        </section>

        {/* ── Próximas citas (días futuros) ── */}
        {citas.filter(c => c.fecha > new Date().toISOString().split('T')[0]).length > 0 && (
          <section>
            <h2 className="seccion-titulo">Próximas citas</h2>
            <div className="citas-grid">
              {citas
                .filter(c => c.fecha > new Date().toISOString().split('T')[0])
                .sort((a, b) => a.fecha.localeCompare(b.fecha))
                .slice(0, 3)
                .map(cita => (
                  <CitaCard key={cita.id} cita={cita} onEditar={abrirModal} />
                ))
              }
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// Componente de estado vacío — buena práctica de UX:
// no dejar al usuario con una pantalla en blanco
const EstadoVacio = ({ onAgregar }) => (
  <div className="estado-vacio">
    <span className="estado-vacio__icono">📋</span>
    <h3 className="estado-vacio__titulo">Sin citas para hoy</h3>
    <p className="estado-vacio__texto">
      No hay consultas programadas para hoy. Agrega una nueva cita cuando llegue un paciente.
    </p>
    <button className="btn-primario" onClick={onAgregar}>
      + Agregar cita
    </button>
  </div>
);

export default Dashboard;
