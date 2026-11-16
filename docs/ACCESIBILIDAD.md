# Revisión técnica de accesibilidad y usabilidad

Fecha: 11 de noviembre de 2026. Alcance: administración activa, componentes compartidos, escritorio y pantalla de 390 × 844. Esta revisión no certifica conformidad completa con WCAG ni sustituye pruebas con personas.

## Hallazgos corregidos

| Problema | Corrección |
| --- | --- |
| La navegación obligaba a recorrer el menú para llegar a las tareas. | Enlace «Saltar al contenido», región con nombre por módulo y foco al cambiar de sección principal. |
| Mayús+Tab desde el primer control de un diálogo podía llevar el foco al fondo. | Ciclo explícito entre controles visibles/habilitados, conservando Escape y restauración del foco al botón que abrió el diálogo. Si desapareció, se usa el contenido administrativo. |
| El chat retenía Tab aunque el resto del panel continuaba disponible. | Conversación no modal sin retención de Tab; Escape vuelve al lanzador. Registro de mensajes con nombre, instrucciones de teclado y respeto de movimiento reducido. |
| Las tablas anchas carecían de un acceso claro por teclado y de nombre propio. | Región enfocable, título accesible, indicación visible cuando desbordan y desplazamiento con flechas. Orden anunciado, encabezados de columna y acciones agrupadas por registro. |
| Ordenar podía dejar a la persona en una página intermedia; limpiar búsqueda eliminaba el botón enfocado. | Ordenar vuelve a página 1; limpiar devuelve foco al buscador. Cambiar página lleva el foco al área de resultados. |
| Texto auxiliar del aviso de demo con contraste medido aproximado de 4,33:1. | Texto más oscuro; ajuste también de fechas del mes adyacente y placeholders. |
| Algunos controles pequeños dificultaban la interacción móvil. | Acciones principales/de filas de 44 px en móvil; controles de texto de 16 px para facilitar lectura y reducir el zoom automático de ciertos navegadores. |
| Estela seguía accesible al abrir el menú móvil. | El fondo y el chat quedan inertes mientras el menú está abierto. Escape restaura el botón de apertura. |
| Importaciones y actividad no tenían título principal de página. | Encabezado de nivel 1 en sus vistas principales. La bitácora embebida mantiene nivel 2. |
| Detalles repetidos de bitácora sin contexto propio. | Controles nombrados con acción, usuario y fecha, relación con panel expandido y tabla de cambios enfocable. |

Se conserva el lanzador de Estela de 48 px. Botones principales azules y texto blanco; salmón/terracota únicamente en contextos negativos.

## Comprobaciones realizadas

| Recorrido | Resultado observado |
| --- | --- |
| Saltar al contenido y cambiar módulo | El foco llega a la región con nombre de la sección. |
| Diálogo de caja | Tab y Mayús+Tab recorren sus controles; Escape cierra y restaura el botón de apertura. Envío incompleto enfoca el primer campo requerido mediante validación nativa. No se registró un pago de prueba. |
| Tesorería | La ordenación comunica ascendente mediante aria-sort; búsqueda sin resultados muestra estado vacío; limpiar devuelve foco al buscador. |
| Tabla móvil | Página de 390 px sin desbordamiento general; tabla de 686 px dentro de un contenedor de 342 px. Flecha derecha produce desplazamiento interno observado de 40 px. |
| Menú móvil | Foco inicial en cerrar; Mayús+Tab llega al último control; fondo y chat inertes; Escape devuelve el foco a abrir menú. |
| Estela | Consulta de trazabilidad respondida; registro de mensajes expuesto con nombre; Escape restaura el lanzador. |
| Vacaciones | Flechas cambian pestaña; Home vuelve al calendario; flechas recorren fechas. Calendario móvil sin desbordamiento de la página. |
| Módulos | Inspección de resumen, filiales, mantenimiento, empleados, comunicaciones, importaciones, actividad y vistas de planilla, vacaciones y prestaciones. Sin campos visibles sin etiqueta en esas vistas. |
| Contraste orientativo | Sondeo DOM de textos simples y fondos sólidos en las vistas indicadas, sin incidencias tras los ajustes. Se excluyen controles deshabilitados y se considera tamaño de texto. No cubre imágenes, estados hover, transparencias complejas ni combinaciones no abiertas. |
| Regresión | 37 pruebas de dominio/documentos correctas; tipos y compilación correctos. |

La comprobación de teclado, foco, árbol accesible y DOM fue manual asistida por navegador. No se ejecutó un escáner integral como axe ni una sesión con NVDA/JAWS/VoiceOver; no se atribuye equivalencia a esas pruebas. Los recorridos de operaciones de negocio conservan su cobertura automática y las comprobaciones de etapas anteriores.

## Validación siguiente con personas

Realizar sesiones observadas con representantes de condómino, administradora y junta, incluyendo una persona que use teclado o lector de pantalla. Registrar tareas completadas, errores, puntos de duda y comentarios sin guiar sus decisiones. No se han realizado estas sesiones.

Tareas sugeridas: localizar un pago pendiente y su comprobante; distinguir calcular de pagar planilla; solicitar y resolver vacaciones; encontrar autor y motivo de una operación; revisar un desglose de prestaciones; consultar el chat y volver al módulo. En lector de pantalla comprobar anuncios de errores, tablas, cambios de pestañas y mensajes de chat. Revisar también zoom de 200–400 %, colores forzados y navegadores móviles reales.

## Referencias

- [W3C: WCAG 2.2 y novedades](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/): navegación por foco y tamaño de objetivos.
- [W3C: nombres y descripciones accesibles](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/): contexto de controles y tablas.
- [W3C: títulos de tablas](https://www.w3.org/WAI/tutorials/tables/caption-summary/): identificación de conjuntos de datos.

Evidencia: `docs/capturas/accesibilidad-foco-dialogo.png` y `docs/capturas/accesibilidad-formulario-movil.png`.

## Ampliación: reflujo a 320 píxeles

Se comprobó la presentación con un viewport de 320 píxeles CSS, referencia de reflujo relacionada con ampliar a 400 % una ventana de 1280 píxeles. No se ejecutó zoom real ni ampliación exclusiva de texto.

Se encontraron y corrigieron dos incidencias: las pestañas internas de vacaciones aumentaban el ancho de la página de 305 a 317 píxeles (con barra vertical), y el diálogo de horarios tenía 326 píxeles de contenido en 254 disponibles. Tras los cambios, ambos anchos coinciden con el área disponible. Se apilan las horas por día y se compactan las pestañas sin ocultar sus nombres.

También se ajustaron a ese ancho los campos mensuales de prestaciones, el desglose de importes, los filtros de solicitudes y las cabeceras de documentos. Se verificaron formulario y documento de prestaciones con ancho interno de 254 píxeles y sin desbordamiento horizontal. Los módulos principales mantienen el desplazamiento horizontal dentro de las tablas y navegación que lo necesitan.

Se añadieron reglas para colores forzados: bordes de controles y estados, foco y deshabilitados con colores de sistema. Estas reglas compilaron; queda pendiente comprobarlas con el modo de contraste del sistema activado. No se modificó la configuración de accesibilidad del equipo del usuario.

Referencias: [W3C: reflujo](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) y [W3C: indicadores de foco](https://www.w3.org/WAI/WCAG22/Techniques/css/C40).

Evidencia adicional: `docs/capturas/vacaciones-reflujo-320.png` y `docs/capturas/horario-reflujo-320.png`. El guion de sesiones está en `docs/PRUEBAS_CON_PERSONAS.md`; permanece sin ejecutar con participantes reales.
