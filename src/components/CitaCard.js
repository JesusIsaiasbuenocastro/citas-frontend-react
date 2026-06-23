import React from 'react';
import { useCitas } from '../context/CitasContext';

// ─── CITA CARD ────────────────────────────────────────────────────────────────
// Componente reutilizable que representa UNA cita en forma de tarjeta o fila.
// Recibe la cita como prop y las funciones de acción vienen del contexto.
// Principio: un componente = una responsabilidad.

// Mapeo de emojis por especie (valor por defecto: perro)
const emojiEspecie = {
  perro: '🐶',
  gato: '🐱',
  ave: '🦜',
  conejo: '🐰',
  pez: '🐠',
  otro: '🐾',
};

// Mapeo de estilos por status
const estilosStatus = {
  pendiente: { clase: 'chip--pendiente', label: 'Pendiente' },
  completada: { clase: 'chip--completada', label: 'Completada' },
  urgente: { clase: 'chip--urgente', label: 'Urgente' },
};

const CitaCard = ({ cita, onEditar }) => {
  const { eliminarCita, cambiarStatus } = useCitas();
  const emoji = emojiEspecie[cita.especie] || '🐾';
  const { clase: claseStatus, label: labelStatus } = estilosStatus[cita.status] || estilosStatus.pendiente;

  // Formatea hora de "10:30" a "10:30 AM/PM" de forma legible
  const formatearHora = (hora) => {
    if (!hora) return '';
    const [h, m] = hora.split(':');
    const hNum = parseInt(h);
    const sufijo = hNum >= 12 ? 'PM' : 'AM';
    const hora12 = hNum % 12 || 12;
    return `${hora12}:${m} ${sufijo}`;
  };

  const handleEliminar = () => {
    // Confirmación simple antes de eliminar — UX importante para portafolio
    if (window.confirm(`¿Eliminar la cita de ${cita.mascota}?`)) {
      eliminarCita(cita.id);
    }
  };

  return (
    <div className={`cita-card ${cita.status === 'urgente' ? 'cita-card--urgente' : ''}`}>
      {/* Encabezado de la tarjeta */}
      <div className="cita-card__header">
        <div className="cita-card__avatar">{emoji}</div>
        <div className="cita-card__info">
          <span className="cita-card__mascota">{cita.mascota}</span>
          <span className="cita-card__propietario">Dueño: {cita.propietario}</span>
        </div>
        <span className={`status-chip ${claseStatus}`}>{labelStatus}</span>
      </div>

      {/* Metadatos: fecha y hora */}
      <div className="cita-card__meta">
        <span className="meta-item">📅 {cita.fecha}</span>
        <span className="meta-item">🕐 {formatearHora(cita.hora)}</span>
      </div>

      {/* Síntomas */}
      <p className="cita-card__sintomas">{cita.sintomas}</p>

      {/* Acciones */}
      <div className="cita-card__acciones">
        <button
          className="btn-accion btn-accion--completar"
          onClick={() => cambiarStatus(cita.id, cita.status)}
          title={cita.status === 'completada' ? 'Marcar pendiente' : 'Marcar completada'}
        >
          {cita.status === 'completada' ? '↩ Reabrir' : '✓ Completar'}
        </button>
        <button
          className="btn-accion btn-accion--editar"
          onClick={() => onEditar(cita)}
          title="Editar cita"
        >
          ✏️ Editar
        </button>
        <button
          className="btn-accion btn-accion--eliminar"
          onClick={handleEliminar}
          title="Eliminar cita"
        >
          🗑 Eliminar
        </button>
      </div>
    </div>
  );
};

export default CitaCard;
