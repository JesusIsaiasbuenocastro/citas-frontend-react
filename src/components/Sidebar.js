import React from 'react';
import { useCitas } from '../context/CitasContext';
import { useAuth, ROLES } from '../context/AuthContext';

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
// Ahora el sidebar también consume el AuthContext para:
// 1. Mostrar el nombre e iniciales del usuario real (no hardcodeado)
// 2. Mostrar el botón de Logout
// 3. Ocultar ítems según el rol del usuario
//
// Concepto: Authorization por rol en el frontend.
// No mostramos la pantalla de Configuración a un recepcionista,
// aunque intentar navegar directamente tampoco debería funcionar
// (el ProtectedRoute con rolesPermitidos lo bloquea también).
// Doble capa de seguridad: UI + guards de ruta.

const todosLosNavItems = [
  {
    seccion: 'Principal',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '⊞', roles: null },
      { id: 'citas', label: 'Citas', icon: '📅', roles: null },
      { id: 'propietarios', label: 'Propietarios', icon: '👥', roles: null },
    ]
  },
  {
    seccion: 'Análisis',
    items: [
      { id: 'estadisticas', label: 'Estadísticas', icon: '📊', roles: [ROLES.ADMIN, ROLES.VETERINARIO] },
    ]
  }
];

const Sidebar = ({ pantallaActiva, setPantallaActiva }) => {
  const { citasPendientes, citasUrgentes } = useCitas();
  const { usuario, logout } = useAuth();

  const getBadge = (id) => {
    if (id === 'citas') return citasPendientes.length + citasUrgentes.length;
    if (id === 'dashboard') return citasUrgentes.length || null;
    return null;
  };

  // Filtra ítems que el rol actual puede ver
  // roles: null → cualquier usuario; roles: [...] → solo esos roles
  const puedeVer = (item) =>
    !item.roles || item.roles.includes(usuario?.rol);

  const etiquetaRol = {
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.VETERINARIO]: 'Veterinario',
    [ROLES.RECEPCIONISTA]: 'Recepcionista',
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
        {todosLosNavItems.map(({ seccion, items }) => {
          const itemsVisibles = items.filter(puedeVer);
          if (itemsVisibles.length === 0) return null;
          return (
            <div key={seccion} className="nav-section">
              <span className="nav-label">{seccion}</span>
              {itemsVisibles.map(item => {
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
          );
        })}
      </nav>

      {/* Footer: usuario real + logout */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-user">
          <div className="avatar-iniciales">{usuario?.iniciales || '?'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="footer-nombre">{usuario?.nombre || 'Usuario'}</div>
            <div className="footer-rol">{etiquetaRol[usuario?.rol] || usuario?.rol}</div>
          </div>
          <button
            className="logout-btn"
            onClick={logout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            ⏻
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
