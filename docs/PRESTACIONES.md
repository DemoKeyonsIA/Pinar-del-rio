# Aguinaldo y liquidación de demostración

Acceso: Administradora → Personal → Aguinaldo y liquidación → Nuevo cálculo.

## Recorrido

1. Seleccione persona y tipo; indique fechas y salarios brutos del ciclo diciembre–noviembre. Los meses sin ingreso llevan cero; un mes parcial contiene únicamente lo devengado. No se infieren doce salarios a partir del salario actual ni de boletas con períodos de texto libre.
2. Para liquidación, declare motivo, días por compensar y base diaria de vacaciones. Con responsabilidad patronal, ingrese promedio mensual de los últimos seis meses o fracción menor, preaviso pendiente de indemnización y días totales de cesantía revisados.
3. Documente la fuente de los datos y el fundamento de los parámetros. Revise el desglose y confirme la casilla para guardar.
4. Abra el detalle para confirmar la revisión, anular con motivo o consultar el documento imprimible. Guardar y confirmar son estados distintos. No se transfiere dinero, no se inactiva al empleado y no se descuentan vacaciones.

## Reglas y alcance

- Aguinaldo: suma de ingresos brutos declarados / 12, también para períodos parciales. El anual cierra el 30 de noviembre; liquidación admite un corte intermedio. Se bloquean salarios fuera de los meses trabajados.
- Vacaciones: días compensables revisados × base diaria revisada. Se declara la base por separado porque su período salarial difiere del de preaviso y cesantía. El saldo del calendario cuenta jornadas y no equivale automáticamente a días salariales compensables.
- Preaviso y cesantía: promedio mensual / 30 × días ingresados, en el escenario de pago mensual y responsabilidad patronal. Renuncia y despido sin responsabilidad no admiten esos rubros.
- Los días de indemnización se ingresan explícitamente; no existe un cálculo automático de antigüedad o de la tabla de cesantía. Tampoco se determina si jurídicamente corresponde responsabilidad patronal. Deben verificarse con los datos de la relación laboral y la orientación del MTSS.
- No se aplican porcentajes de CCSS de la planilla a estos rubros. No se compensan pagos anteriores, salarios pendientes, aportes de asociaciones ni deducciones. El resultado es un total estimado de los cuatro rubros mostrados, para contratos indefinidos del sector privado con pago mensual.
- El motor valida importes finitos no negativos, fechas reales, período, bases requeridas y motivo documentado. Los topes de entrada (30 días de preaviso y 176 días de cesantía) son límites del escenario; no sustituyen la determinación individual de los días aplicables.

## Conservación y trazabilidad

Los comandos centrales recalculan el resultado; la interfaz no puede enviar un total elegido. Cada registro guarda salarios, bases, días, identidad de la persona al calcular y autor de creación. Confirmar/anular guarda autor, fecha y motivo. La bitácora conserva cada transición y los intentos bloqueados; también registra las consultas y apertura de impresión.

Se bloquea otro aguinaldo vigente para la misma persona/año y otra liquidación vigente para la misma persona. Anular permite reemplazar conservando el registro anterior. La colección es compatible con estados locales anteriores que todavía no contienen prestaciones. Restablecer la demo elimina el escenario conforme al flujo existente.

El documento conserva los parámetros guardados y muestra su estado; el diálogo del navegador permite imprimir o guardar PDF. No se verifica el resultado físico de impresión. La persistencia y bitácora son locales y modificables desde el navegador, como en los demás módulos de la demo.

## Fuentes consultadas el 11 de noviembre de 2026

- [MTSS: calculadoras de aguinaldo y prestaciones](https://www.mtss.go.cr/tramites-servicios/calculadoras.html): referencia oficial para revisar casos y datos de entrada.
- [MTSS: criterios sobre terminación de relación laboral](https://www.mtss.go.cr/elministerio/estructura/direccion-asuntos-juridicos/pronunciamientos/daj-ae-133-08%20cuando%20la%20despiden%20o%20renuncia.pdf): fórmula de aguinaldo y distinción de rubros según causa de salida.
- [MTSS: base salarial y vacaciones](https://www.mtss.go.cr/elministerio/estructura/direccion-asuntos-juridicos/pronunciamientos/daj-ae-763-06%20MAUREN%20AGUERO%20CORTES.%20%20Vacaciones%20en%20trabadores%20ocasionales.pdf): período salarial de vacaciones y modalidad de pago.
- [Código de Trabajo, SCIJ](https://sinalevi.go.cr/ResultadosNormativa/Informacion?param1=8045&param2=8627&param3=3&param4=47056): base de promedio de salarios para indemnizaciones.

Los criterios históricos orientan las fórmulas; no certifican que esta simulación cubra todos los regímenes ni todas las reformas vigentes. Se conserva la revisión explícita de parámetros y no se presenta como liquidación oficial.

## Verificación

37 pruebas automáticas en total, tipos y compilación. Se comprobaron cálculo parcial, corte de ciclo, bases distintas, importes inválidos, permisos, duplicados, instantánea de identidad, confirmación y reemplazo tras anular. Recorrido visual de aguinaldo y liquidación en escritorio y móvil; ambos registros ficticios de prueba quedaron anulados y trazados. La vista previa imprimible se abrió; no se ejecutó una impresión física.

Capturas: `docs/capturas/liquidacion-detalle.png`, `liquidacion-movil.png` y `aguinaldo-documento.png`.
