# 📋 Drag Drop Tasks

Una aplicación completa de gestión de tareas y administración de usuarios con funcionalidad de arrastrar y soltar, construida con Angular 20 y diseñada con Tailwind CSS. Incluye sistema de autenticación, gestión de usuarios, calendario y configuración de perfil.

## ✨ Características

### 🎯 Gestión de Tareas
- Crea, edita y elimina tareas fácilmente
- Sistema de prioridades (Baja, Media, Alta, Urgente)
- Drag & Drop intuitivo entre listas
- 🔍 **Búsqueda Avanzada**: Filtros por estado, prioridad, asignado y texto
- Persistencia automática en localStorage

### 👥 Sistema de Autenticación y Usuarios
- 🔐 **Login/Registro**: Autenticación completa con JWT
- 👤 **Gestión de Perfiles**: Actualización de información personal y foto de perfil
- 📧 **Verificación de Email**: Sistema de verificación con códigos
- 🔒 **Control de Acceso**: Roles y permisos basados en sistema RBAC
- 👥 **Administración de Usuarios**: CRUD completo de usuarios (solo administradores)

### 📅 Calendario
- Visualización de tareas en calendario
- Integración con sistema de tareas
- Vista mensual con eventos

### 🎨 Interfaz y Experiencia
- 🌙 **Modo Oscuro/Claro**: Soporte completo para temas
- 📱 **Diseño Responsivo**: Funciona en móviles y escritorio
- ⚡ **Rendimiento Optimizado**: Angular Signals y Zoneless
- 🎨 **UI Moderna**: Tailwind CSS con componentes reutilizables

## 🚀 Tecnologías

### Frontend
- **Angular 20**: Framework principal con Standalone Components
- **TypeScript**: Tipado fuerte y moderno
- **Tailwind CSS v3.4**: Framework de estilos utilitarios
- **Angular Signals**: Gestión de estado reactiva y Zoneless

### Arquitectura y Servicios
- **JWT Authentication**: Sistema de autenticación seguro
- **RBAC (Role-Based Access Control)**: Control de permisos por roles
- **HTTP Interceptors**: Manejo global de requests/responses
- **Reactive Forms**: Formularios con validación robusta
- **Local Storage**: Persistencia de datos del lado cliente

### Testing y Calidad
- **Jasmine + Karma**: Framework de testing unitario
- **ESLint**: Linting y calidad de código
- **Prettier**: Formateo automático de código

## 🛠️ Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/Juliodvp29/drag-drop-tasks.git
cd drag-drop-tasks
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Ejecuta la aplicación**
```bash
npm start
```

4. **Abre tu navegador**
Visita `http://localhost:4200`

## 📦 Scripts Disponibles

```bash
# 🚀 Desarrollo
npm start                 # Inicia servidor de desarrollo (http://localhost:4200)
npm run build            # Construye para producción
npm run build:dev        # Construye para desarrollo
npm run watch            # Construye en modo watch

# 🧪 Testing
npm test                 # Ejecuta tests unitarios con Karma
npm run test:coverage    # Tests con reporte de cobertura
npm run e2e              # Tests end-to-end (requiere configuración)

# 💅 Calidad de Código
npm run lint             # Ejecuta ESLint para análisis de código
npm run lint:fix         # Corrige automáticamente errores de linting

# 🔧 Utilidades
npm run prettier         # Formatea código con Prettier
npm run analyze          # Análisis de bundle (después de build)
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios principales y configuración
│   │   ├── guards/             # Guards de rutas (Auth, Role, Permission)
│   │   ├── interceptors/       # Interceptores HTTP (Auth, Loader)
│   │   └── services/           # Servicios core (Auth, Storage, Loader, Theme)
│   ├── layout/                 # Componentes de layout
│   │   ├── main-layout/        # Layout principal con navegación
│   │   └── side-nav/           # Navegación lateral con perfil de usuario
│   ├── pages/                  # Páginas principales
│   │   ├── auth/               # Páginas de autenticación
│   │   │   ├── login/          # Inicio de sesión
│   │   │   ├── register/       # Registro de usuarios
│   │   │   ├── forgot-password/# Recuperación de contraseña
│   │   │   ├── reset-password/ # Restablecer contraseña
│   │   │   └── unauthorized/   # Página de acceso denegado
│   │   ├── admin/              # Páginas de administración
│   │   │   ├── roles-management/    # Gestión de roles
│   │   │   ├── users-management/    # Gestión de usuarios
│   │   │   ├── service/        # Servicios de administración
│   │   │   └── settings-profile/    # Configuración de perfil
│   │   ├── calendar/           # Página de calendario
│   │   ├── home/               # Página de inicio
│   │   └── tasks/              # Gestión de tareas
│   │       ├── components/     # Componentes específicos de tareas
│   │       │   ├── card/       # Tarjeta de tarea individual
│   │       │   ├── list/       # Lista de tareas con drag & drop
│   │       │   └── task-detail/# Detalle de tarea
│   │       └── services/       # Servicios de tareas
│   └── shared/                 # Componentes y utilidades compartidas
│       ├── components/         # Componentes reutilizables
│       │   ├── color-picker/   # Selector de colores
│       │   ├── confirmation/   # Modal de confirmación
│       │   ├── loader/         # Indicador de carga
│       │   ├── toast/          # Notificaciones toast
│       │   └── user-form-modal/# Modal de formulario de usuario
│       ├── directives/         # Directivas personalizadas
│       │   └── has-permission/ # Directiva de permisos
│       ├── models/             # Interfaces y modelos TypeScript
│       ├── pipes/              # Pipes personalizados
│       └── utils/              # Utilidades y helpers
├── environments/               # Configuración de ambientes
└── themes.scss                 # Variables de temas (claro/oscuro)
```

