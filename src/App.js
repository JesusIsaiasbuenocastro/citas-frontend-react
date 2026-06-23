import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CitasProvider } from './context/CitasContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CitasView from './components/CitasView';
import PropietariosView from './components/PropietariosView';
import EstadisticasView from './components/EstadisticasView';
import ModalCita from './components/ModalCita';
import './index.css';

// ─── APP ──────────────────────────────────────────────────────────────────────
// Componente raíz. Ahora tiene dos capas de providers:
//
// 1. AuthProvider (exterior): siempre activo, maneja si hay sesión o no
// 2. CitasProvider (interior): solo activo cuando hay sesión
//
// El orden importa. CitasProvider está adentro porque los datos de citas
// solo tienen sentido cuando hay un usuario autenticado.
// Si el usuario hace logout, CitasProvider se desmonta y su estado se limpia.
//
// Árbol de componentes:
//   AuthProvider
//     └── ProtectedRoute
//           ├── Si NO autenticado → LoginPage
//           └── Si SÍ autenticado → CitasProvider
//                                     └── AppShell (sidebar + pantallas + modal)

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute
        fallbackLogin={<LoginPage />}
      >
        {/* CitasProvider solo vive aquí adentro — si el usuario hace logout,
            este árbol se desmonta y las citas en memoria se limpian */}
        <CitasProvider>
          <AppShell />
        </CitasProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
// Separamos el "shell" (estructura de la app autenticada) en su propio
// componente para mantener App() limpio. AppShell solo se monta cuando
// hay sesión activa.
function AppShell() {
  const [pantallaActiva, setPantallaActiva] = useState('dashboard');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  const abrirModal = (cita = null) => {
    setCitaEditando(cita);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCitaEditando(null);
  };

  const renderPantalla = () => {
    switch (pantallaActiva) {
      case 'dashboard':     return <Dashboard abrirModal={abrirModal} />;
      case 'citas':         return <CitasView abrirModal={abrirModal} />;
      case 'propietarios':  return <PropietariosView />;
      case 'estadisticas':  return <EstadisticasView />;
      default:              return <Dashboard abrirModal={abrirModal} />;
    }
  };

  return (
    <>
      <div className="app-shell">
        <Sidebar
          pantallaActiva={pantallaActiva}
          setPantallaActiva={setPantallaActiva}
        />
        <main className="main-content">
          {renderPantalla()}
        </main>
      </div>

      {modalAbierto && (
        <ModalCita
          citaEditando={citaEditando}
          cerrarModal={cerrarModal}
        />
      )}
    </>
  );
}

export default App;
