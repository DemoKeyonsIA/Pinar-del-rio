# Despliegue en Vercel

Publicado el 16 de noviembre de 2026.

- URL pública: https://pinar-de-rio.vercel.app
- Proyecto: `keyons/pinar-del-rio`.
- Repositorio: https://github.com/DemoKeyonsIA/Pinar-del-rio, rama `main`.
- Framework: Vite; instalación `npm ci`; compilación `npm run build`; salida `dist`.
- Node.js: 24.x, fijado en `package.json`.
- Configuración reproducible en `vercel.json`. La carpeta local `.vercel` no se versiona.

El nombre `pinar-del-rio.vercel.app` ya estaba ocupado. Se vinculó `pinar-de-rio.vercel.app` como dominio del proyecto, no únicamente como alias de un despliegue, para que siga sus publicaciones de producción futuras. No se compró un dominio ni se modificó DNS de dominios propios.

La integración del repositorio está conectada en Vercel. Los cambios futuros en `main` pueden desplegarse mediante esa integración. Los previews y las URLs técnicas de despliegue pueden tener protección de Vercel; se comprobó que la URL pública anterior abre sin iniciar sesión en Vercel.

Verificación: portada cargada, entrada al perfil de administradora y módulo Comunicaciones → Anuncios, sin errores de consola en el recorrido. Captura en `docs/capturas/vercel-publicado.jpg`.

El sitio sigue siendo una demo: perfiles simulados y persistencia en el almacenamiento local de cada navegador. No se añadió autenticación productiva, servidor de datos, pasarela de pago ni sincronización entre dispositivos. La instalación no requiere claves de servicios para ejecutar los flujos de demostración.

Los archivos locales del editor, `.env`, registros, dependencias y documentación de trabajo se excluyen de la subida por CLI mediante `.vercelignore`. La documentación y el código fuente permanecen disponibles en GitHub.
