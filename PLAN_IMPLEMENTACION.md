# Plan de implementación de la demo Pinar del Río

Estado: primera entrega implementada y verificada. Los refinamientos pendientes se detallan al final y en README.md.

## 1. Objetivo y alcance

Crear una demo coherente y navegable para condómino, administradora y junta directiva, mejorar los flujos administrativos y registrar las acciones de cada usuario. Aplicar el rediseño visual al modo administradora únicamente, incluido su agente de IA.

- Mantener acceso simulado mediante perfiles; no incorporar autenticación real ni exigir backend.
- Conservar las vistas existentes de condómino, junta y empleado fuera del rediseño visual. Separar la vista de junta del componente administrativo compartido antes de cambiar estilos.
- Incorporar trazabilidad funcional de los tres roles principales sin exigir rediseñar sus pantallas.
- Mantener la identidad del residencial como contexto del cliente.
- Salmón y terracota se reservan para errores, rechazos, fallos y acciones destructivas. No se usan como decoración, selección o acción principal.
- No incorporar envíos externos, transferencias bancarias ni llamadas a un modelo real como parte implícita de la demo.

## 2. Reglas visuales verificadas y decisiones

Fuentes:
- https://libro-de-marca.keyonsia.com/fundamentos/color/por-modo.html
- https://libro-de-marca.keyonsia.com/fundamentos/color/funcionales.html
- https://libro-de-marca.keyonsia.com/fundamentos/tipografia/sistema.html
- https://libro-de-marca.keyonsia.com/fundamentos/forma/espacio.html
- https://libro-de-marca.keyonsia.com/fundamentos/iconografia/iconos.html
- https://libro-de-marca.keyonsia.com/css/tokens.css

El manual está en versión 0.1 y contiene apartados en borrador. Cuando haya contradicción, documentar la decisión aplicada; la instrucción del usuario sobre salmón y la referencia del agente tienen prioridad.

### Paleta y tipografía
- Fondo Blanco Keyons #F4F4F4; superficies #FFFFFF; texto Azul Noche #10122A.
- Texto secundario #3A3C4E y terciario #6B6D7E; no usar colores de deshabilitado para información necesaria.
- Azul Cielo #729BDD para acciones y señales interactivas; verificar contraste en cada estado.
- Éxito verde tierra #D5E0D2, advertencia mostaza #F4E8C1, revisión lavanda #D9D6ED, información #C6D5EC y error terracota #F0D0CB.
- Texto e icono en Azul Noche sobre fondos suaves; estado siempre identificado también con texto.
- Plus Jakarta Sans para la interfaz; TASA Orbiter solo en momentos protagonistas y kickers.
- Cuerpo de 16–17 px, contenido secundario de 14–15 px; rótulos de 13 px cuando corresponda. Números tabulares para importes y métricas.
- Priorizar Azul Cielo para acción primaria sobre la definición salmón de los tokens del manual.

### Composición
- Variables semánticas y de componentes encapsuladas en el área administrativa; evitar cambios globales que afecten otros roles.
- Espaciado en múltiplos de 4; retícula de 4/8/12 columnas según ancho.
- Exterior recto e interior curvo para conjuntos; bloques aislados rectos; botones y badges en píldora.
- Densidad alta en listados, media en formularios y baja en confirmaciones importantes.
- Superficies sobrias; cielos y efectos expresivos solo en momentos designados, sin competir con los datos.
- Iconografía consistente, preferentemente SVG oficial, con etiquetas y nombres accesibles.

## 3. Agente de IA y referencia visual

Referencia recibida: codex-clipboard-e9ab74f3-c9dd-4c63-a7d3-5b546fd260f6.png, 132 × 142 px.

### Fidelidad al lanzador
La imagen muestra el botón cerrado, no una conversación abierta. Reproducir su geometría y aspecto sin añadir rótulos o adornos visibles:
- Fondo Azul Noche profundo.
- Círculo azul desaturado de aproximadamente 84 px de diámetro.
- Destello blanco de cuatro puntas centrado, con proporciones iguales a la referencia.
- Indicador circular lavanda de aproximadamente 16 px en la parte superior derecha, separado por un borde oscuro.
- Sin robot, texto, gradiente, resplandor ni animación permanente.
- Medir colores y posiciones del archivo original durante la implementación; estos tamaños son una lectura inicial de la captura, no mediciones finales.
- Dibujar la geometría con SVG/CSS; comparar captura recortada a escala equivalente con el original.
- Conservar área táctil, foco visible al usar teclado y nombre accesible «Abrir agente de IA».
- El indicador representa disponibilidad de la demo, no una conexión real no comprobada.

