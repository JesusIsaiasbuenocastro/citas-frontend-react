# VetCitas 🐾

Administrador de citas veterinarias — rediseñado con arquitectura moderna en React. Diseño generado por IA

---

## Estructura del proyecto

```
src/
├── App.js                    # Componente raíz: routing y control del modal
├── index.js                  # Punto de entrada
├── index.css                 # Sistema de diseño (design tokens + componentes)
│
├── context/
│   └── CitasContext.js       # Estado global: useReducer + Context API
│
└── components/
    ├── Sidebar.js            # Navegación lateral con badges dinámicos
    ├── Dashboard.js          # Pantalla principal: stats + citas de hoy
    ├── CitasView.js          # Listado completo con búsqueda y filtros
    ├── PropietariosView.js   # Propietarios derivados de las citas
    ├── EstadisticasView.js   # Gráficos CSS: por día y por especie
    ├── CitaCard.js           # Tarjeta reutilizable de una cita
    └── ModalCita.js          # Formulario modal: crear y editar
```

---

## Conceptos implementados

### Context API + useReducer
En lugar de `useState` simple en App.js, el estado global vive en `CitasContext`.
Cada modificación se hace a través de acciones tipadas (AGREGAR_CITA, EDITAR_CITA, etc.),
el mismo patrón de Redux sin dependencias externas.

### Datos derivados vs almacenados
La vista de Propietarios no almacena datos propios: los deriva del array de citas.
Esto evita inconsistencias y es una decisión de arquitectura de datos.

### Componentes controlados
Todos los formularios son "controlled components": React controla el valor
de cada input a través del estado, no el DOM.

### Separación de responsabilidades
- **CitaCard**: solo muestra una cita y delega acciones al contexto.
- **ModalCita**: solo maneja el formulario; llama al contexto para persistir.
- **Dashboard**: solo consume datos y los presenta; no tiene lógica propia.

### Persistencia con localStorage
El `useEffect` en CitasContext sincroniza el estado con `localStorage`
cada vez que cambia el array de citas.

---

## Instalación

```bash
npm install
npm start
```

---

## Pantallas

| Pantalla | Ruta lógica | Descripción |
|---|---|---|
| Dashboard | `/` | Stats del día + citas de hoy + próximas |
| Citas | `citas` | Listado completo con búsqueda y tabs |
| Propietarios | `propietarios` | Dueños derivados automáticamente |
| Estadísticas | `estadisticas` | Gráficos de barras CSS sin librerías externas |
