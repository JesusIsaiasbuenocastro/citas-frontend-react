import React, { useState, useEffect } from 'react';
import { useCitas } from '../context/CitasContext';

// ─── MODAL CITA ──────────────────────────────────────────────────────────────
// Componente modal que sirve para CREAR y EDITAR citas.
// Si recibe `citaEditando`, pre-llena el formulario con esos datos.
// Si no, trabaja en modo creación con campos vacíos.
//
// Patrón importante: "formulario controlado"
// Cada input tiene su value vinculado al estado local y un onChange
// que actualiza ese estado. React controla el DOM, no al revés.

const estadoVacio = {
  mascota: '',
  propietario: '',
  fecha: '',
  hora: '',
  sintomas: '',
  especie: 'perro',
  status: 'pendiente',
};

const ModalCita = ({ citaEditando, cerrarModal }) => {
  const { agregarCita, editarCita } = useCitas();
  const [formulario, setFormulario] = useState(estadoVacio);
  const [errores, setErrores] = useState({});
  const modoEdicion = Boolean(citaEditando);

  // Si estamos editando, cargamos los datos de la cita al montar el modal
  useEffect(() => {
    if (citaEditando) {
      setFormulario(citaEditando);
    }
  }, [citaEditando]);

  // Manejador genérico para todos los inputs
  // Usa [e.target.name] (computed property) para actualizar el campo correcto
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
    // Limpia el error del campo cuando el usuario empieza a corregirlo
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validación: retorna un objeto con los errores encontrados
  const validar = () => {
    const nuevosErrores = {};
    if (!formulario.mascota.trim()) nuevosErrores.mascota = 'El nombre de la mascota es requerido';
    if (!formulario.propietario.trim()) nuevosErrores.propietario = 'El nombre del dueño es requerido';
    if (!formulario.fecha) nuevosErrores.fecha = 'La fecha es requerida';
    if (!formulario.hora) nuevosErrores.hora = 'La hora es requerida';
    if (!formulario.sintomas.trim()) nuevosErrores.sintomas = 'Describe el motivo de la consulta';
    return nuevosErrores;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const erroresEncontrados = validar();
    if (Object.keys(erroresEncontrados).length > 0) {
      setErrores(erroresEncontrados);
      return;
    }

    if (modoEdicion) {
      editarCita(formulario);
    } else {
      agregarCita(formulario);
    }
    cerrarModal();
  };

  // Cierra el modal si el usuario hace click en el fondo oscuro
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) cerrarModal();
  };

  // Accesibilidad: cierra con Escape
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') cerrarModal(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [cerrarModal]);

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="modal">
        <div className="modal__header">
          <h2 id="modal-titulo" className="modal__titulo">
            {modoEdicion ? '✏️ Editar cita' : '📅 Nueva cita'}
          </h2>
          <button
            className="modal__cerrar"
            onClick={cerrarModal}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* Fila: mascota + especie */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="mascota" className="form-label">Nombre de la mascota</label>
              <input
                id="mascota"
                type="text"
                name="mascota"
                className={`form-input ${errores.mascota ? 'form-input--error' : ''}`}
                placeholder="ej. Rocky"
                value={formulario.mascota}
                onChange={handleChange}
              />
              {errores.mascota && <span className="form-error">{errores.mascota}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="especie" className="form-label">Especie</label>
              <select
                id="especie"
                name="especie"
                className="form-input"
                value={formulario.especie}
                onChange={handleChange}
              >
                <option value="perro">🐶 Perro</option>
                <option value="gato">🐱 Gato</option>
                <option value="ave">🦜 Ave</option>
                <option value="conejo">🐰 Conejo</option>
                <option value="pez">🐠 Pez</option>
                <option value="otro">🐾 Otro</option>
              </select>
            </div>
          </div>

          {/* Propietario */}
          <div className="form-field">
            <label htmlFor="propietario" className="form-label">Nombre del propietario</label>
            <input
              id="propietario"
              type="text"
              name="propietario"
              className={`form-input ${errores.propietario ? 'form-input--error' : ''}`}
              placeholder="Nombre completo del dueño"
              value={formulario.propietario}
              onChange={handleChange}
            />
            {errores.propietario && <span className="form-error">{errores.propietario}</span>}
          </div>

          {/* Fila: fecha + hora */}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="fecha" className="form-label">Fecha</label>
              <input
                id="fecha"
                type="date"
                name="fecha"
                className={`form-input ${errores.fecha ? 'form-input--error' : ''}`}
                value={formulario.fecha}
                onChange={handleChange}
              />
              {errores.fecha && <span className="form-error">{errores.fecha}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="hora" className="form-label">Hora</label>
              <input
                id="hora"
                type="time"
                name="hora"
                className={`form-input ${errores.hora ? 'form-input--error' : ''}`}
                value={formulario.hora}
                onChange={handleChange}
              />
              {errores.hora && <span className="form-error">{errores.hora}</span>}
            </div>
          </div>

          {/* Status (solo en modo edición) */}
          {modoEdicion && (
            <div className="form-field">
              <label htmlFor="status" className="form-label">Estado de la cita</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formulario.status}
                onChange={handleChange}
              >
                <option value="pendiente">Pendiente</option>
                <option value="urgente">Urgente</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          )}

          {/* Síntomas */}
          <div className="form-field">
            <label htmlFor="sintomas" className="form-label">Síntomas / motivo de consulta</label>
            <textarea
              id="sintomas"
              name="sintomas"
              className={`form-input form-textarea ${errores.sintomas ? 'form-input--error' : ''}`}
              placeholder="Describe brevemente los síntomas o el motivo de la consulta..."
              value={formulario.sintomas}
              onChange={handleChange}
              rows={3}
            />
            {errores.sintomas && <span className="form-error">{errores.sintomas}</span>}
          </div>

          {/* Botones de acción */}
          <div className="modal__footer">
            <button type="button" className="btn-secundario" onClick={cerrarModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario">
              {modoEdicion ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCita;
