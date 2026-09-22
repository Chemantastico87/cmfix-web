# CM FIX — Plataforma Web Profesional y SaaS de Gestión de Reparaciones

Plataforma web integral de captación, presupuestación automática y gestión técnica para el taller informático y de microelectrónica **CM FIX** ("Tu tecnología en buenas manos").

---

## 🚀 Arquitectura y Tecnologías (Coste 0 €)

El proyecto está diseñado bajo un modelo de **coste 0 €** con posibilidad de escalar sin rehacer código:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS.
- **Identidad de Marca**: Integración nativa del logotipo oficial `CMfix.png` (estética cyber neon-green, dark carbon y acentos metálicos plateados).
- **Backend & Base de Datos**: PostgreSQL mediante Supabase (Auth, Database, Storage, Row Level Security).
- **Capa Híbrida Resiliente**: Funciona de inmediato tanto en modo local reactivo (sin dependencias forzosas) como conectado a Supabase en la nube.
- **PWA**: Instalable en Android, iPhone y PC (`manifest.webmanifest`, service worker offline e iconos de marca).
- **Generador PDF**: Motor vectorial para presupuestos con desglose fiscal, mano de obra, repuestos y cláusulas legales.

---

## 📁 Estructura de Rutas y Módulos

### A) Web Pública de Clientes
- `/`: Portada con Hero, logotipo oficial, banner "¿Qué necesitas reparar?", catálogo de servicios y garantías.
- `/servicios`: Catálogo por familias (Móviles, Portátiles, Torres PC, Tablets, Software).
- `/presupuesto`: Presupuestador dinámico interactivo por pasos (Categoría -> Marca -> Modelo -> Avería -> Desglose -> Datos de contacto).
- `/presupuesto/:id`: Ficha digital oficial del presupuesto (Aceptación en 1 clic, rechazo, descarga de PDF homologado).
- `/seguimiento` y `/seguimiento/:id`: Buscador de estado de reparación con timeline visual interactivo y código QR para móvil.
- `/contacto`: Horarios, dirección física del taller, llamada directa y chat de WhatsApp con plantilla personalizada.
- `/privacidad`, `/cookies`, `/aviso-legal`: Textos legales conforme al RGPD y LSSI-CE.
- `/login`: Portal de acceso seguro para administradores y técnicos de taller.

### B) Panel de Administración (/admin)
- `/admin`: Dashboard ejecutivo con saludo matutino ("Buenos días, CM FIX"), tarjetas de alerta prioritaria (🔴 Presupuestos pendientes, 🟠 Reparaciones en curso, 🟢 Reparaciones listas, ⚠️ Stock bajo), KPIs de facturación y beneficio estimado.
- `/admin/reparaciones`: Gestión técnica en modo **Kanban** y **Lista**, con transición de estados (`RECIBIDO` hasta `ENTREGADO`), generador de código QR, notas públicas/internas y botón de aviso directo por WhatsApp.
- `/admin/presupuestos`: Bandeja de presupuestos con conversión a reparación en taller con un solo clic.
- `/admin/clientes`: CRM con historial de reparaciones, teléfono, email y gasto acumulado.
- `/admin/inventario`: Control de repuestos con alertas automáticas cuando `stock <= min_stock`.
- `/admin/proveedores`: Directorio de distribuidores y proveedores de componentes.
- `/admin/precios`: Matriz de precios administrable con cálculo automático de margen neto.
- `/admin/configuracion`: Ajustes fiscales (CIF, IVA 21%), dirección, teléfono, garantía legal y plantillas de notificación.

---

## 🛠️ Instalación y Ejecución en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Compilar bundle de producción (validación TypeScript y build)
npm run build

# 4. Probar build en local
npm run preview

# 5. Cargar o sincronizar datos de prueba
npm run seed
```

---

## ☁️ Guía de Despliegue Gratuito (Coste 0 €)

### 1. Base de Datos en Supabase (Gratuito)
1. Entra en [supabase.com](https://supabase.com) y crea una cuenta gratuita.
2. Crea un nuevo proyecto (ej. `cmfix-db`).
3. Ve a **SQL Editor** en el panel lateral de Supabase.
4. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repositorio, copia todo el contenido y pulsa **RUN**.
5. Ve a **Project Settings -> API** y copia:
   - `Project URL`
   - `anon public key`
6. En tu archivo `.env` local o en las variables de entorno de Vercel añade:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-clave-anon"
   ```

### 2. Alojamiento en Vercel (Gratuito)
1. Sube este repositorio a tu cuenta de GitHub.
2. Entra en [vercel.com](https://vercel.com) y pulsa **"Add New Project"**.
3. Importa el repositorio de CM FIX.
4. En **Environment Variables**, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
5. Pulsa **Deploy**.
6. En menos de 2 minutos tu web estará publicada con certificado SSL gratuito (ej. `cmfix.vercel.app` o tu dominio personalizado).

---

## 🔐 Roles y Acceso de Demostración

En la pantalla `/login` dispones de dos accesos directos configurados para evaluación inmediata:
- **Rol Administrador (Chema)**: Acceso total a finanzas, configuración, catálogo y reparaciones.
- **Rol Técnico**: Acceso operativo a reparaciones, clientes e inventario.
