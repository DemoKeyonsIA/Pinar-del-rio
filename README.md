# Pinar del Río · Demo de gestión residencial

Demo en React, TypeScript y Vite con dos perspectivas principales: condómino y administradora; el perfil de empleado está disponible como opción secundaria. El acceso es simulado y no requiere contraseña ni clave de Gemini.

## Ejecutar

Requisitos: Node.js 22.12 o posterior y npm.

```sh
npm ci
npm run dev
```

Abra http://localhost:3000 y seleccione **Iniciar sesión → Administradora**. El selector permite cambiar de perfil sin perder los datos compartidos.

```sh
npm run lint
npm test
npm run build
```

`lint` comprueba tipos. Las 52 pruebas verifican pagos repetidos, conciliación, créditos, importaciones, reservas, planilla, autoría, jornadas nocturnas y superpuestas, saldos y transiciones de vacaciones, identidad de boletas y contenido seguro de documentos.

## Recorridos disponibles

1. **Pago de un condómino:** entre como condómino, reporte un pago y adjunte una imagen o PDF opcional de hasta 2 MB. Cambie a administradora, revise el comprobante y valide. Consulte factura, saldo y bitácora.
2. **Recibo de caja:** registre filial, monto y referencia, revise el saldo previsto y confirme. El recibo se descarga como JSON o se abre en vista previa para imprimir / guardar como PDF desde el navegador. La operación queda relacionada con la filial y las facturas.
3. **Corrección:** revierta un pago indicando el motivo; el movimiento y su autoría permanecen en el historial.
4. **Anuncios:** desde Amenidades, prepare una solicitud. En Comunicaciones, revise contenido y tarifa, valide el pago cuando corresponda y publique manualmente. El pago no descuenta cuota de mantenimiento.
5. **Planilla:** edite empleados, extras, otras deducciones y días no laborados. Calcule un período, revise el resultado, apruebe el cálculo, exporte boletas a Excel o abra el formato imprimible. No se realizan transferencias.
6. **Excel:** descargue una plantilla desde Importaciones, complete las columnas y cargue el archivo. Los errores se muestran por fila y bloquean la confirmación. Los duplicados se omiten; todos los pagos usan la misma conciliación.
7. **Actividad:** filtre por usuario, rol, módulo, fecha o resultado; abra cambios antes/después y exporte JSON. Los condóminos consultan únicamente la actividad relacionada con su identidad o filial.
8. **Agente:** abra el botón de la esquina inferior derecha en administración y consulte pagos, incidencias, planilla, importaciones o trazabilidad. Responde con reglas y datos actuales; no ejecuta operaciones automáticamente.
9. **Persistencia:** recargue y vuelva a elegir un perfil: los datos y la bitácora se conservan. Restablecer escenario ofrece exportar el historial e inicia otra sesión de datos con un evento de reinicio.

## Identidad visual

El área administrativa usa el sistema de Keyons y conserva la identidad del residencial. Los botones principales usan azul #496192 y texto blanco; salmón y terracota se reservan exclusivamente para resultados negativos. Se emplean Plus Jakarta Sans y TASA Orbiter en los rótulos. La referencia suministrada por el usuario se conserva en `public/agent-reference.png`. El lanzador de Estela se reconstruye en SVG: círculo azul, destello blanco e indicador lavanda, con fondo transparente y sin el rectángulo de la captura.

El acceso a junta directiva se retiró del selector y de la navegación; su prototipo se conserva como referencia. El condómino y el empleado conservan su lenguaje visual; el condómino recibe mejoras funcionales de comprobantes, fechas e historial.

## Arquitectura

- `src/domain/demo.ts`: comandos, validaciones, conciliación, cálculo y eventos.
- `src/domain/useDemo.ts`: persistencia versionada y confirmación de escritura antes de mostrar éxito.
- `src/components/admin/AdminWorkspace.tsx`: estructura, navegación y coordinación de diálogos.
- `src/components/admin/*View.tsx`: módulos, tabla común e historial.
- `src/components/admin/RecordEditor.tsx`, `HouseholdEditor.tsx`, `AdminWidgets.tsx`: edición y operaciones guiadas.
- `src/components/board/BoardPortal.tsx`: supervisión y acuerdos.
- `src/components/ai/AdminAgent.tsx`: agente administrativo y referencia visual.
- `src/admin.css`: sistema visual administrativo y componentes de diálogo.
- `tests/demo.test.ts`: pruebas de las reglas de negocio.

`AdminDashboard.tsx` y `PinarPayrollManager.tsx` se conservan como referencia del prototipo anterior; no son la ruta activa de administración. El nuevo panel usa una sola colección de empleados y un solo motor de cálculo, en lugar de la hoja paralela del prototipo.

## Datos y alcance de esta entrega

El estado se guarda en `localStorage` bajo `pinar.demo.v1`. No se envían pagos, correos, documentos ni consultas a un servicio de IA. La bitácora local demuestra trazabilidad, pero puede ser alterada desde el navegador. Los datos de ejemplo y las tasas son parámetros del escenario, no una validación legal o bancaria.

Los comunicados históricos de muestra permanecen visibles después de restablecer. Las nuevas publicaciones programadas se evalúan al abrir sesión o ejecutar una operación; no existe un servicio de programación en segundo plano.

Segunda etapa: ya se pueden editar jornadas por cada día, registrar y resolver vacaciones y abrir recibos y boletas imprimibles. Los PDF se guardan mediante el diálogo de impresión del navegador; también se conservan JSON y Excel. Se integraron aguinaldo y liquidación con parámetros revisables, historial y documento imprimible. Siguen pendientes una auditoría completa de accesibilidad y las pruebas de usabilidad con personas.

