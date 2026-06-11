import React from 'react';
import { useCitas } from '../context/CitasContext';

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
// Componente de navegación lateral. Recibe dos props:
// - pantallaActiva: string que indica qué ítem está seleccionado
// - setPantallaActiva: función para cambiar la pantalla
//
// El sidebar NO tiene estado propio. Es un componente "controlado":
// su comportamiento depende completamente de las props que recibe.

const navItems = [
  {
    seccion: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
      { id: 'citas', label: 'Citas', icon: '📅' },
      { id: 'propietarios', label: 'Propietarios', icon: '👥' },
    ]
  },
  {
    seccion: 'Análisis',
    items: [
      { id: 'estadisticas', label: 'Estadísticas', icon: '📊' },
    ]
  }
];

const Sidebar = ({ pantallaActiva, setPantallaActiva }) => {
  const { citasPendientes, citasUrgentes } = useCitas();

  // Badge dinámico: muestra el número de citas urgentes o pendientes por ítem
  const getBadge = (id) => {
    if (id === 'citas') return citasPendientes.length + citasUrgentes.length;
    if (id === 'dashboard') return citasUrgentes.length || null;
    return null;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🐾</div>
        <div>
          <span className="logo-nombre">VetCitas</span>
          <small className="logo-sub">Panel de control</small>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ seccion, items }) => (
          <div key={seccion} className="nav-section">
            <span className="nav-label">{seccion}</span>
            {items.map(item => {
              const badge = getBadge(item.id);
              const activo = pantallaActiva === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${activo ? 'nav-item--activo' : ''}`}
                  onClick={() => setPantallaActiva(item.id)}
                  aria-current={activo ? 'page' : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {badge > 0 && (
                    <span className="nav-badge" aria-label={`${badge} pendientes`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-user">
          <div className="avatar-iniciales">DR</div>
          <div>
            <div className="footer-nombre">Dr. Rodríguez</div>
            <div className="footer-rol">Veterinario</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
