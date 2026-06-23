import React, { useState } from 'react';
import { useCitas } from '../context/CitasContext';

// ─── PROPIETARIOS VIEW ────────────────────────────────────────────────────────
// Esta pantalla no existe en el proyecto original.
// La construimos derivando datos de las citas ya existentes.
//
// Concepto importante: datos derivados vs datos almacenados.
// No guardamos "propietarios" como entidad separada — los derivamos
// del array de citas que ya tenemos. Esto evita redundancia de datos
// y se mantiene sincronizado automáticamente.

const PropietariosView = () => {
  const { citas } = useCitas();
  const [busqueda, setBusqueda] = useState('');

  // Derivar propietarios únicos con sus mascotas y estadísticas
  const propietarios = [...new Map(
    citas.map(c => [c.propietario, c.propietario])
  ).values()]
    .map(nombre => {
      const citasDePropietario = citas.filter(c => c.propietario === nombre);
      const mascotas = [...new Set(citasDePropietario.map(c => c.mascota))];
      const especies = [...new Set(citasDePropietario.map(c => c.especie))];
      return {
        nombre,
        mascotas,
        especies,
        totalCitas: citasDePropietario.length,
        pendientes: citasDePropietario.filter(c => c.status === 'pendiente').length,
        urgentes: citasDePropietario.filter(c => c.status === 'urgente').length,
        ultimaCita: citasDePropietario
          .sort((a, b) => b.fecha.localeCompare(a.fecha))[0]?.fecha,
      };
    })
    .filter(p =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.mascotas.some(m => m.toLowerCase().includes(busqueda.toLowerCase()))
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Iniciales del avatar a partir del nombre
  const iniciales = (nombre) => {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  const emojiEspecie = { perro: '🐶', gato: '🐱', ave: '🦜', conejo: '🐰', pez: '🐠', otro: '🐾' };

  return (
    <div className="pantalla">
      <div className="topbar">
        <div className="topbar__titulo">
          <span className="topbar__icono">👥</span>
          Propietarios
        </div>
      </div>

      <div className="pantalla__contenido">
        <div className="buscador">
          <span className="buscador__icono">🔍</span>
          <input
            type="text"
            className="buscador__input"
            placeholder="Buscar propietario o mascota..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="buscador__limpiar" onClick={() => setBusqueda('')}>✕</button>
          )}
        </div>

        <p className="resultado-count">{propietarios.length} propietarios registrados</p>

        {propietarios.length === 0 ? (
          <div className="estado-vacio">
            <span className="estado-vacio__icono">👥</span>
            <h3 className="estado-vacio__titulo">Sin propietarios</h3>
            <p className="estado-vacio__texto">
              Los propietarios aparecen aquí automáticamente al crear citas.
            </p>
          </div>
        ) : (
          <div className="propietarios-grid">
            {propietarios.map(p => (
              <div key={p.nombre} className="propietario-card">
                {/* Encabezado con avatar */}
                <div className="propietario-card__header">
                  <div className="propietario-avatar">{iniciales(p.nombre)}</div>
                  <div className="propietario-info">
                    <span className="propietario-nombre">{p.nombre}</span>
                    <span className="propietario-sub">
                      {p.mascotas.length} {p.mascotas.length === 1 ? 'mascota' : 'mascotas'}
                    </span>
                  </div>
                  {p.urgentes > 0 && (
                    <span className="status-chip chip--urgente">🚨 Urgente</span>
                  )}
                </div>

                {/* Mascotas */}
                <div className="propietario-mascotas">
                  {p.mascotas.map((mascota, i) => (
                    <span key={mascota} className="mascota-tag">
                      {emojiEspecie[p.especies[i]] || '🐾'} {mascota}
                    </span>
                  ))}
                </div>

                {/* Estadísticas */}
                <div className="propietario-stats">
                  <div className="propietario-stat">
                    <span className="propietario-stat__num">{p.totalCitas}</span>
                    <span className="propietario-stat__label">citas totales</span>
                  </div>
                  <div className="propietario-stat">
                    <span className="propietario-stat__num">{p.pendientes}</span>
                    <span className="propietario-stat__label">pendientes</span>
                  </div>
                  <div className="propietario-stat">
                    <span className="propietario-stat__label" style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                      Última cita: {p.ultimaCita || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropietariosView;