### Conversación abierta: propuesta complementaria
Como la referencia no muestra el panel abierto, esta parte se diseña con el mismo lenguaje visual, sin atribuirle fidelidad a una pantalla no proporcionada:
- Cabecera Azul Noche con el mismo símbolo, título, estado de demo y cierre accesible.
- Superficie clara, texto legible, mensajes del usuario y agente claramente diferenciados.
- Azul para interacción, lavanda para contexto y espera; salmón solo para errores.
- Entrada inferior con etiqueta accesible y botón de envío; Enter envía y Shift+Enter agrega una línea.
- Panel lateral o flotante en escritorio y vista adaptable en móvil que respete el teclado virtual.
- Sugerencias según rol y módulo, estado de respuesta, reintento y mensajes de error.
- Reiniciar conversación y cancelar respuestas pendientes al cambiar de usuario o reiniciar la demo.
- Consumir los mismos datos y reglas del sistema; evitar respuestas de saldo o estado desconectadas de los registros.
- Identificar el motor actual como asistente de demostración basado en reglas.
- El agente no ejecuta cambios financieros automáticamente: presenta la acción y conduce al flujo correspondiente; cualquier ejecución futura tendrá confirmación y trazabilidad.
- Registrar acciones y resultados relevantes del agente con su usuario iniciador; no copiar conversaciones completas a la bitácora por defecto.

## 4. Perfiles y navegación

- Selector con condómino, administradora y junta, descripción breve e identidad de demo estable.
- Eliminar el requisito de contraseña simulada del recorrido principal.
- Administradora: operación diaria; junta: consulta, supervisión y decisiones; condómino: su filial y solicitudes.
- Matriz explícita de acciones permitidas por rol, aplicada también en la capa de operaciones local.
- Identidad y rol activos visibles; cambiar de perfil limpia el contexto privado, conserva datos compartidos y no altera autores históricos.
- Secciones administrativas: Resumen, Tesorería, Filiales y residentes, Mantenimiento, Personal, Comunicaciones, Importaciones, Actividad y trazabilidad.
- Barra lateral estable, menú adaptable y una acción principal clara por pantalla.
- Conservar sección, filtros y selección al abrir y cerrar detalles; navegación compatible con volver del navegador cuando se incorporen rutas.

## 5. Trazabilidad transversal

### Modelo de evento
Identificador único, fecha UTC, usuario ID y nombre al actuar, rol al actuar, sesión de demo, módulo, acción, entidad e ID afectados, resumen legible, cambios de campos relevantes, resultado, motivo e identificador de operación relacionada. Incluir origen humano/agente/sistema e iniciador cuando corresponda.

Mostrar fechas en America/Costa_Rica. Mantener una secuencia estable para eventos con la misma marca de tiempo. Conservar contexto mínimo si el registro se elimina. No registrar contraseñas, archivos completos, comprobantes binarios ni datos personales innecesarios.

### Cobertura
- Entrada, salida y cambios de perfil.
- Crear, editar, eliminar, archivar y restaurar donde aplique.
- Reportar, validar, rechazar y revertir pagos; recibos y cuotas.
- Importar, exportar, generar boletas y consultar o descargar información sensible.
- Cambios de responsable, prioridad y estado de incidencias.
- Planillas: cálculo, revisión, aprobación y generación de documentos.
- Comunicados: borrador, programación y publicación.
- Reservas y decisiones de junta, con motivo o acta cuando corresponda.
- Intentos fallidos o bloqueados de operaciones relevantes; no registrar cada clic o pulsación.

### Integridad y persistencia de demo
- Centralizar operaciones de dominio y creación de eventos; no dispersar registros en botones.
- Guardar datos y bitácora como un estado versionado coherente; detectar fallos de almacenamiento y no mostrar éxito si no se guardó.
- Una operación exitosa produce sus efectos y su evento una sola vez; proteger reintentos y dobles clics.
- Las correcciones generan nuevos eventos vinculados, sin editar ni borrar eventos individuales desde la interfaz.
- Reiniciar inicia una nueva sesión de demo, explica qué se restablece y permite exportar el historial previo.
- La persistencia local es demostrativa: no proporciona auditoría resistente a manipulación ni identidad verificada.

