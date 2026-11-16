# Anuncios comerciales

Implementado el 16 de noviembre de 2026. Operaciones locales de demostración; no se ejecutan transferencias, reembolsos, correos ni publicaciones en plataformas externas.

## Recorridos

- Condómino: Reservar Amenidades → Solicitar anuncio. También hay un bloque de anuncios bajo las reservas, con Mis anuncios y publicaciones comerciales vigentes. Puede guardar borrador, revisar y enviar, corregir cuando se lo soliciten, consultar decisiones y reportar pagos.
- Administración: Comunicaciones → Anuncios. Puede registrar solicitudes de filiales o externos, revisar contenido, pedir cambios, aprobar, rechazar, actualizar la tarifa, validar pagos y publicar expresamente.
- Comunicaciones → Tarifas y reglas: configure los dos montos y la duración. Se exige motivo y se conserva una versión de configuración. No se incluyeron precios ficticios como valores predeterminados.

## Beneficio y tarifa

| Condición de la filial en el mes solicitado | Aplicación |
| --- | --- |
| 100 % de la cuota aplicada y beneficio sin utilizar | Un anuncio gratuito por filial y mes |
| Entre 50 % y menos del 100 % aplicado | Tarifa preferencial |
| Menos de 50 % o solicitante externo | Tarifa general |
| Cuota completa con beneficio ya utilizado | Tarifa preferencial para anuncios adicionales |

Se calcula con los importes efectivamente aplicados a las facturas regulares emitidas en ese mes, excluyendo saldos de apertura. No se presume que una filial pagó la cuota porque su saldo actual sea cero. Si no hay factura del mes, el beneficio no se habilita. Los comprobantes de cuota pendientes no cuentan como pago aplicado. La demo no crea esas facturas automáticamente con el cambio de mes.

La cotización guarda categoría, porcentaje de cuota, monto y versión de tarifas. Si no se ha configurado la tarifa, se admite la solicitud con «Por definir», pero no se permite reportar un cobro ni publicar. Cambiar la configuración no reescribe cotizaciones existentes; administración puede actualizarlas con motivo, antes de tener pagos pendientes o validados.

## Publicación exclusivamente manual

Enviar y aprobar contenido son acciones distintas de publicar. El flujo de pago tiene su propia revisión. Los anuncios gratuitos también necesitan aprobación y publicación explícitas de administración.

Publicar comprueba contenido aprobado, mes actual, duración configurada, condición vigente de la cuota y pago validado si corresponde. El beneficio gratuito se vuelve a comprobar dentro de esa operación, por lo que dos solicitudes gratuitas pendientes de una misma filial no pueden consumirlo dos veces. Retirar una publicación conserva el beneficio consumido y su historial.

La duración se configura entre 1 y 90 días, pero cada publicación termina como máximo el último día del mes solicitado. No se publica ni renueva automáticamente. Los anuncios vencidos dejan de mostrarse como vigentes sin eliminar su registro. La fecha civil se calcula para Costa Rica, incluso cuando la marca UTC pertenece al día siguiente.

## Cobros y trazabilidad

Los pagos publicitarios tienen un registro independiente de los pagos condominales y no concilian ni reducen la deuda de mantenimiento. El monto se toma de la cotización, no de un valor ingresado libremente al reportar. Se bloquean referencias ya utilizadas, incluidos pagos de cuota.

El comprobante es opcional: JPG, PNG o PDF de hasta 2 MB. Administración valida o rechaza con motivo. Se puede anular el registro de un pago, con motivo y conservando el historial; esa acción no ejecuta un reembolso. Para anular un pago de un anuncio publicado hay que retirar primero el anuncio.

La bitácora registra creación, envío, correcciones, revisión, tarifa, pago y publicación. La solicitud conserva solicitante, autores, fechas y revisiones. Los archivos adjuntos no se copian dentro de los cambios de la bitácora. Se mantiene la limitación de auditoría local de la demo: el almacenamiento del navegador puede alterarse externamente.

## Alcance y validación

- Los condóminos gestionan únicamente anuncios de su propia filial. Los externos se registran desde administración; no se añadió un login público nuevo.
- Los comunicados oficiales conservan su gestión y su colección; los anuncios comerciales están separados y se identifican como tales.
- Sin integración de pasarela de pago, facturación fiscal o notificaciones externas. Las decisiones se consultan en Mis anuncios.
- Se aceptan JPG y PNG para la imagen del anuncio; contenido renderizado como texto, sin HTML del solicitante.
- Se verificaron permisos, umbrales, publicación explícita, beneficio único, referencia duplicada, correcciones, cotizaciones, fecha local y conservación de adjuntos fuera de la bitácora. 52 pruebas automáticas, tipos y compilación correctos.
- Se recorrió en navegador envío → aprobación de contenido → reporte → validación de pago → publicación manual → consulta del anuncio en el portal. Se comprobó bloqueo de publicación sin pago. Formulario revisado a 390 y 320 px sin desbordamiento horizontal.
- La prueba del navegador se hizo en `localhost:3000`, cuyo almacenamiento es independiente de `127.0.0.1:3000`. Sus precios y registros son ficticios de prueba; el escenario habitual del usuario conserva sus tarifas sin configurar.

Código: `src/domain/advertising.ts`, `src/components/advertising/`, integración con Comunicaciones y Amenidades, y `tests/advertising.test.ts`. Las imágenes de prueba están en `docs/capturas/anuncios-administracion-implementado.jpg` y `anuncios-solicitud-movil-implementado.jpg`. Los bocetos originales se conservan en `docs/bocetos/`.
