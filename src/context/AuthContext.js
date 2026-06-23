import React, { createContext, useContext, useState, useEffect } from 'react';

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
// Este contexto maneja TODO lo relacionado con autenticación:
// - Estado del usuario actual (quién está logueado)
// - El token JWT (prueba de identidad que da el backend)
// - Las funciones login, logout, y verificación de sesión activa
//
// Separamos Auth de Citas en contextos distintos porque son
// responsabilidades diferentes. Auth es transversal (afecta toda la app),
// Citas es dominio de negocio. Esta separación se llama
// "Separation of Concerns".

// ─── TIPOS DE USUARIO ────────────────────────────────────────────────────────
// En una app real tendrías roles en el backend.
// Los definimos como constantes para no usar strings sueltos en el código.
export const ROLES = {
  ADMIN: 'admin',
  VETERINARIO: 'veterinario',
  RECEPCIONISTA: 'recepcionista',
};

// ─── USUARIOS DEMO ────────────────────────────────────────────────────────────
// En producción NUNCA tendrías contraseñas en el frontend.
// Esto existe SOLO para que el portafolio funcione sin backend.
// El comentario en el código mismo demuestra que entiendes la diferencia.
const USUARIOS_DEMO = [
  {
    id: 'u-001',
    nombre: 'Dr. Rodríguez',
    email: 'dr.rodriguez@vetcitas.mx',
    password: 'demo1234',      // ⚠️  Solo para demo — en prod el backend verifica esto
    rol: ROLES.VETERINARIO,
    iniciales: 'DR',
  },
  {
    id: 'u-002',
    nombre: 'Admin Sistema',
    email: 'admin@vetcitas.mx',
    password: 'admin1234',
    rol: ROLES.ADMIN,
    iniciales: 'AS',
  },
  {
    id: 'u-003',
    nombre: 'Laura Recepción',
    email: 'laura@vetcitas.mx',
    password: 'laura1234',
    rol: ROLES.RECEPCIONISTA,
    iniciales: 'LR',
  },
];

// ─── SIMULACIÓN DE JWT ────────────────────────────────────────────────────────
// Un JWT real viene del backend. Aquí simulamos su estructura.
//
// Estructura real de un JWT: header.payload.signature
// El payload contiene: userId, email, rol, exp (expiración en Unix timestamp)
const generarTokenFalso = (usuario) => {
  const payload = {
    sub: usuario.id,           // "subject" — el ID del usuario
    email: usuario.email,
    rol: usuario.rol,
    iat: Date.now(),           // "issued at" — cuándo se emitió
    exp: Date.now() + (8 * 60 * 60 * 1000), // expira en 8 horas
  };
  // En prod esto sería una firma HMAC del backend. Aquí solo codificamos en base64.
  return btoa(JSON.stringify(payload));
};

const decodificarToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};

const tokenEstaVigente = (token) => {
  const payload = decodificarToken(token);
  if (!payload) return false;
  return payload.exp > Date.now();
};

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado principal: el usuario autenticado (null = no hay sesión)
  const [usuario, setUsuario] = useState(null);
  // Estado de carga: mientras verificamos si hay sesión guardada
  const [cargando, setCargando] = useState(true);
  // Mensaje de error del último intento de login
  const [errorAuth, setErrorAuth] = useState('');

  // ── Al montar: revisar si ya hay sesión guardada ───────────────────────────
  // Esto permite que si el usuario cierra y abre el navegador,
  // no tenga que volver a loguearse (mientras el token no haya expirado).
  useEffect(() => {
    const token = localStorage.getItem('vetcitas_token');
    const usuarioGuardado = localStorage.getItem('vetcitas_usuario');

    if (token && usuarioGuardado && tokenEstaVigente(token)) {
      // Sesión válida: restauramos el usuario sin pedir login de nuevo
      setUsuario(JSON.parse(usuarioGuardado));
    } else {
      // Token expirado o no existe: limpiamos por si había datos viejos
      localStorage.removeItem('vetcitas_token');
      localStorage.removeItem('vetcitas_usuario');
    }

    // Terminamos de verificar — ya podemos renderizar la app
    setCargando(false);
  }, []);

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  // En producción: POST /api/auth/login → recibe { token, usuario }
  // Aquí: simulamos la respuesta del backend con un delay artificial
  const login = async (email, password) => {
    setErrorAuth('');

    // Simulamos latencia de red (300ms) para que el UX sea realista
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar usuario por email (esto lo haría el backend)
    const encontrado = USUARIOS_DEMO.find(u => u.email === email);

    if (!encontrado || encontrado.password !== password) {
      // En prod el backend devuelve 401 y el frontend muestra este mensaje
      const error = 'Correo o contraseña incorrectos';
      setErrorAuth(error);
      throw new Error(error);
    }

    // Credenciales correctas: generamos token y guardamos sesión
    const token = generarTokenFalso(encontrado);

    // Guardamos solo los datos NO sensibles del usuario
    // Nunca guardamos la contraseña en localStorage
    const datosUsuario = {
      id: encontrado.id,
      nombre: encontrado.nombre,
      email: encontrado.email,
      rol: encontrado.rol,
      iniciales: encontrado.iniciales,
    };

    localStorage.setItem('vetcitas_token', token);
    localStorage.setItem('vetcitas_usuario', JSON.stringify(datosUsuario));

    setUsuario(datosUsuario);
    return datosUsuario;
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  // En prod también harías POST /api/auth/logout para invalidar el token
  // en el servidor (blacklist). Aquí solo limpiamos el lado del cliente.
  const logout = () => {
    localStorage.removeItem('vetcitas_token');
    localStorage.removeItem('vetcitas_usuario');
    setUsuario(null);
  };

  // ── HELPERS DE AUTORIZACIÓN ───────────────────────────────────────────────
  // Funciones de conveniencia para verificar permisos por rol.
  // En el componente usas: const { esAdmin } = useAuth()
  const esAdmin = usuario?.rol === ROLES.ADMIN;
  const esVeterinario = usuario?.rol === ROLES.VETERINARIO;
  const estaAutenticado = Boolean(usuario);

  // ── OBTENER TOKEN para peticiones al backend ───────────────────────────────
  // Los componentes que hagan fetch al API lo usan así:
  //   const { getToken } = useAuth()
  //   fetch('/api/citas', { headers: { Authorization: `Bearer ${getToken()}` } })
  const getToken = () => localStorage.getItem('vetcitas_token');

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      errorAuth,
      estaAutenticado,
      esAdmin,
      esVeterinario,
      login,
      logout,
      getToken,
      setErrorAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado con validación de contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