### Presentación
- Bitácora central con filtros de usuario, rol, fecha, módulo, acción y resultado.
- Búsqueda por filial, referencia y entidad; paginación y exportación filtrada.
- Detalle antes/después y relación entre eventos de una misma operación.
- Línea de tiempo por ficha y actividad reciente en Resumen.
- Administradora consulta actividad operativa; junta consulta supervisión según matriz; condómino accede a información de su filial sin exponer datos de terceros.

## 6. Mejoras funcionales por módulo

### Resumen
- Indicadores derivados de registros: recaudación, saldo pendiente, pagos por validar e incidencias.
- Período y definición visibles; cada indicador abre el listado filtrado.
- Bandeja de pendientes ordenada por urgencia, accesos rápidos y actividad reciente.
- Gráficos solo cuando expliquen tendencias o comparaciones; nunca números decorativos.

### Tesorería
- Validar pagos una sola vez; mantener consistencia entre pagos, facturas y saldos.
- Mostrar comprobante, referencia, filial y efecto previsto antes de confirmar.
- Conservar excedentes como crédito explícito y documentar aplicación parcial.
- Rechazo con motivo y reversión con movimiento compensatorio trazable.
- Recibos con búsqueda de filial, datos conocidos, monto válido, vista previa y confirmación persistente.
- Cuotas con alcance, vigencia, comparación antes/después y confirmación masiva.

### Importaciones y exportaciones
- Elegir tipo, cargar, mapear columnas cuando sea necesario, validar, revisar y confirmar.
- Esquemas por tipo, fechas normalizadas, identificación real de filial y errores por fila.
- Detectar duplicados dentro del archivo y frente a registros existentes.
- No inventar montos, personas, filiales o fechas para completar errores.
- Aplicar pagos importados mediante la misma lógica contable que los manuales.
- Resumen de aceptados, rechazados y omitidos; historial y eventos por lote relacionados con registros afectados.
- Exportaciones indican alcance, filtros y período y generan un evento.

### Filiales y residentes
- Directorio con búsqueda, filtros y ficha lateral; secciones de contacto, convivencia y estado financiero.
- Validación de formatos y duplicados; historial por ficha.
- Confirmación y tratamiento explícito de dependencias antes de eliminar registros.

### Mantenimiento y reservas
- Incidencias con prioridad, responsable, antigüedad, estado y cronología.
- Motivos de rechazo, evidencias y seguimiento de decisiones de junta.
- Reservas sin superposición, con capacidad y fechas válidas; restricciones centralizadas para todos los roles.
- Eliminar fechas fijas dispersas y usar una fecha de referencia única para el escenario.

### Personal
- Una fuente de empleados y un motor de cálculo para todas las vistas de planilla.
- Tasas configuradas por vigencia y escenario; no declarar validez normativa sin verificarla.
- Separar calculada, revisada, aprobada, exportada y pagada; no simular transferencia real al generar documentos.
- Evitar procesar dos veces el mismo período; conciliar total con suma de boletas y reglas de redondeo.
- Turnos, extras y deducciones con origen claro e historial.

### Comunicaciones
- Separar borrador, vista previa, programación y publicación.
- Validar campos, medios y fechas; preservar texto ante errores.
- Mensajes de demo precisos sin afirmar envíos externos no realizados.

## 7. Patrones compartidos y accesibilidad

- Tablas con búsqueda contextual, filtros visibles, limpiar filtros, ordenamiento, paginación y detalle sin perder posición.
- Importes alineados, estados con texto e icono y exportaciones con alcance explícito.
- Formularios con etiquetas persistentes, errores junto al campo e instrucciones de corrección.
- Confirmaciones concretas para operaciones destructivas o masivas; conservar entradas tras errores.
- Estados vacíos, sin resultados, espera, éxito, error y recuperación definidos por módulo.
- Contraste WCAG AA, navegación por teclado, foco visible y anuncios de estado.
- Diálogos con foco controlado, Escape y devolución del foco; no cerrar resultados antes de que puedan leerse.
- Objetivo táctil de 44 px en acciones principales; respetar movimiento reducido.
- Revisar móvil, tableta, escritorio, zoom y ausencia de desbordamiento general.

Referencias UX: https://www.nngroup.com/articles/progressive-disclosure/ ; https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines ; https://www.w3.org/WAI/tutorials/forms/notifications/ ; https://www.w3.org/TR/WCAG22/ ; https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html

## 8. Secuencia de implementación