## 🎯 Funcionalidades Principales

### 👤 Sistema de Autenticación
- **Registro/Login**: Formularios completos con validación
- **JWT Tokens**: Autenticación segura con refresh tokens
- **Recuperación de Contraseña**: Flujo completo de reset
- **Verificación de Email**: Sistema de códigos de verificación
- **Gestión de Sesiones**: Logout automático y renovación de tokens

### 👥 Administración de Usuarios (Solo Administradores)
- **CRUD de Usuarios**: Crear, editar, eliminar y listar usuarios
- **Gestión de Roles**: Asignación de roles y permisos
- **Estados de Usuario**: Activar/desactivar cuentas
- **Búsqueda y Filtros**: Sistema avanzado de búsqueda
- **Paginación**: Manejo eficiente de grandes listas

### 👤 Perfil de Usuario
- **Información Personal**: Nombre, apellido, email
- **Foto de Perfil**: Upload y visualización de avatares
- **Configuración Personal**: Tema, idioma, zona horaria
- **Notificaciones**: Preferencias de email y push
- **Verificación de Email**: Estado y proceso de verificación

### 📋 Gestión de Tareas
- **Crear/Editar/Eliminar**: Operaciones completas CRUD
- **Sistema de Prioridades**: Baja, Media, Alta, Urgente
- **Estados de Tareas**: Pendiente, En Progreso, Completada
- **Comentarios**: Sistema de comentarios en tareas
- **Asignación**: Asignar tareas a usuarios
- **Búsqueda Avanzada**: Filtros por estado, prioridad, usuario asignado y búsqueda por texto

### 🎨 Drag & Drop Avanzado
- **Mover entre Listas**: Arrastrar tareas intuitivamente
- **Feedback Visual**: Indicadores durante el arrastre
- **Validación**: Prevención de movimientos inválidos
- **Animaciones**: Transiciones suaves

### 📅 Calendario Integrado
- **Vista Mensual**: Visualización de tareas por fecha
- **Eventos**: Mostrar tareas como eventos del calendario
- **Navegación**: Cambiar meses y años fácilmente
- **Integración**: Sincronización con sistema de tareas

### 🎨 Sistema de Temas
- **Modo Oscuro/Claro**: Soporte completo
- **Tema Automático**: Basado en preferencias del sistema
- **Persistencia**: Guardar preferencias del usuario
- **Componentes Adaptativos**: Todos los componentes soportan temas

## 🔧 Servicios Principales

### AuthService
Sistema completo de autenticación:
- Login/Registro con JWT
- Refresh tokens automático
- Verificación de permisos y roles
- Gestión de sesiones de usuario

### UserManagementService
Administración completa de usuarios:
- CRUD de usuarios y roles
- Gestión de configuraciones de usuario
- Verificación de email
- Actualización de perfiles

### TaskService
Gestión avanzada de tareas:
- Operaciones CRUD completas
- Sistema de prioridades y estados
- Drag & Drop entre listas
- Comentarios y asignaciones
- 🔍 **Búsqueda Avanzada**: Filtros por múltiples criterios usando API endpoints

### StorageService
Persistencia robusta:
- localStorage con serialización automática
- Gestión de tokens JWT
- Configuraciones de usuario
- Manejo de errores y recuperación

### ThemeService
Sistema de temas dinámicos:
- Modo oscuro/claro
- Tema automático
- Persistencia de preferencias
- Aplicación global de temas

## 🎨 Componentes Destacados

### Card Component
- Visualización completa de información de tareas
- Indicadores visuales de prioridad
- Acciones rápidas (completar, eliminar)
- Funcionalidad drag & drop integrada

### List Component
- Contenedor de tareas con drag & drop
- Formulario de creación de tareas
- Estadísticas de prioridades
- Opciones de gestión de lista

### ColorPicker Component
- Selector de colores con paleta predefinida
- Soporte para colores personalizados
- Integración con Angular Forms (ControlValueAccessor)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Julio Enrique**
- **GitHub**: [@Juliodvp29](https://github.com/Juliodvp29)
- **LinkedIn**: [@Julio Enrique](https://www.linkedin.com/in/julio-enrique-25481122b/)
- **Email**: juliodvp29@gmail.com

## 📊 Estado del Proyecto

### ✅ Funcionalidades Completadas
- ✅ Sistema de autenticación completo (JWT)
- ✅ Gestión de usuarios y roles (RBAC)
- ✅ Perfil de usuario con verificación de email
- ✅ Gestión de tareas con drag & drop
- ✅ 🔍 Búsqueda avanzada con filtros múltiples
- ✅ Calendario integrado
- ✅ Sistema de temas (oscuro/claro)
- ✅ Diseño responsivo completo

### 🔄 En Desarrollo
- 🔄 Notificaciones push
- 🔄 PWA capabilities

### 📈 Métricas del Proyecto
- **Lenguaje Principal**: TypeScript
- **Framework**: Angular 20
- **Estilos**: Tailwind CSS
- **Arquitectura**: Standalone Components + Signals
- **Cobertura de Tests**: ~85%
- **Estado**: En desarrollo activo

⭐ **¡Dale una estrella si te gusta el proyecto!**

---


