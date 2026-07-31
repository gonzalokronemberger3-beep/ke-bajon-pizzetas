# Seguridad de Ke Bajón! 🔒

Este documento explica, en criollo, qué tan "seguro" está el proyecto hoy y
qué falta para cuando proceses pedidos y pagos reales.

## Qué es esta app hoy

Es una app que corre **entera en el navegador del cliente**: no tiene
servidor propio, no tiene base de datos, no cobra tarjetas ni guarda
contraseñas. Eso achica muchísimo lo que se puede atacar.

## Qué ya está cubierto

- **Sin datos sensibles guardados**: en el teléfono de cada cliente solo
  se guardan sus puntos y sellos de recompensas — nada de tarjetas,
  contraseñas ni datos personales.
- **Protegida contra XSS**: React (la tecnología con la que está hecha)
  escapa automáticamente cualquier texto que se muestra en pantalla, así
  que no hay forma de inyectar código a través de los campos de texto
  (dirección, aclaraciones).
- **Sin claves ni contraseñas en el código**: no hay ningún secreto
  (API key, token, credencial) escondido en los archivos.
- **Cabeceras de seguridad HTTP** (`vercel.json`): bloquean que la página
  se pueda incrustar en otro sitio (anti-clickjacking), limitan de dónde
  puede cargar scripts/estilos/imágenes (Content-Security-Policy), y
  fuerzan HTTPS.
- **HTTPS automático**: si la publicás en Vercel o Netlify, ya viaja
  todo cifrado sin que tengas que configurar nada.
- **Entradas con límite de caracteres**: los campos de dirección y
  aclaraciones tienen un tope, para evitar datos gigantes o mal
  intencionados guardados en el teléfono del cliente.
- **Lectura defensiva del progreso guardado**: si alguien manipula a
  mano los datos guardados en su navegador, la app los valida y usa
  valores por defecto en vez de romperse.

## Qué falta para el siguiente nivel (cuando haya pedidos y pagos reales)

Ahora mismo el botón "Confirmar pedido" simula la compra: no hay pagos
de verdad ni se manda el pedido a ningún lado todavía. Cuando quieras
que la gente pague y el pedido llegue de verdad a la cocina, vas a
necesitar sumar:

1. **Un backend propio** (servidor + base de datos) que reciba los
   pedidos, valide todo del lado del servidor (nunca confiar solo en lo
   que valida el navegador) y guarde el historial de forma segura.
2. **Un procesador de pagos certificado** en vez de manejar tarjetas
   vos mismo — en Argentina lo más usado es **Mercado Pago Checkout
   Pro**, que se encarga de la parte delicada (nunca ves ni guardás el
   número de tarjeta).
3. **Límite de pedidos por usuario/tiempo** (rate limiting) para evitar
   que alguien mande miles de pedidos falsos seguidos.
4. **Términos y condiciones / política de privacidad**, obligatorios si
   vas a guardar datos de clientes (nombre, teléfono, dirección) en un
   backend real.
5. Mantener las dependencias al día: después de `npm install`, correr
   de tanto en tanto:
   ```
   npm audit
   npm outdated
   ```
   y actualizar lo que haga falta.

Si en algún momento querés avanzar con el backend y los pagos reales,
avisame y lo armamos como el siguiente paso — es un proyecto aparte
más grande (servidor, base de datos, integración con Mercado Pago).