1. Base: verificar herramientas y dependencias, matriz de roles, escenarios y comportamiento actual. Separar las vistas compartidas que podrían propagar estilos a junta.
2. Dominio: estado versionado, identidades estables, operaciones centralizadas, validaciones, eventos y persistencia. Resolver primero consistencia de pagos e importaciones.
3. Sistema visual: tokens administrativos, tipografía, estructura, controles, tablas, diálogos y ficha de decisiones de marca.
4. Primer recorrido completo: acceso de demo → Resumen → pago pendiente → validar → saldo y factura coherentes → evento y consulta de junta.
5. Módulos: caja, importaciones, filiales, mantenimiento/reservas, personal y comunicaciones, cada uno con trazabilidad desde su entrega.
6. Agente: lanzador fiel a referencia, panel adaptable, contexto de sesión, respuestas coherentes y enlaces a operaciones trazables.
7. Calidad: pruebas de dominio, recorridos por rol, accesibilidad, comparación visual y revisión de regresiones; documentación y escenarios para presentar la demo.

## 9. Criterios de aceptación

- Los tres perfiles principales entran sin contraseña y exhiben tareas distintas.
- El nuevo aspecto administrativo no modifica visualmente condómino, junta ni empleado.
- Salmón aparece exclusivamente en contextos negativos.
- El lanzador del agente coincide con la referencia en forma, posición relativa y colores; validación mediante comparación de captura.
- Cambiar de identidad no conserva mensajes o respuestas pendientes del usuario anterior.
- Pago validado dos veces no descuenta dos veces; importar dos veces no duplica movimientos.
- Saldos, facturas, recibos, indicadores y boletas concilian.
- Toda acción relevante registra identidad, rol, fecha, entidad, resultado y cambios necesarios.
- Los historiales conservan autor y contexto después de cambios de perfil o eliminación de registros.
- La demo conserva estado tras recargar y puede restablecerse de forma predecible.
- No hay botones que anuncien éxito sin ejecutar su operación simulada.
- Flujos principales utilizables con teclado y en móvil; mensajes y diálogos accesibles.
- Comprobación de tipos y build correctos; pruebas específicas de doble aplicación, duplicados, permisos por rol, trazabilidad, planilla y reservas.
- Documentación final explica cómo iniciar, probar, restablecer y presentar los escenarios, y los límites de la simulación.

## 10. Entregables

- Demo actualizada, componentes administrativos por módulo y agente conforme a la referencia disponible.
- Ficha de decisiones visuales y matriz de capacidades por rol.
- Bitácora central, historial por registro y exportación.
- Escenarios de demostración reproducibles y guía de uso.
- Evidencia de pruebas y capturas de los recorridos principales.

## 11. Avance de la primera entrega

Implementado:
- Perfiles sin contraseña; administración y junta separadas; permisos en operaciones de dominio.
- Panel administrativo por módulos, identidad Keyons, salmón solo negativo y lanzador SVG de Estela basado en la referencia, sin fondo rectangular.
- Persistencia conjunta de datos y bitácora; autoría, antes/después, eventos relacionados, filtros, exportación e historial de filial.
- Pagos parciales, conciliación, crédito a favor, validación única, rechazo y reversión.
- Caja con revisión previa, comprobantes reales opcionales y documento ficticio para el escenario inicial.
- Importaciones con validación de filas y duplicados, sin importes inventados y con registro por lote y entidad.
- Gestión de filiales, residentes, incidencias, empleados, turnos y comunicados; decisiones de junta con motivo y acta.
- Planilla centralizada con extras, ausencias, deducciones y boletas pendientes; aprobación diferenciada de pago.
- Reservas con fecha actual, capacidad y conflicto de horario comprobados.
- Agente administrativo con datos de la demo, historial limpio al cambiar de identidad y consultas trazadas sin guardar el texto completo.
- Navegación adaptable, diálogos accesibles y revisión de foco en el menú móvil.
- 15 pruebas de dominio, comprobación de tipos y compilación correctas; recorridos manuales en navegador y capturas en docs/capturas.

Pendiente para siguientes iteraciones:
- Pruebas de usabilidad con personas y auditoría completa de accesibilidad.
- Completado en la etapa 2: edición de horarios por día y calendario detallado de vacaciones.
- Migración de cálculos especializados de aguinaldo y liquidación del prototipo anterior al motor común.
- Completado en la etapa 2: formatos imprimibles de recibos y boletas; se conservan JSON y Excel y se ofrece imprimir / guardar PDF mediante el navegador.
- Mayor cobertura automatizada de interfaz y de variantes de archivos de importación.

