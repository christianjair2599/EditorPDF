# DocuFlow — Documentación del Proyecto

> **Versión:** 1.0  
> **Stack:** Next.js 15 + FastAPI (Python)  
> **Autor:** Christian Mayanga  
> **Estado:** Desarrollo activo

---

## Índice

1. [Identidad del producto](#1-identidad-del-producto)
2. [Arquitectura general](#2-arquitectura-general)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Backend — FastAPI](#4-backend--fastapi)
5. [Frontend — Next.js](#5-frontend--nextjs)
6. [Sistema de autenticación](#6-sistema-de-autenticación)
7. [Sistema de planes (Freemium)](#7-sistema-de-planes-freemium)
8. [Internacionalización (i18n)](#8-internacionalización-i18n)
9. [Modo oscuro](#9-modo-oscuro)
10. [Seguimiento de actividad](#10-seguimiento-de-actividad)
11. [Variables de entorno](#11-variables-de-entorno)
12. [Dependencias](#12-dependencias)
13. [Cómo ejecutar el proyecto](#13-cómo-ejecutar-el-proyecto)
14. [Roadmap y mejoras futuras](#14-roadmap-y-mejoras-futuras)

---

## 1. Identidad del producto

### Nombre
**DocuFlow**

### Propuesta de valor
DocuFlow es una plataforma web all-in-one para editar, convertir y manipular documentos PDF y otros formatos de archivo. Permite a cualquier usuario, sin instalar nada, realizar operaciones complejas sobre documentos directamente desde el navegador, con la potencia de la inteligencia artificial integrada.

### Posicionamiento
- **Para usuarios ocasionales:** Herramienta gratuita, sin registro, de uso inmediato.
- **Para usuarios power:** Plan Premium que elimina todos los límites y desbloquea funcionalidades avanzadas (OCR, IA, marca de agua, lote, compartir).

### Paleta visual
| Elemento | Valor |
|---|---|
| Color primario | Gradiente `from-blue-600 to-purple-600` |
| Color de acento premium | Gradiente `from-yellow-400 to-orange-500` |
| Fondo hero | Clase CSS `hero-bg` (azul/púrpura oscuro) |
| Tipografía | Sistema por defecto + `font-black` para headings |
| Modo oscuro | Sí, clase Tailwind `dark:` activada por toggle |

### Identidad de marca
- **Logo:** Cuadrado redondeado con gradiente azul-púrpura, letra "E" en blanco
- **Tagline:** *"Edita y Convierte PDFs al instante"*
- **Badge:** *"Powered by Claude AI · Gratis para empezar"*
- **Tono:** Directo, técnico pero accesible, con elementos visuales modernos

### Idiomas soportados
- Español (por defecto, detectado automáticamente)
- Inglés (activable desde la Navbar)

### Monedas soportadas
El precio del plan Premium se muestra en la moneda local del usuario según su `navigator.language`:
USD, EUR, MXN, ARS, BRL, GBP, COP, CLP, PEN, CAD, AUD, entre otras.

---

## 2. Arquitectura general

```
┌─────────────────────────────────────────────────────┐
│                   NAVEGADOR (Cliente)                │
│                                                     │
│  Next.js 15 (App Router)  ←→  localStorage         │
│  React 19 + Tailwind CSS       (plan, idioma,       │
│  TypeScript                     actividad)          │
│                                                     │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐             │
│  │ /editor │ │/converter│ │/merge-   │             │
│  │         │ │          │ │split     │             │
│  └────┬────┘ └────┬─────┘ └────┬─────┘            │
│       └───────────┴────────────┘                   │
│                   │ axios                           │
└───────────────────┼─────────────────────────────────┘
                    │ HTTP (localhost:8000)
┌───────────────────┼─────────────────────────────────┐
│              SERVIDOR (Backend)                     │
│                                                     │
│  FastAPI (Python)                                   │
│  PyMuPDF · pdf2docx · python-pptx · openpyxl        │
│  Pillow · ReportLab · EasyOCR · Anthropic Claude   │
│                                                     │
│  SQLite (/backend/DocuFlow.db)                    │
│  Archivos temporales (/backend/uploads/)           │
└─────────────────────────────────────────────────────┘
```

**Flujo básico:**
1. El usuario sube un archivo desde la UI (Next.js)
2. El frontend llama a la API del backend vía axios
3. El backend procesa el archivo (conversión, edición, compresión, etc.)
4. El archivo resultante se guarda en `/backend/uploads/`
5. El frontend descarga el resultado directamente

---

## 3. Estructura de carpetas

```
DocuFlow/
│
├── backend/                         # Servidor Python
│   ├── main.py                      # Endpoints principales (1100+ líneas)
│   ├── routes.py                    # Registro de usuarios y tracking de uso
│   ├── models.py                    # Modelo SQLAlchemy (User)
│   ├── schemas.py                   # Esquemas Pydantic (UserCreate, UserResponse)
│   ├── database.py                  # Configuración SQLite
│   ├── requirements.txt             # Dependencias Python
│   ├── DocuFlow.db                 # Base de datos SQLite
│   └── uploads/                     # Archivos subidos y generados
│
└── frontend/                        # Aplicación Next.js
    ├── app/                         # App Router de Next.js
    │   ├── layout.tsx               # Layout raíz (fuentes, Providers)
    │   ├── page.tsx                 # Página de inicio (Home)
    │   ├── global.css               # Estilos globales y clases custom
    │   ├── editor/
    │   │   └── page.tsx             # Editor de texto PDF
    │   ├── converter/
    │   │   └── page.tsx             # Convertidor universal
    │   ├── merge-split/
    │   │   └── page.tsx             # Herramientas PDF (merge, split, compress, OCR, watermark)
    │   ├── pricing/
    │   │   └── page.tsx             # Página de planes y precios
    │   ├── profile/
    │   │   └── page.tsx             # Perfil del usuario
    │   ├── login/
    │   │   └── page.tsx             # Página de inicio de sesión
    │   └── api/
    │       ├── auth/[...nextauth]/
    │       │   └── route.ts         # Handler NextAuth (Google OAuth)
    │       ├── api.ts               # Configuración del cliente axios
    │       └── upload.ts            # Funciones de llamada a la API backend
    │
    ├── components/
    │   ├── Navbar.tsx               # Barra de navegación principal
    │   ├── Providers.tsx            # Wrapper: LocaleProvider + ThemeProvider + SessionProvider
    │   ├── LocaleProvider.tsx       # Contexto de idioma y moneda
    │   ├── ThemeProvider.tsx        # Contexto de modo oscuro
    │   ├── DarkModeToggle.tsx       # Botón toggle claro/oscuro
    │   ├── PremiumGate.tsx          # Modal de bloqueo + hook usePremiumGate + DailyUsageBanner
    │   └── SessionProviderWrapper.tsx
    │
    ├── lib/
    │   ├── plan.ts                  # Lógica de plan Free/Premium (localStorage)
    │   ├── i18n.ts                  # Traducciones ES/EN + detección de moneda
    │   └── activity.ts              # Historial de actividad del usuario
    │
    ├── public/                      # Archivos estáticos
    ├── package.json
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 4. Backend — FastAPI

### Servidor
- **Framework:** FastAPI 0.115
- **Puerto:** `8000`
- **CORS:** Habilitado para `http://localhost:3000`
- **Almacenamiento:** Archivos temporales en `/backend/uploads/`, base de datos SQLite

### Endpoints

#### Archivos y procesamiento

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/hello` | Health check — responde `{message: "Hello World"}` |
| `POST` | `/upload/` | Sube un archivo al servidor, retorna `{message, filename, file_path}` |
| `GET` | `/download/{filename}` | Descarga un archivo del directorio uploads |
| `POST` | `/convert-any/` | Conversión universal entre formatos. Recibe: `file`, `output_format`. Retorna: `{output_file}` |
| `POST` | `/convert/` | Conversión legacy PDF→DOCX |
| `POST` | `/edit/` | Anotación simple de texto sobre PDF. Recibe: `file`, `x`, `y`, `fontsize`, `color`, `text` |
| `POST` | `/extract/` | Extrae bloques de texto de un PDF. Retorna lista de bloques con `id, page, x0, y0, x1, y1, text, font_size, color` |
| `POST` | `/edit-blocks/` | Aplica ediciones a múltiples bloques. Recibe: `file_id`, `edits` (JSON). Retorna: `{output_file}` |
| `POST` | `/improve-text/` | Mejora un texto con Claude AI. Recibe: `{text}`. Retorna: `{improved_text}` |
| `POST` | `/merge-pdf/` | Fusiona múltiples PDFs en uno. Recibe: lista de `files`. Retorna: `{output_file}` |
| `POST` | `/split-pdf/` | Extrae un rango de páginas. Recibe: `file`, `start_page`, `end_page`. Retorna: `{output_file}` |
| `POST` | `/compress-pdf/` | Comprime PDF o imagen. Recibe: `file`, `quality` (0=mínima, 3=máxima). Retorna: `{output_file}` |
| `POST` | `/ocr-pdf/` | OCR sobre PDF escaneado o imagen. Retorna: `{output_file}` (archivo TXT) |
| `POST` | `/watermark-pdf/` | Añade marca de agua diagonal. Recibe: `file`, `text`, `opacity`, `font_size`, `color`. Retorna: `{output_file}` |
| `POST` | `/share/` | Genera token UUID para compartir. Recibe: `file`. Retorna: `{token, filename}` |

#### Usuarios y tracking

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/register` | Registra un usuario. Recibe: `{email, password}`. Retorna: `{id, email, usage_count}` |
| `POST` | `/increment-usage/{user_id}` | Incrementa el contador de uso diario de un usuario |

### Formatos de conversión soportados

| Origen | Destinos posibles |
|--------|------------------|
| PDF | DOCX, PPTX, XLSX, CSV, JPG, PNG, WEBP, BMP, TIFF, TXT, HTML, JSON, XML |
| DOCX / DOC | PDF, PPTX, XLSX, CSV, TXT, HTML, JSON, XML, MD |
| PPTX / PPT | PDF, DOCX, XLSX, CSV, TXT, HTML, JSON, XML |
| XLSX / XLS | CSV, JSON, XML, DOCX, PPTX, PDF, HTML, TXT |
| CSV | XLSX, JSON, XML, DOCX, PPTX, PDF, HTML, TXT |
| JPG / PNG / WEBP / BMP / GIF / TIFF | PDF, otros formatos de imagen, ICO |
| TXT / HTML | PDF, DOCX, PPTX, XLSX, CSV, JSON, XML, MD |

---

## 5. Frontend — Next.js

### Páginas

#### `/` — Página de inicio
Landing page principal. Contiene:
- **Hero:** Titular, descripción, CTAs, pills de formatos soportados
- **Features:** 4 tarjetas de funcionalidades (Editor, Convertidor, IA, Herramientas)
- **Proceso:** 3 pasos ilustrados
- **Formatos:** Grid visual de formatos soportados
- **Pricing Teaser:** Comparativa Free vs Premium con precio localizado
- **CTA Final:** Llamada a la acción personalizada (nombre del usuario si está logueado)
- **Footer:** Copyright, estado del sistema

#### `/editor` — Editor de PDF
Flujo:
1. El usuario sube un PDF
2. Se llama a `/extract/` para obtener los bloques de texto
3. Se renderiza el PDF con los bloques superpuestos (cajas editables)
4. El usuario hace clic en un bloque → edita el texto
5. Opcionalmente, puede usar **"Mejorar con IA"** (llama a `/improve-text/` → Claude)
6. Al aplicar cambios, se llama a `/edit-blocks/` → descarga el PDF modificado

Funcionalidades:
- Extracción de texto por bloques con coordenadas exactas
- Edición inline de texto, color y tamaño de fuente
- Mejora con IA (gateado por plan Premium)
- Control de operaciones diarias (`canOperate()`)

#### `/converter` — Convertidor universal
Flujo:
1. El usuario selecciona el formato de salida
2. Sube uno o varios archivos (batch solo en Premium)
3. Se llama a `/convert-any/` por cada archivo
4. Vista previa de imagen si el resultado es una imagen
5. Botón de descarga del archivo convertido
6. Opcionalmente, generar enlace de compartir (Premium)

Funcionalidades:
- 20+ formatos de entrada y salida
- Conversión en lote (Premium)
- Vista previa del resultado
- Compartir con enlace (Premium)
- Control de tamaño de archivo y límite de operaciones

#### `/merge-split` — Herramientas PDF
Herramientas disponibles mediante pestañas/selector:

| Herramienta | Descripción | Plan |
|-------------|-------------|------|
| Merge | Fusionar múltiples PDFs | Hasta 2 gratis / más en Premium |
| Split | Extraer rango de páginas | Gratis |
| Compress | Comprimir PDF/imagen | Gratis |
| OCR | Extraer texto de imágenes/PDFs escaneados | Premium |
| Watermark | Añadir marca de agua personalizada | Premium |

Cada herramienta:
- Verifica el plan antes de ejecutar
- Llama al endpoint correspondiente del backend
- Muestra el botón de descarga con el resultado
- Permite compartir el resultado (Premium)

#### `/pricing` — Planes y precios
- Tarjeta **Free** ($0/mes): lista de funciones incluidas y bloqueadas
- Tarjeta **Premium** (precio localizado): todas las funciones habilitadas
- **Demo mode:** botón que activa el plan Premium en localStorage para prueba de 7 días
- **Tabla comparativa** de 12 características
- **FAQ** expandible (4 preguntas/respuestas)
- El precio del plan Premium se formatea automáticamente con `Intl.NumberFormat` según la moneda detectada

#### `/profile` — Perfil
- Muestra historial de actividad (guardado en localStorage)
- Estadísticas de uso (total de operaciones, conversiones, ediciones)
- Preferencias guardadas (último formato usado, última fuente)

#### `/login` — Login
- Página de inicio de sesión con Google OAuth vía NextAuth

### Componentes clave

#### `<Navbar />`
Barra de navegación fija (sticky) con:
- Logo con enlace al inicio
- Links de navegación: Editor, Convertidor, Herramientas, Precios
- Badge de plan (`PlanBadge`): muestra "👑 PRO" o "↑ Premium"
- Toggle de idioma: `🇪🇸 ES` / `🇺🇸 EN` (visible en desktop, en dropdown en mobile)
- Toggle de modo oscuro (`DarkModeToggle`)
- Autenticación: botón "Iniciar sesión" (Google) o dropdown de usuario con avatar, nombre, email y opciones

Comportamiento visual:
- Fondo transparente en el hero (home) sin scroll
- Fondo `bg-white/90` con `backdrop-blur` en el resto de páginas y al hacer scroll

#### `<PremiumGate />` y `usePremiumGate()`
Sistema de control de acceso a funciones Premium.

**Hook `usePremiumGate(feature)`:**
```typescript
const gate = usePremiumGate("ocr");
// gate.guard(fn) — ejecuta fn solo si el usuario tiene Premium
// gate.modal      — elemento JSX del modal de upgrade
// gate.open       — estado del modal
```

**`<DailyUsageBanner />`:** Barra de progreso de operaciones usadas en el día (oculta en Premium).

**`<PremiumModal />`:** Modal que aparece al intentar usar una función bloqueada, con:
- Ícono e información de la función
- Lista de beneficios Premium
- CTA "Ver planes y precios →"

#### `<LocaleProvider />` y `useLocale()`
Contexto de idioma y moneda. Ver sección [Internacionalización](#8-internacionalización-i18n).

---

## 6. Sistema de autenticación

**Proveedor:** Google OAuth 2.0 via NextAuth 4

**Flujo:**
1. Usuario hace clic en "Iniciar sesión"
2. Redirección a Google (`signIn("google")`)
3. Google autentica y redirige con token
4. NextAuth crea la sesión en el cliente
5. `useSession()` retorna `{data: session}` con `user.name`, `user.email`, `user.image`

**Archivos relevantes:**
- `/app/api/auth/[...nextauth]/route.ts` — configuración del handler
- `SessionProviderWrapper.tsx` — envuelve la app con `<SessionProvider>`
- `Navbar.tsx` — consume `useSession()` para mostrar el estado

**Notas de integración:**
- La sesión de NextAuth (Google) **no está integrada** con la tabla de usuarios del backend (`routes.py`). Son sistemas paralelos independientes.
- El seguimiento de operaciones y plan se gestiona íntegramente en `localStorage`.

---

## 7. Sistema de planes (Freemium)

### Planes

| Característica | Free | Premium |
|---|---|---|
| Operaciones por día | **4** | Ilimitadas |
| Tamaño máximo de archivo | 5 MB | 50 MB |
| Conversión de archivo | 1 a la vez | En lote |
| Formatos soportados | Todos | Todos |
| Editor de texto PDF | ✓ | ✓ |
| Dividir y comprimir PDF | ✓ | ✓ |
| Fusionar PDFs | Hasta 2 | Ilimitados |
| OCR | ✕ | ✓ |
| Mejora con IA | ✕ | ✓ |
| Marca de agua | ✕ | ✓ |
| Compartir con enlace | ✕ | ✓ |
| Soporte | Comunidad | Prioritario |

### Precio
**$9 USD / mes** — mostrado en la moneda local del usuario.

### Implementación técnica

**`frontend/lib/plan.ts`** — lógica central:

```typescript
// Estado guardado en localStorage bajo la clave "DocuFlow_plan"
interface PlanState {
  plan: "free" | "premium";
  dailyOps: number;        // operaciones usadas hoy
  lastReset: string;       // fecha YYYY-MM-DD del último reset
}

// Funciones públicas
getPlan()                         // → "free" | "premium"
setPlan(plan)                     // guarda plan en localStorage
canUse(feature: PremiumFeature)   // → true si el usuario puede usar la función
canOperate()                      // → true si hay operaciones disponibles hoy
fileSizeAllowed(bytes)            // → true si el archivo cabe en el plan
incrementOps()                    // suma 1 a dailyOps (con auto-reset diario)
getDailyUsage()                   // → { used, limit, isPremium }
```

**Funciones Premium bloqueadas:**
```typescript
type PremiumFeature =
  | "batch"       // Conversión en lote
  | "ocr"         // OCR
  | "ai"          // Mejora con IA
  | "watermark"   // Marca de agua
  | "share"       // Compartir con enlace
  | "large_file"  // Archivos grandes
  | "merge_many"  // Fusionar >2 PDFs
```

**Demo mode:** En la página `/pricing`, el botón "Activar Premium → (Demo)" ejecuta `setPlan("premium")` en localStorage, simulando el plan Premium para pruebas. Sin integración real de pagos.

---

## 8. Internacionalización (i18n)

**Idiomas soportados:** Español (`es`) · Inglés (`en`)  
**Archivo principal:** `frontend/lib/i18n.ts`

### Detección automática
Al cargar la app, `LocaleProvider` detecta el idioma del navegador:
```typescript
const lang = navigator.language?.split("-")[0]?.toLowerCase();
return lang === "en" ? "en" : "es"; // Español por defecto
```
La preferencia manual se guarda en `localStorage` bajo la clave `"DocuFlow_locale"`.

### Detección de moneda
Se mapea `navigator.language` → código ISO 4217:
- `en-US` → USD, `es-ES` → EUR, `es-MX` → MXN, `es-AR` → ARS
- `pt-BR` → BRL, `en-GB` → GBP, `es-CO` → COP, `es-CL` → CLP
- Y 30+ locales más con fallback por prefijo de idioma

El precio se formatea con `Intl.NumberFormat`:
```typescript
formatPrice(9, "EUR", "es-ES") // → "9 €"
formatPrice(9, "MXN", "es-MX") // → "$9 MXN"
```

### Estructura de traducciones (interfaz `T`)
```typescript
T = {
  nav:     { editor, converter, tools, pricing, signIn, signOut, ... }
  home:    { badge, heading1, heading2, subtitle, ctaStart, ...,
             ctaTitle(name?), ctaSubtitle(loggedIn) }
  pricing: { badge, title, freeFeatures[], premiumFeatures[],
             tableRows[], faq[], ... }
  gate:    { modalTitle(featureName), bannerFree(used, limit),
             limitDesc(n), fileSizeDesc(mb), ... }
}
```

### Hook `useLocale()`
```typescript
const { t, locale, setLocale, currency, price } = useLocale();
// t.home.heading1      → "Edita y Convierte" (ES) / "Edit and Convert" (EN)
// price(9)             → "$9" / "9 €" / "$9 MXN" según región
// setLocale("en")      → cambia idioma y guarda en localStorage
```

### Cambio manual
Botón `🇪🇸 ES` / `🇺🇸 EN` en la Navbar (desktop) o en el menú desplegable de usuario (mobile).

---

## 9. Modo oscuro

**Implementación:** Tailwind CSS `darkMode: "class"` — se añade/elimina la clase `dark` en el `<html>`.

**`ThemeProvider.tsx`:**
- Lee preferencia de `localStorage` (`"DocuFlow_theme"`)
- Aplica la clase `dark` al `document.documentElement`
- Expone `{ isDark, toggle }` via contexto `ThemeContext`

**`DarkModeToggle.tsx`:** Botón ☀️/🌙 en la Navbar que llama a `toggle()`.

**Nota SSR:** Para evitar errores de hidratación, el provider siempre renderiza el contexto (con valores por defecto antes del primer mount del cliente).

---

## 10. Seguimiento de actividad

**`frontend/lib/activity.ts`** — registro local en `localStorage`.

**Registro de actividad:**
```typescript
interface ActivityRecord {
  id: string;            // timestamp + aleatorio
  type: "edit" | "convert";
  filename: string;
  format?: string;       // formato de salida (en conversiones)
  edits?: number;        // número de bloques editados
  date: string;          // ISO 8601
}
```

**Funciones:**
```typescript
addActivity(activity)   // Añade entrada (máximo 50 registros)
getActivities()         // Retorna historial ordenado por fecha
getStats()              // { total, conversions, edits }
getPrefs()              // { lastFormat?, lastFont? }
savePrefs(prefs)        // Guarda preferencias del usuario
timeAgo(dateStr)        // "hace 3 minutos", "hace 2 horas"
```

Visible en la página `/profile`.

---

## 11. Variables de entorno

### Frontend (`frontend/.env.local`)

| Variable | Descripción |
|---|---|
| `GOOGLE_CLIENT_ID` | ID de cliente OAuth de Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth de Google |
| `NEXTAUTH_SECRET` | Clave secreta para firmar tokens JWT de NextAuth |
| `NEXTAUTH_URL` | URL base de la app (ej: `http://localhost:3000`) |

### Backend

| Variable | Descripción |
|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic para usar Claude AI en `/improve-text/` |
| `DATABASE_URL` | URL de la base de datos (por defecto: `sqlite:///./DocuFlow.db`) |

> **Seguridad:** Las credenciales de `.env.local` son solo para desarrollo local. En producción deben gestionarse mediante variables de entorno del servidor (Vercel, Railway, etc.) y nunca incluirse en el repositorio.

---

## 12. Dependencias

### Backend (`requirements.txt`)

| Librería | Versión | Uso |
|---|---|---|
| fastapi | 0.115 | Framework web |
| uvicorn | — | Servidor ASGI |
| python-multipart | — | Formularios multipart |
| PyMuPDF (fitz) | 1.25.3 | Lectura/escritura de PDFs |
| pdf2docx | 0.5.8 | PDF → DOCX |
| python-docx | 1.1.2 | Generación de DOCX |
| python-pptx | — | Generación de PPTX |
| openpyxl | — | Lectura/escritura de Excel |
| Pillow | — | Procesamiento de imágenes |
| reportlab | — | Generación de PDFs desde tablas/texto |
| SQLAlchemy | 2.0.38 | ORM |
| databases | 0.9.0 | Acceso async a BD |
| anthropic | — | Claude AI API |
| easyocr | — | OCR sobre imágenes y PDFs |

### Frontend (`package.json`)

| Librería | Versión | Uso |
|---|---|---|
| next | 15.1.6 | Framework React (App Router) |
| react / react-dom | 19 | UI |
| next-auth | 4.24.11 | Autenticación OAuth |
| axios | 1.7.9 | HTTP client |
| tailwindcss | 3.4.17 | Estilos utilitarios |
| @react-pdf-viewer/core | — | Visor de PDF |
| react-pdf | 9.2.1 | Renderizado de PDF |
| typescript | 5.7.3 | Tipado estático |

---

## 13. Cómo ejecutar el proyecto

### Requisitos previos
- Python 3.11+
- Node.js 20+
- npm o pnpm

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en `http://localhost:8000`.  
Documentación automática Swagger en `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Variables de entorno
Crear el archivo `frontend/.env.local` con los valores indicados en la sección [Variables de entorno](#11-variables-de-entorno).

---

## 14. Roadmap y mejoras futuras

### Integración de pagos
El sistema de planes está implementado en el cliente (localStorage), pero sin procesador real de pagos. Integración sugerida:
- **Stripe** — para mercados internacionales
- **LemonSqueezy** — alternativa más simple, incluye gestión de IVA global
- **Paddle** — recomendado si se vende en múltiples regiones con compliance fiscal

### Pendientes técnicos
- [ ] Integrar sesión de NextAuth con la tabla de usuarios del backend
- [ ] Validación de plan en el servidor (actualmente solo client-side)
- [ ] Limpieza automática de archivos temporales en `/uploads/`
- [ ] Rate limiting en el backend por IP o por usuario
- [ ] Logs de producción y monitorización de errores (Sentry, LogTail)
- [ ] Tests automatizados (pytest para backend, Playwright/Vitest para frontend)
- [ ] Docker Compose para despliegue reproducible

### Nuevas funcionalidades posibles
- [ ] Firma digital de PDFs
- [ ] Historial en la nube (sincronizado, no solo localStorage)
- [ ] Soporte para más idiomas (PT, FR, DE)
- [ ] API pública para desarrolladores (con API keys)
- [ ] Modo colaborativo (edición simultánea)

---

*Documento generado el 2026-04-03.*
