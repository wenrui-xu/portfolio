---
slug: adi
role: Diseño de producto, desarrollo Android y pruebas con usuarios de forma individual
projectType: Proyecto de fin de grado · App Android
status: Finalizado · defendido en octubre de 2026
summary: Una app Android de planificación con tareas adaptadas, rutinas visuales y apoyo para tutores de personas autistas o con TDAH.
process: [Necesidades de usuario e investigación, UX/UI en Figma, Desarrollo con Kotlin y Compose, Integración de voz y APIs, Pruebas con usuarios]
---
## Resumen

ADI (Asistente Digital Inteligente) es mi TFG individual de Ingeniería Multimedia: una aplicación Android nativa diseñada para hacer más accesible la planificación diaria de personas autistas, con TDAH y sus tutores. Reúne tareas y subtareas, rutinas recurrentes, secuencias con pictogramas y vistas de calendario de día, semana y mes. El modo tutor dispone de controles adicionales protegidos con un PIN.

También incluye recordatorios, estadísticas de progreso, verificación de tareas mediante fotografías, interacción por texto y voz y vistas configurables con distintos niveles de detalle. Lo desarrollé entre 2025 y 2026, lo completé en 2026 y lo defendí en la Universitat de València en octubre de 2026 con una calificación de 9/10.

## Mi papel

Diseñé y desarrollé ADI de forma individual, desde los flujos de usuario y los prototipos en Figma hasta la implementación Android y la evaluación. Utilicé Kotlin y Jetpack Compose para la interfaz y Room para guardar los datos localmente. Integré pictogramas de ARASAAC, Vosk y el reconocimiento de voz de Android, además de la API de Gemini para interpretar peticiones en lenguaje natural sobre tareas y secuencias. También preparé y realicé pruebas con usuarios y analicé sus comentarios.

## Retos

### Problema

Un mismo sistema de planificación debía responder a distintas necesidades cognitivas sin obligar a todo el mundo a utilizar una interfaz densa.

### Por qué

Las tareas pueden requerir pasos pequeños, pictogramas o apoyo de un tutor. La entrada por voz y las rutinas recurrentes añaden estados y posibles puntos de confusión.

### Solución

Construí vistas configurables de tareas y calendario, secuencias visuales y un modo tutor diferenciado. Probé con usuarios la creación de tareas, la entrada por voz, las subtareas repetidas, la finalización de rutinas y la navegación, y utilicé sus observaciones para detectar mejoras.

### Resultado

Las sesiones identificaron problemas concretos en las señales de voz, las subtareas duplicadas, la finalización de rutinas y el regreso a pantallas anteriores. Sus resultados guiaron cambios y documentaron mejoras pendientes.

## Proceso

Partí de las necesidades de los usuarios y del diseño de interacción, prototipé la interfaz en Figma, implementé la app con Kotlin y Compose e integré almacenamiento local, pictogramas, voz e interpretación asistida por IA. Por último, realicé sesiones con usuarios y revisé los problemas que encontraron.

## Resultados de las pruebas

La app se completó y defendió con una calificación de 9/10. Las pruebas proporcionaron observaciones concretas, sin atribuirles porcentajes de mejora no medidos. [Ver la demostración de ADI ↗](https://youtu.be/nAiH9rMR5EQ). El código no está disponible públicamente; se podrán añadir capturas tras revisarlas.
