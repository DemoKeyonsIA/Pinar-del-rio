# Bocetos de anuncios comerciales

Prototipo visual independiente de la aplicación, preparado el 16 de noviembre de 2026. No contiene cobros, solicitudes persistentes ni publicaciones reales. Los botones de ejemplo muestran explicaciones o recorren pantallas ilustrativas; los campos no alimentan un motor de solicitudes.

Con la app en desarrollo, abrir:

http://127.0.0.1:3000/docs/bocetos/anuncios.html?view=admin

La barra superior permite alternar Administración, Amenidades y Solicitar anuncio. En Administración se puede abrir Tarifas y reglas. El recorrido del formulario incluye revisión y confirmación «Pendiente de aprobación».

## Reglas representadas

- Todos los anuncios, gratuitos o pagados y de residentes o externos, requieren revisión y aprobación de administración.
- Enviar una solicitud, pagar o aprobar su contenido no publica automáticamente el anuncio.
- Un anuncio gratuito por filial y mes con la cuota mensual aplicada al 100 %. El beneficio se consume al publicar.
- Entre el 50 % y menos del 100 % aplicado: tarifa preferencial. Menos del 50 % o externo: tarifa general.
- Tarifas sin montos definidos; duración y tratamiento de cuotas anteriores pendientes de confirmar.
- Comunicados oficiales separados de anuncios comerciales. Estado editorial y estado de cobro separados.
- Amenidades incorpora «Solicitar anuncio» y acceso a Mis anuncios. La solicitud muestra el beneficio y la revisión obligatoria antes de enviarse.

## Archivos

- `anuncios.html`: HTML/CSS y navegación del boceto, sin dependencia de un servicio externo.
- `pinar-logo.svg`: copia estática del emblema existente del proyecto.
- `renderizados/01-administracion.jpg`: solicitudes y detalle de revisión.
- `renderizados/02-tarifas.jpg`: categorías y reglas propuestas.
- `renderizados/03-amenidades-movil.jpg`: acceso a solicitar anuncio en móvil.
- `renderizados/04-solicitud-movil.jpg`: formulario adaptado a móvil.
- `renderizados/05-solicitud-escritorio.jpg`: formulario y beneficio en escritorio.
- `renderizados/06-revision.jpg`: revisión previa al envío.
- `renderizados/07-pendiente-aprobacion.jpg`: confirmación sin publicación automática.

Renderizado en navegador a 1440 px para escritorio y 390 px para móvil; comprobación adicional del formulario a 320 px sin desbordamiento horizontal. La aplicación de producción conserva sus funciones actuales; este documento es una propuesta visual para revisión.
