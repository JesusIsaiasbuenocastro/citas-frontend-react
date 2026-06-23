import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
// Pantalla de inicio de sesión. Sus responsabilidades son:
// 1. Mostrar el formulario con validación local (antes de llamar al servidor)
// 2. Llamar a login() del AuthContext cuando el formulario es válido
// 3. Mostrar el error que devuelve el contexto si las credenciales fallan
//
// NO maneja la lógica de autenticación — eso es trabajo del contexto.
// Este componente solo es la "vista" del flujo de auth.

// Cuentas demo visibles para quien visite el portafolio
const CUENTAS_DEMO = [
  { label: 'Veterinario', email: 'dr.rodriguez@vetcitas.mx', password: 'demo1234', color: '#7F77DD' },
  { label: 'Admin', email: 'admin@vetcitas.mx', password: 'admin1234', color: '#1D9E75' },
  { label: 'Recepcionista', email: 'laura@vetcitas.mx', password: 'laura1234', color: '#EF9F27' },
];

const LoginPage = () => {
  const { login, errorAuth, setErrorAuth } = useAuth();

  // Estado local del formulario — no va al contexto global
  // porque solo existe mientras el usuario está en esta pantalla
  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Limpia el error del campo cuando el usuario empieza a escribir
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    if (errorAuth) setErrorAuth('');
  };

  // Validación local: verifica formato antes de hacer la petición
  const validar = () => {
    const nuevos = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) nuevos.email = 'El correo es requerido';
    else if (!emailRegex.test(form.email)) nuevos.email = 'Ingresa un correo válido';
    if (!form.password) nuevos.password = 'La contraseña es requerida';
    else if (form.password.length < 6) nuevos.password = 'Mínimo 6 caracteres';
    return nuevos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroresLocales = validar();
    if (Object.keys(erroresLocales).length > 0) {
      setErrores(erroresLocales);
      return;
    }

    setCargando(true);
    try {
      await login(form.email, form.password);
      // Si login() no lanza error, el AuthContext actualiza `usuario`
      // y el ProtectedRoute en App.js redirige automáticamente al dashboard
    } catch {
      // El error ya quedó en errorAuth del contexto — solo dejamos de cargar
    } finally {
      setCargando(false);
    }
  };

  // Rellena el formulario con una cuenta demo con un clic
  const usarDemo = (cuenta) => {
    setForm({ email: cuenta.email, password: cuenta.password });
    setErrores({});
    setErrorAuth('');
  };

  return (
    <div className="login-page">
      <div className="login-contenedor">

        {/* ── Panel izquierdo: formulario ── */}
        <div className="login-panel">

          <div className="login-brand">
            <div className="login-logo">🐾</div>
            <div>
              <span className="login-app-name">VetCitas</span>
              <small className="login-app-sub">Panel de control</small>
            </div>
          </div>

          <h1 className="login-titulo">Bienvenido de vuelta</h1>
          <p className="login-subtitulo">Ingresa tus credenciales para acceder al panel.</p>

          {/* Error global (credenciales incorrectas) */}
          {errorAuth && (
            <div className="login-error-banner" role="alert">
              <span>⚠</span> {errorAuth}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="login-campo">
              <label htmlFor="email" className="login-label">Correo electrónico</label>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`login-input ${errores.email ? 'login-input--error' : ''}`}
                  placeholder="dr.rodriguez@vetcitas.mx"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={cargando}
                />
              </div>
              {errores.email && <span className="login-campo-error">{errores.email}</span>}
            </div>

            <div className="login-campo">
              <div className="login-label-row">
                <label htmlFor="password" className="login-label">Contraseña</label>
                <button type="button" className="login-forgot">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">🔒</span>
                <input
                  id="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  name="password"
                  className={`login-input ${errores.password ? 'login-input--error' : ''}`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={cargando}
                />
                <button
                  type="button"
                  className="login-toggle-pw"
                  onClick={() => setMostrarPassword(v => !v)}
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? '🙈' : '👁'}
                </button>
              </div>
              {errores.password && <span className="login-campo-error">{errores.password}</span>}
            </div>

            <button
              type="submit"
              className="login-btn-submit"
              disabled={cargando}
            >
              {cargando ? 'Verificando...' : 'Iniciar sesión'}
            </button>

          </form>

          {/* ── Cuentas demo ── */}
          <div className="login-divider"><span>acceso demo</span></div>
          <div className="login-demos">
            {CUENTAS_DEMO.map(cuenta => (
              <button
                key={cuenta.email}
                className="login-demo-btn"
                onClick={() => usarDemo(cuenta)}
                type="button"
                style={{ '--demo-color': cuenta.color }}
              >
                <span
                  className="demo-dot"
                  style={{ background: cuenta.color }}
                />
                {cuenta.label}
              </button>
            ))}
          </div>
          <p className="login-demo-hint">
            Selecciona un rol, luego haz clic en "Iniciar sesión"
          </p>

        </div>

        {/* ── Panel derecho: decorativo ── */}
        <div className="login-side">
          <div className="login-side-contenido">
            <blockquote className="login-quote">
              "Gestiona cada consulta con claridad, sin papeles."
            </blockquote>
            <div className="login-features">
              {[
                { icon: '📅', titulo: 'Citas organizadas', desc: 'Vista diaria con filtros por estado y especie' },
                { icon: '📊', titulo: 'Estadísticas claras', desc: 'Actividad semanal y distribución de pacientes' },
                { icon: '👥', titulo: 'Roles de usuario', desc: 'Admin, veterinario y recepcionista con permisos distintos' },
              ].map(f => (
                <div key={f.titulo} className="login-feature">
                  <div className="login-feature-icon">{f.icon}</div>
                  <div>
                    <div className="login-feature-titulo">{f.titulo}</div>
                    <div className="login-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
