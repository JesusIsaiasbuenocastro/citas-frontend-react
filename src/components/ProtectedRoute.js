import React from 'react';
import { useAuth } from '../context/AuthContext';

// ─── PROTECTED ROUTE ─────────────────────────────────────────────────────────
// Este componente es el "guardia" de las rutas privadas.
// Envuelve cualquier pantalla que requiera autenticación.
//
// Funciona así:
// - Si el usuario ESTÁ autenticado → muestra los children (la pantalla)
// - Si NO está autenticado → muestra el login
// - Mientras verifica la sesión → muestra una pantalla de carga
//
// En producción con react-router-dom sería:
//   if (!usuario) return <Navigate to="/login" replace />
//
// Aquí, sin router real, simplemente cambiamos qué renderizamos.
// El efecto para el usuario es idéntico.
//
// CONCEPTO: Este patrón se llama "Render Guard" o "Auth Gate".
// Es fundamental en cualquier app con áreas protegidas.

// ── Versión con control de roles ─────────────────────────────────────────────
// `rolesPermitidos` es opcional. Si se pasa, solo usuarios con ese rol
// pueden ver el contenido. Si no se pasa, cualquier usuario autenticado puede.
//
// Ejemplo de uso:
//   <ProtectedRoute>
//     <Dashboard />
//   </ProtectedRoute>
//
//   <ProtectedRoute rolesPermitidos={['admin']}>
//     <ConfiguracionSistema />
//   </ProtectedRoute>

const ProtectedRoute = ({ children, rolesPermitidos, fallbackLogin, fallbackCarga }) => {
  const { usuario, cargando, estaAutenticado } = useAuth();

  // Estado 1: Todavía verificando si hay sesión guardada en localStorage
  if (cargando) {
    return fallbackCarga || <PantallaCarga />;
  }

  // Estado 2: No hay sesión — mostrar el login
  if (!estaAutenticado) {
    return fallbackLogin;
  }

  // Estado 3: Hay sesión pero el rol no tiene permiso para esta pantalla
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <SinPermiso />;
  }

  // Estado 4: Todo bien — renderizar la pantalla protegida
  return children;
};

// ── Pantalla de carga ─────────────────────────────────────────────────────────
const PantallaCarga = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'var(--color-bg)',
    gap: '16px',
  }}>
    <div style={{
      width: '44px', height: '44px',
      background: '#16213e',
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '24px',
    }}>
      🐾
    </div>
    <p style={{ color: 'var(--color-texto-suave)', fontSize: '14px' }}>
      Cargando sesión...
    </p>
  </div>
);

// ── Sin permiso ───────────────────────────────────────────────────────────────
const SinPermiso = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '12px',
  }}>
    <span style={{ fontSize: '48px' }}>🔒</span>
    <h2 style={{ fontSize: '18px', fontWeight: 500 }}>Sin permiso</h2>
    <p style={{ color: 'var(--color-texto-suave)', fontSize: '14px' }}>
      Tu rol no tiene acceso a esta sección.
    </p>
  </div>
);

export default ProtectedRoute;