SheetJS se instala desde su distribución oficial 0.20.3, siguiendo https://docs.sheetjs.com/docs/getting-started/installation/nodejs/. Se reemplazó la versión antigua del registro npm y se eliminó la dependencia directa de esbuild que entraba en conflicto con Vite. `package-lock.json` fija la instalación usada en esta entrega; utilice npm para reproducirla.

## Evidencia

- `docs/capturas/administracion.png`: resumen administrativo.
- `docs/capturas/agente-escritorio.png`: conversación en escritorio.
- `docs/capturas/agente-movil.png`: conversación en pantalla de 390 × 844.

Ver `PLAN_IMPLEMENTACION.md` para el alcance y los criterios del plan.

## Horarios y vacaciones

En **Personal → Empleados → Horario por día** configure entrada, salida y descanso de cada día. El total semanal se calcula automáticamente; se admiten jornadas nocturnas y se rechazan solapamientos. Son horas de presencia sin descuento automático de pausas.

En **Personal → Vacaciones** consulte configurados, disfrutados, reservados y disponibles. Registre un intervalo para crear una solicitud pendiente. Aprobar reserva saldo; cancelar lo devuelve. Marcar como disfrutadas requiere aprobación y fecha final alcanzada, y solo descuenta una vez. Cada decisión exige motivo y se incorpora a la bitácora. El calendario permite consultar el detalle de cada fecha en móvil.

Los días se cuentan con el horario guardado en el momento de solicitar y no cambian retroactivamente al editar una jornada. No se excluyen feriados automáticamente ni se calcula el derecho legal acumulado: el total es un parámetro explícito de la demo. Los registros históricos sin desglose diario se presentan por intervalo.

Las vistas previas de **Ver recibo** y **Ver boletas** usan formatos de impresión A4 y distinguen los movimientos pendientes de los aplicados. Las nuevas boletas guardan nombre, identificación y puesto del momento del cálculo. La bitácora registra consultar un documento y abrir el diálogo de impresión; no afirma que se haya imprimido o pagado.

Código de esta etapa: `src/domain/personnel.ts`, `ScheduleEditor.tsx`, `VacationView.tsx`, `FinancialTemplates.tsx`, `FinancialDocuments.tsx` y `src/personnel.css`. Pruebas adicionales en `tests/personnel.test.ts` y `tests/documents.test.ts`.

Capturas adicionales en `docs/capturas/horario-semanal.png`, `vacaciones-movil.png`, `boletas-imprimibles.png` y `recibo-imprimible.png`. Se probó solicitar, aprobar y cancelar una reserva de cuatro días; el saldo final quedó igual al inicial.
### Vista simplificada de vacaciones

Tres vistas: Calendario, Solicitudes y Saldos. Un filtro común por persona y una acción principal para registrar. Solicitudes separa pendientes, aprobadas e historial; las decisiones y sus motivos se muestran en el detalle. El calendario admite teclado y presenta una agenda del mes o día seleccionado. En móvil se utilizan indicadores compactos sin tablas horizontales.

Capturas: docs/capturas/vacaciones-simplificadas.png y docs/capturas/vacaciones-simplificadas-movil.png. Se verificó solicitar, aprobar y cancelar; la reserva de prueba quedó liberada, conservando la trazabilidad.


## Aguinaldo y liquidación

En Personal → Aguinaldo y liquidación, seleccione persona, fechas y salarios brutos; para liquidación declare las bases y días revisados. Revise, guarde y confirme el cálculo. Cada registro conserva identidad, salarios, resultado y autoría; puede anularse con motivo y consultarse como documento imprimible. Se bloquean duplicados vigentes. No realiza pagos ni termina la relación laboral. Los días de cesantía y preaviso se ingresan explícitamente, sin aproximaciones automáticas. Consulte docs/PRESTACIONES.md para fórmulas, fuentes, alcance y pruebas.


## Accesibilidad y usabilidad

Revisión técnica aplicada: salto al contenido, foco por módulo, diálogos con ciclo de teclado, tablas con nombre y desplazamiento enfocable, contexto de acciones, contraste auxiliar y controles móviles. Estela permite salir con Tab y volver al lanzador con Escape; el menú móvil bloquea también el chat. Ver docs/ACCESIBILIDAD.md para hallazgos, evidencia y límites. Las 52 pruebas, tipos y compilación pasan. Pendientes: lector de pantalla real, zoom/colores forzados y sesiones con personas de los tres perfiles.


## Visitas aprobadas del condómino

En Mi Familia & Convivencia, autorice visitas por fecha con nombre, placa y notas opcionales. Las autorizaciones vigentes aparecen como tarjetas; las pasadas y revocadas permanecen en el historial. Revocar requiere motivo. Cada acción guarda autor, fecha y filial en la bitácora central; un condómino solo puede gestionar su propia filial. La demo no notifica a la caseta. Diseño de una columna en móvil, verificado a 390 y 320 píxeles. Se agregaron cuatro pruebas de permisos, validación, duplicados y conservación del historial (41 pruebas totales).


## Anuncios comerciales

Implementado el flujo de solicitudes desde Amenidades y revisión en Comunicaciones → Anuncios. Todos requieren aprobación y publicación manual. Administración configura tarifas y duración en Tarifas y reglas; inicialmente están por definir. Un anuncio gratuito mensual por filial con cuota del mes aplicada al 100 %, tarifa preferencial desde el 50 % y tarifa general por debajo del 50 % o para externos. Cobros separados de cuotas, historial y trazabilidad. Consulte docs/ANUNCIOS.md para reglas, límites y validación. Pasan 52 pruebas, tipos y compilación.

