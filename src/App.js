import React, { useState } from 'react';
import { CitasProvider } from './context/CitasContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CitasView from './components/CitasView';
import PropietariosView from './components/PropietariosView';
import EstadisticasView from './components/EstadisticasView';
import ModalCita from './components/ModalCita';
import './index.css';

// App es el componente raíz. Su única responsabilidad es:
// 1) Proveer el contexto global de citas (CitasProvider)
// 2) Controlar qué pantalla se muestra (pantalla activa)
// 3) Controlar si el modal de nueva cita está abierto
// No contiene lógica de negocio: eso vive en el contexto.

function App() {
  const [pantallaActiva, setPantallaActiva] = useState('dashboard');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState(null);

  // Abre el modal: si recibe una cita, entra en modo edición
  const abrirModal = (cita = null) => {
    setCitaEditando(cita);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setCitaEditando(null);
  };

  // Renderiza la pantalla correspondiente al ítem del sidebar activo
  const renderPantalla = () => {
    switch (pantallaActiva) {
      case 'dashboard':
        return <Dashboard abrirModal={abrirModal} />;
      case 'citas':
        return <CitasView abrirModal={abrirModal} />;
      case 'propietarios':
        return <PropietariosView />;
      case 'estadisticas':
        return <EstadisticasView />;
      default:
        return <Dashboard abrirModal={abrirModal} />;
    }
  };

  return (
    <CitasProvider>
      <div className="app-shell">
        <Sidebar
          pantallaActiva={pantallaActiva}
          setPantallaActiva={setPantallaActiva}
        />
        <main className="main-content">
          {renderPantalla()}
        </main>
      </div>

      {/* El modal vive fuera del main para no quedar atrapado en el scroll */}
      {modalAbierto && (
        <ModalCita
          citaEditando={citaEditando}
          cerrarModal={cerrarModal}
        />
      )}
    </CitasProvider>
  );
}

export default App;
