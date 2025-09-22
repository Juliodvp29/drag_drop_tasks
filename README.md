# 📋 Drag Drop Tasks

Una aplicación moderna de gestión de tareas con funcionalidad de arrastrar y soltar, construida con Angular 19 y diseñada con Tailwind CSS.

## ✨ Características

- 🎯 **Gestión de Tareas**: Crea, edita y elimina tareas fácilmente
- 🎨 **Drag & Drop**: Mueve tareas entre diferentes listas de forma intuitiva
- 📊 **Tableros Personalizables**: Crea listas con colores personalizados
- 🚨 **Sistema de Prioridades**: Organiza tareas por urgencia (Baja, Media, Alta, Urgente)
- 💾 **Persistencia Local**: Guarda automáticamente en localStorage
- 📱 **Diseño Responsivo**: Funciona perfectamente en móviles y escritorio
- 🌙 **Interfaz Moderna**: Diseño limpio y minimalista con Tailwind CSS
- ⚡ **Zoneless Change Detection**: Mejor rendimiento con Angular Signals

## 🚀 Tecnologías

- **Frontend**: Angular 20
- **Arquitectura**: Standalone Components, Signals
- **Estilos**: Tailwind CSS v3.4
- **Gestión de Estado**: Angular Signals
- **Persistencia**: localStorage (con servicio personalizado)
- **Testing**: Jasmine + Karma

## 🛠️ Instalación

1. **Clona el repositorio**
```bash
git clone https://github.com/tu-usuario/drag-drop-tasks.git
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
# Desarrollo
npm start                 # Inicia servidor de desarrollo
npm run build            # Construye para producción
npm run build:dev        # Construye para desarrollo
npm run watch            # Construye en modo watch

# Testing
npm test                 # Ejecuta tests unitarios
npm run test:coverage    # Tests con coverage
npm run e2e              # Tests end-to-end

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run lint:fix         # Corrige errores de linting automáticamente
```

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios principales y configuración
│   │   ├── interceptors/        # Interceptores HTTP
│   │   └── services/           # Servicios core (Auth, Storage, Loader)
│   ├── layout/                 # Componentes de layout
│   │   ├── main-layout/        # Layout principal
│   │   └── side-nav/           # Navegación lateral
│   ├── pages/                  # Páginas principales
│   │   ├── calendar/           # Página calendario (en desarrollo)
│   │   ├── home/              # Página inicio
│   │   └── tasks/             # Página de tareas
│   │       ├── components/     # Componentes específicos de tareas
│   │       │   ├── card/       # Tarjeta de tarea individual
│   │       │   └── list/       # Lista de tareas
│   │       └── services/       # Servicios de tareas
│   └── shared/                 # Componentes y utilidades compartidas
│       ├── components/         # Componentes reutilizables
│       ├── models/             # Interfaces y modelos
│       ├── pipes/              # Pipes personalizados
│       └── utils/              # Utilidades y helpers
```

## 🎯 Funcionalidades Principales

### 📋 Gestión de Listas
- Crear listas personalizadas con colores
- Eliminar listas completas
- Visualización de estadísticas por lista

### 📝 Gestión de Tareas
- Crear tareas con diferentes prioridades
- Marcar tareas como completadas
- Eliminar tareas individuales
- Ordenamiento automático por prioridad y fecha

### 🎨 Drag & Drop
- Mover tareas entre listas arrastrando
- Feedback visual durante el arrastre
- Prevención de drops inválidos

### 🎨 Sistema de Colores
- Selector de colores predefinidos
- Soporte para colores personalizados (hex)
- Aplicación visual en bordes de listas

## 🔧 Servicios Principales

### TaskService
Gestiona todas las operaciones CRUD de tareas y listas:
- Creación y eliminación de listas
- Operaciones de tareas (crear, completar, eliminar, mover)
- Persistencia automática en localStorage

### StorageService
Abstrae el manejo de localStorage con:
- Serialización/deserialización automática
- Manejo de errores
- Signal reactivo para el token de autenticación

### LoaderService
Controla el estado de carga global de la aplicación

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

## 🚀 Próximas Funcionalidades

- [ ] 📅 Integración completa del calendario
- [ ] 🔍 Sistema de búsqueda y filtros
- [ ] 🏷️ Sistema de etiquetas/tags
- [ ] 🔒 Sistema de autenticación
- [ ] 🌙 Modo oscuro

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

**Tu Nombre**
- GitHub: [@Juliodvp29](https://github.com/Juliodvp29)
- LinkedIn: [@Julio Enrique]([https://www.linkedin.com/in/julio-enrique-25481122b/])

⭐ ¡Dale una estrella si te gusta el proyecto!
