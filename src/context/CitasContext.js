import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// ─── CONTEXTO ────────────────────────────────────────────────────────────────
// Usamos Context API + useReducer en lugar de useState simple.
// Beneficio: el estado global es predecible y fácil de escalar.
// Cada acción tiene un tipo, un payload, y transforma el estado de forma limpia.
// Esto es el mismo patrón que Redux, pero sin dependencias externas.

const CitasContext = createContext();

// ─── REDUCER ─────────────────────────────────────────────────────────────────
// Un reducer es una función pura: recibe el estado actual + una acción,
// y devuelve el nuevo estado. Nunca muta el estado original.
const citasReducer = (state, action) => {
  switch (action.type) {
    case 'AGREGAR_CITA':
      return {
        ...state,
        citas: [...state.citas, { ...action.payload, id: uuidv4(), status: 'pendiente' }]
      };

    case 'EDITAR_CITA':
      return {
        ...state,
        citas: state.citas.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload } : c
        )
      };

    case 'ELIMINAR_CITA':
      return {
        ...state,
        citas: state.citas.filter(c => c.id !== action.payload)
      };

    case 'CAMBIAR_STATUS':
      // Ciclo de estados: pendiente → completada → pendiente
      const nuevoStatus = action.payload.status === 'pendiente' ? 'completada' : 'pendiente';
      return {
        ...state,
        citas: state.citas.map(c =>
          c.id === action.payload.id ? { ...c, status: nuevoStatus } : c
        )
      };

    case 'SET_BUSQUEDA':
      return { ...state, busqueda: action.payload };

    default:
      return state;
  }
};

// ─── ESTADO INICIAL ──────────────────────────────────────────────────────────
const obtenerCitasIniciales = () => {
  try {
    const guardadas = localStorage.getItem('vetcitas');
    return guardadas ? JSON.parse(guardadas) : citasDemostracion;
  } catch {
    return citasDemostracion;
  }
};

// Citas de demostración para que el portafolio no aparezca vacío
const citasDemostracion = [
  {
    id: 'demo-1',
    mascota: 'Rocky',
    propietario: 'Carlos Ramírez',
    fecha: new Date().toISOString().split('T')[0],
    hora: '10:30',
    sintomas: 'Cansancio excesivo y falta de apetito desde hace 2 días.',
    status: 'pendiente',
    especie: 'perro'
  },
  {
    id: 'demo-2',
    mascota: 'Luna',
    propietario: 'María González',
    fecha: new Date().toISOString().split('T')[0],
    hora: '11:00',
    sintomas: 'Vómitos frecuentes después de comer.',
    status: 'urgente',
    especie: 'gato'
  },
  {
    id: 'demo-3',
    mascota: 'Piolín',
    propietario: 'Ana Torres',
    fecha: new Date().toISOString().split('T')[0],
    hora: '12:15',
    sintomas: 'Control de vacunación anual.',
    status: 'completada',
    especie: 'ave'
  },
  {
    id: 'demo-4',
    mascota: 'Max',
    propietario: 'Pedro Sánchez',
    fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    hora: '09:00',
    sintomas: 'Revisión post-operatoria de rodilla.',
    status: 'pendiente',
    especie: 'perro'
  },
];

// ─── PROVIDER ────────────────────────────────────────────────────────────────
// El Provider envuelve toda la app y expone el estado + las funciones dispatch
// a cualquier componente hijo sin necesidad de prop drilling.
export const CitasProvider = ({ children }) => {
  const estadoInicial = {
    citas: obtenerCitasIniciales(),
    busqueda: ''
  };

  const [state, dispatch] = useReducer(citasReducer, estadoInicial);

  // Persistencia automática en localStorage cada vez que cambian las citas
  useEffect(() => {
    localStorage.setItem('vetcitas', JSON.stringify(state.citas));
  }, [state.citas]);

  // ─── ACCIONES (API pública del contexto) ──────────────────────────────────
  // Exponemos funciones nombradas en lugar del dispatch crudo.
  // Así los componentes no necesitan saber cómo funciona el reducer.
  const agregarCita = (cita) => dispatch({ type: 'AGREGAR_CITA', payload: cita });
  const editarCita = (cita) => dispatch({ type: 'EDITAR_CITA', payload: cita });
  const eliminarCita = (id) => dispatch({ type: 'ELIMINAR_CITA', payload: id });
  const cambiarStatus = (id, status) => dispatch({ type: 'CAMBIAR_STATUS', payload: { id, status } });
  const setBusqueda = (texto) => dispatch({ type: 'SET_BUSQUEDA', payload: texto });

  // ─── DATOS DERIVADOS ──────────────────────────────────────────────────────
  // Calculamos datos útiles una sola vez aquí en lugar de en cada componente.
  const hoy = new Date().toISOString().split('T')[0];
  const citasHoy = state.citas.filter(c => c.fecha === hoy);
  const citasPendientes = state.citas.filter(c => c.status === 'pendiente');
  const citasUrgentes = state.citas.filter(c => c.status === 'urgente');
  const citasCompletadas = state.citas.filter(c => c.status === 'completada');

  // Filtro de búsqueda aplicado a mascota, propietario y síntomas
  const citasFiltradas = state.citas.filter(c => {
    const q = state.busqueda.toLowerCase();
    return (
      c.mascota.toLowerCase().includes(q) ||
      c.propietario.toLowerCase().includes(q) ||
      c.sintomas.toLowerCase().includes(q)
    );
  });

  // Lista única de propietarios derivada de las citas
  const propietarios = [...new Map(
    state.citas.map(c => [c.propietario, { nombre: c.propietario, mascotas: [] }])
  ).values()].map(p => ({
    ...p,
    mascotas: state.citas.filter(c => c.propietario === p.nombre).map(c => c.mascota)
  }));

  return (
    <CitasContext.Provider value={{
      citas: state.citas,
      busqueda: state.busqueda,
      citasFiltradas,
      citasHoy,
      citasPendientes,
      citasUrgentes,
      citasCompletadas,
      propietarios,
      agregarCita,
      editarCita,
      eliminarCita,
      cambiarStatus,
      setBusqueda,
    }}>
      {children}
    </CitasContext.Provider>
  );
};

// Hook personalizado para consumir el contexto con validación incluida
export const useCitas = () => {
  const context = useContext(CitasContext);
  if (!context) throw new Error('useCitas debe usarse dentro de CitasProvider');
  return context;
};
