# CTVC · Wifi Prepago

Interfaz web estática para compra de tiempo de internet en ciber café (Isla de Pascua).

## Características
- Registro e inicio de sesión (mock con `localStorage`).
- Compra de tiempo: 30 min, 1 h, 2 h y paquete personalizado.
- Resumen de compra con precios en CLP (1 h = 10.000 CLP).
- Botón “Pagar” de maqueta; inicia un cronómetro con cuenta regresiva.
- Cronómetro persiste entre recargas; al finalizar muestra aviso y corta acceso.
- Indicador superior: verde “Acceso a internet · HH:MM:SS” o rojo “Usuario sin acceso a internet”.
- Diseño responsive con Tailwind (CDN) y branding CTVC (logo + fondo).

## Estructura
- `index.html`: UI principal con tabs (Comprar, Iniciar sesión, Registrarse).
- `assets/js/app.js`: lógica SPA, sesión mock, precios y cronómetro.
- `fondo31.jpg`: fondo de pantalla.
- `icono iptvc app.png`: logo CTVC.

## Correr localmente
Opciones rápidas en Windows (PowerShell):

### 1) Abrir directamente
- Abrir `index.html` con el navegador.

### 2) Servidor local con Python (recomendado)
```powershell
cd "C:\Users\sebas\OneDrive\Desktop\sistema aeropuerto ctvc"
py -m http.server 5173
# o: python -m http.server 5173
```
Navega a `http://localhost:5173`.

### 3) Servidor local con Node.js
```powershell
cd "C:\Users\sebas\OneDrive\Desktop\sistema aeropuerto ctvc"
npx --yes serve -l 5173 .
# o: npx --yes http-server -p 5173 -c-1 .
```

## Configuración
- Tarifa por hora: editar `ratePerHour` en `assets/js/app.js` (CLP).
- Moneda: `Intl.NumberFormat('es-CL', { currency: 'CLP' })`.
- Para integrar pagos reales, reemplazar el `alert` de “Pagar” por la llamada al proveedor (Stripe/PayPal/etc.).

## Notas
- Al cerrar sesión, el cronómetro se detiene y se limpia su persistencia.
- Si recargas la página con tiempo activo, el cronómetro se restaura automáticamente.