Las integraciones reales, la autenticación productiva y la auditoría resistente a manipulaciones permanecen fuera del alcance de la demo.

## 12. Segunda etapa: personal y documentos

- Horarios por persona y día con total semanal calculado, descansos y jornadas nocturnas. Validación de horas y superposición entre jornadas, incluso al cambiar de semana.
- Solicitudes de vacaciones con días laborables guardados, aprobación, rechazo, cancelación y cierre como disfrutadas. Saldos reservados separados de disfrutados; protección contra doble descuento y cambios desde la ficha genérica.
- Calendario mensual adaptable, filtros, selección de fecha e historial con motivos y autoría.
- Recibos y boletas con vista previa y estilos A4 para imprimir o guardar como PDF desde el navegador. No se generan transferencias ni documentos fiscales válidos.
- Las nuevas boletas conservan la identidad del momento del cálculo. La impresión se registra como apertura del diálogo, sin afirmar éxito físico.
- 26 pruebas automáticas correctas; comprobación de tipos y compilación correctas. Revisión de interfaz en escritorio y móvil y evidencia en docs/capturas.

Próximo bloque: migrar los cálculos especializados de aguinaldo y liquidación al motor común, documentando sus parámetros y validándolos antes de atribuirles cumplimiento normativo. Continúan pendientes la auditoría completa de accesibilidad y las pruebas con personas.

## 13. Simplificación de vacaciones y disponibilidad

Implementado: botones primarios azules con texto blanco; vistas Calendario, Solicitudes y Saldos; filtro compartido por persona; calendario mensual con agenda contextual; historial separado mediante filtro; decisiones con motivo dentro del detalle; saldos con desglose y solicitud preseleccionada. Navegación de pestañas y calendario mediante teclado y presentación móvil sin desbordamiento horizontal.

Validación: 31 pruebas, tipos y compilación correctos. Recorrido manual de solicitud, aprobación, calendario y cancelación; saldo restaurado y eventos conservados.

Referencias de diseño: https://design-system.service.gov.uk/components/tabs/ y https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ para vistas relacionadas y teclado; https://www.nngroup.com/articles/progressive-disclosure/ para revelar detalles y decisiones cuando se necesitan.


## 14. Prestaciones integradas

Completado el flujo de aguinaldo y liquidación en el motor común, con revisión previa, salarios del ciclo, bases separadas, confirmación/anulación con motivo, trazabilidad y documento imprimible. Se eliminaron las aproximaciones fijas del prototipo en la ruta activa. Los días indemnizables siguen siendo parámetros de revisión explícita; no se implementa determinación jurídica automática. Alcance y fuentes en docs/PRESTACIONES.md. Validación: 37 pruebas, tipos, compilación y recorrido visual de escritorio/móvil. Próximo bloque: auditoría de accesibilidad y usabilidad.


## 15. Revisión técnica de accesibilidad y usabilidad

Completada la revisión técnica de administración con correcciones de navegación, foco, tablas, diálogos, chat, contraste y presentación móvil. Ver docs/ACCESIBILIDAD.md para la matriz de hallazgos y comprobaciones. Se verificaron teclado y vistas de escritorio/móvil; 37 pruebas, tipos y compilación correctos. Esta entrega no certifica conformidad WCAG completa. Siguiente validación: lector de pantalla, zoom/colores forzados y sesiones observadas con personas de los tres perfiles.


## 16. Reflujo y preparación de pruebas con personas

Comprobación a 320 píxeles CSS: corregidas pestañas de vacaciones y edición de horarios que desbordaban el ancho; ajustes de prestaciones y documentos. Añadido soporte CSS para colores forzados, pendiente de validación con ese modo activo. Preparado docs/PRUEBAS_CON_PERSONAS.md con tareas por perfil, moderación y registro de resultados. Las sesiones con participantes, lector de pantalla y zoom real siguen pendientes; no se simulan resultados humanos.


## 17. Anuncios comerciales implementados

Solicitud desde Amenidades; borradores, revisión, correcciones, tarifas configurables, comprobantes y validación de pagos independientes, publicación manual y exposición de anuncios vigentes. Todos los anuncios requieren aprobación administrativa. Beneficio mensual por filial protegido contra doble uso. Documentación en docs/ANUNCIOS.md. 52 pruebas, tipos y build correctos; verificación de recorrido completo y móvil 320/390 píxeles en escenario de prueba separado.

