import React, { useState } from 'react';
import { useCitas } from '../context/CitasContext';
import CitaCard from './CitaCard';

// ─── CITAS VIEW ───────────────────────────────────────────────────────────────
// Vista completa del listado de citas con:
// - Búsqueda en tiempo real (por mascota, dueño, síntomas)
// - Filtro por tabs (todas / pendientes / urgentes / completadas)
// - Grid de tarjetas
//
// La búsqueda y el filtro son estado LOCAL de esta pantalla,
// no global. Solo el Dashboard y el Sidebar necesitan saber cuántas hay.
// Lección: no todo tiene que ir al contexto global.

const TABS = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'urgente', label: 'Urgentes' },
  { id: 'completada', label: 'Completadas' },
];

const CitasView = ({ abrirModal }) => {
  const { citas } = useCitas();
  const [busqueda, setBusqueda] = useState('');
  const [tabActiva, setTabActiva] = useState('todas');

  // Filtrado en dos pasos:
  // 1. Por texto de búsqueda
  // 2. Por tab (status)
  const citasFiltradas = citas
    .filter(c => {
      const q = busqueda.toLowerCase();
      return (
        c.mascota.toLowerCase().includes(q) ||
        c.propietario.toLowerCase().includes(q) ||
        c.sintomas.toLowerCase().includes(q)
      );
    })
    .filter(c => tabActiva === 'todas' || c.status === tabActiva)
    .sort((a, b) => {
      // Ordenar por fecha ascendente, luego por hora
      const fechaComp = a.fecha.localeCompare(b.fecha);
      return fechaComp !== 0 ? fechaComp : a.hora.localeCompare(b.hora);
    });

  // Contadores para mostrar en cada tab
  const contadorTab = (id) => {
    if (id === 'todas') return citas.length;
    return citas.filter(c => c.status === id).length;
  };

  return (
    <div className="pantalla">
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar__titulo">
          <span className="topbar__icono">📅</span>
          Todas las citas
        </div>
        <button className="btn-primario" onClick={() => abrirModal()}>
          + Nueva cita
        </button>
      </div>

      <div className="pantalla__contenido">

        {/* Barra de búsqueda */}
        <div className="buscador">
          <span className="buscador__icono">🔍</span>
          <input
            type="text"
            className="buscador__input"
            placeholder="Buscar por mascota, propietario o síntoma..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar citas"
          />
          {busqueda && (
            <button
              className="buscador__limpiar"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tabs de filtro */}
        <div className="tabs" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`tab ${tabActiva === tab.id ? 'tab--activo' : ''}`}
              onClick={() => setTabActiva(tab.id)}
              role="tab"
              aria-selected={tabActiva === tab.id}
            >
              {tab.label}
              <span className="tab__contador">{contadorTab(tab.id)}</span>
            </button>
          ))}
        </div>

        {/* Resultado */}
        {citasFiltradas.length === 0 ? (
          <div className="estado-vacio">
            <span className="estado-vacio__icono">🔍</span>
            <h3 className="estado-vacio__titulo">Sin resultados</h3>
            <p className="estado-vacio__texto">
              {busqueda
                ? `No se encontraron citas para "${busqueda}".`
                : 'No hay citas en esta categoría todavía.'}
            </p>
            {!busqueda && (
              <button className="btn-primario" onClick={() => abrirModal()}>
                + Agregar cita
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="resultado-count">
              {citasFiltradas.length} {citasFiltradas.length === 1 ? 'cita encontrada' : 'citas encontradas'}
            </p>
            <div className="citas-grid">
              {citasFiltradas.map(cita => (
                <CitaCard key={cita.id} cita={cita} onEditar={abrirModal} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CitasView;
