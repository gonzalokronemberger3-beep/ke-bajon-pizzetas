# Ke Bajón! 🍕

App de pedidos de pizzetas armada en React + Vite + Tailwind, con mascota,
sistema de puntos/recompensas guardado en el teléfono, y lista para
instalarse como app (PWA) en Android e iPhone.

## Qué tenés en esta carpeta

```
ke-bajon-app/
├── index.html          → HTML raíz (título, ícono, metadatos)
├── package.json        → dependencias y scripts
├── vite.config.js       → configuración de Vite + Tailwind
├── public/
│   ├── manifest.json    → hace que la app se pueda "instalar"
│   ├── sw.js             → service worker (funciona offline)
│   └── icon-*.png        → íconos de la app
└── src/
    ├── main.jsx          → punto de entrada
    ├── index.css         → estilos globales y fuentes
    └── App.jsx           → toda la app (menú, carrito, recompensas, etc.)
```

---

## 1. Requisitos

Instalar **Node.js** (versión 18 o más nueva). Se descarga gratis acá:
https://nodejs.org (elegí la versión "LTS").

Para confirmar que quedó instalado, abrí una terminal y escribí:

```
node -v
```

Te tiene que mostrar un número de versión (ej. `v20.11.0`).

---

## 2. Probarla en tu computadora

Abrí una terminal **dentro de la carpeta** `ke-bajon-app` y corré:

```
npm install
npm run dev
```

Te va a mostrar un link como `http://localhost:5173`. Abrilo en el
navegador y ya tenés la app funcionando. Cada vez que quieras volver a
probarla, repetís `npm run dev` (el `npm install` solo hace falta la
primera vez).

Después del `npm install`, es buena práctica correr también:

```
npm audit
```

Eso te avisa si alguna de las librerías usadas tiene una vulnerabilidad
conocida. Si aparece algo, probá `npm audit fix`.

---

## 3. Publicarla con un link real (gratis)

Para que cualquiera pueda entrar desde su celular con un link (sin que
vos tengas la computadora prendida), la forma más simple y gratuita es
**Vercel** o **Netlify**. Ambos funcionan igual, elegí uno:

### Opción Vercel (recomendada, muy simple)
1. Creá una cuenta gratis en https://vercel.com (podés entrar con GitHub,
   Google o email).
2. Instalá su herramienta desde la terminal: `npm install -g vercel`
3. Dentro de la carpeta `ke-bajon-app`, corré: `vercel`
4. Te va a hacer un par de preguntas (aceptá las opciones por defecto
   con Enter). Al final te da un link público, por ejemplo:
   `https://ke-bajon-app.vercel.app`
5. Ese link ya es tu app online, anda a compartirlo.

### Opción Netlify (alternativa, arrastrar y soltar)
1. Corré `npm run build` en la carpeta del proyecto (esto genera una
   carpeta `dist/` con la app ya lista).
2. Entrá a https://app.netlify.com/drop
3. Arrastrá la carpeta `dist` a esa página.
4. Te da un link público al instante.

---

## 4. Instalarla como app en el celular

Una vez que tenés el link público (paso 3), en el celular:

**Android (Chrome):**
1. Abrí el link.
2. Tocá los 3 puntitos de arriba a la derecha.
3. Elegí "Instalar app" o "Agregar a pantalla de inicio".

**iPhone (Safari):**
1. Abrí el link.
2. Tocá el ícono de compartir (el cuadradito con la flecha hacia arriba).
3. Elegí "Agregar a pantalla de inicio".

Con eso el logo de Ke Bajón! queda como ícono en el teléfono, abre a
pantalla completa (sin la barra del navegador) y funciona aunque se
corte internet un ratito, gracias al `service worker` incluido.

> Esto es una "PWA" (Progressive Web App): se instala y se siente como
> una app nativa, pero no pasa por Google Play ni App Store. Si más
> adelante querés subirla a esas tiendas, se puede envolver este mismo
> proyecto con una herramienta llamada **Capacitor**
> (https://capacitorjs.com) para generar un `.apk` / `.ipa` reales — es
> un paso aparte, avisame si querés que te arme esa parte también.

---

## 5. Cosas que capaz quieras cambiar

Todo el contenido vive en `src/App.jsx`, arriba del todo, en unas listas
fáciles de editar:

- **`FLAVORS`**: los sabores de pizzeta (nombre, descripción, si es
  vegetariana o picante).
- **`BOX_SIZES`**: los precios y tamaños de las cajas (x3, x4, x6).
- **`ADDONS`**: los extras y sus precios.
- **`REWARDS`**: las recompensas del programa de puntos.

Los colores de la marca están arriba de todo en el objeto `COLORS`.

Los puntos y sellos de cada usuario se guardan en su propio celular
(en la memoria del navegador), así que cada cliente tiene su propio
progreso.

---

## 6. Seguridad

El archivo `SEGURIDAD.md` explica, en criollo, qué está protegido hoy
y qué falta sumar cuando proceses pedidos y pagos reales. Vale la pena
leerlo antes de lanzarla al público.

---

## 7. Publicarla en un servidor propio (en vez de Vercel)

Vercel es la forma más simple y gratis. Pero si en algún momento
querés tener la app en un servidor que sea tuyo (un VPS que alquiles,
por ejemplo en DigitalOcean, Hetzner o cualquier proveedor), acá está
el camino:

### Paso 1 — Generar los archivos finales
En tu compu, dentro de la carpeta `ke-bajon-app`:
```
npm run build
```
Esto crea una carpeta `dist/` con la app ya "compilada" — son puros
archivos HTML/CSS/JS, no necesitan Node corriendo para funcionar.

### Paso 2 — Conseguir un servidor
Alquilás un VPS (servidor virtual) en algún proveedor — por ejemplo
DigitalOcean, Hetzner o Linode tienen planes desde pocos dólares por
mes. Elegís la opción más básica, con Ubuntu.

### Paso 3 — Instalar un servidor web (nginx)
Conectado al VPS por SSH:
```
sudo apt update
sudo apt install nginx -y
```

### Paso 4 — Subir la carpeta `dist`
Desde tu compu, con el VPS ya prendido (reemplazá `usuario` y `tu-servidor` por los datos que te dio tu proveedor):
```
scp -r dist/* usuario@tu-servidor:/var/www/ke-bajon-app
```

### Paso 5 — Apuntar nginx a esa carpeta
En el servidor, editá (o creá) el archivo de configuración de nginx
para que sirva esos archivos, y reiniciá nginx:
```
sudo systemctl restart nginx
```

### Paso 6 — Dominio y HTTPS
Apuntás tu dominio (ej. `kebajon.com`) al VPS desde donde compraste el
dominio, y usás **Certbot** (gratis) para HTTPS:
```
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kebajon.com
```

Esto es bastante más manual que Vercel — requiere mantenimiento
(actualizaciones de seguridad del servidor, por ejemplo). Para la
mayoría de los casos, **Vercel sigue siendo la opción recomendada**;
un servidor propio tiene sentido recién cuando sumes un backend real
(pagos, base de datos) que necesite correr en algún lado.

