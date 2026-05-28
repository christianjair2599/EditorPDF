# DocuFlow — Guía de Despliegue en Firebase

## Arquitectura de producción

```
                   Firebase App Hosting
                 ┌─────────────────────┐
  Usuario   ───► │  DocuFlow Frontend  │ (Next.js SSR)
                 │  web.app / custom   │
                 └──────────┬──────────┘
                            │ HTTPS
                 ┌──────────▼──────────┐
                 │  Backend (FastAPI)  │ (Google Cloud Run)
                 │  your-api.run.app   │
                 └─────────────────────┘
```

> **Nota:** Firebase App Hosting sirve el frontend Next.js (SSR).  
> El backend FastAPI requiere despliegue separado (Cloud Run recomendado).

---

## Requisitos previos

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar sesión
firebase login
```

---

## 1. Crear proyecto en Firebase

1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear nuevo proyecto → nombre: `docuflow-app`
3. En `.firebaserc`, confirmar que el project ID coincide:
   ```json
   { "projects": { "default": "docuflow-app" } }
   ```

---

## 2. Configurar variables de entorno en Firebase

Las secrets se configuran en Firebase Console → App Hosting → tu backend → Secrets.

O desde CLI:

```bash
firebase apphosting:secrets:set NEXTAUTH_SECRET
firebase apphosting:secrets:set GOOGLE_CLIENT_ID
firebase apphosting:secrets:set GOOGLE_CLIENT_SECRET
```

Las variables no-secretas van en `apphosting.yaml` directamente.

---

## 3. Desplegar el frontend (Firebase App Hosting)

```bash
# Desde la raíz del proyecto
firebase deploy --only hosting

# O con preview channel
firebase hosting:channel:deploy preview
```

Firebase App Hosting detecta automáticamente que es un proyecto Next.js y hace el build.

---

## 4. Desplegar el backend (Google Cloud Run)

### Crear Dockerfile para FastAPI

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Desplegar en Cloud Run

```bash
cd backend

# Build y push a Container Registry
gcloud builds submit --tag gcr.io/docuflow-app/backend

# Desplegar en Cloud Run
gcloud run deploy docuflow-backend \
  --image gcr.io/docuflow-app/backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ANTHROPIC_API_KEY=your_key
```

### Actualizar la URL del backend

Una vez desplegado, copiar la URL de Cloud Run y actualizar:
- `apphosting.yaml` → `NEXT_PUBLIC_API_URL`
- `frontend/app/api/api.ts` → baseURL

---

## 5. Configurar Google OAuth para producción

En [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials:

1. Editar el OAuth 2.0 Client ID
2. Añadir a **Authorized JavaScript origins**:
   ```
   https://docuflow-app.web.app
   https://tu-dominio-custom.com
   ```
3. Añadir a **Authorized redirect URIs**:
   ```
   https://docuflow-app.web.app/api/auth/callback/google
   https://tu-dominio-custom.com/api/auth/callback/google
   ```

---

## 6. Dominio personalizado (opcional)

En Firebase Console → Hosting → Add custom domain → seguir el wizard para apuntar DNS.

Actualizar en `apphosting.yaml`:
```yaml
- variable: NEXTAUTH_URL
  value: https://www.docuflow.app
```

---

## Resumen de comandos

| Acción | Comando |
|--------|---------|
| Login Firebase | `firebase login` |
| Desplegar frontend | `firebase deploy --only hosting` |
| Preview deploy | `firebase hosting:channel:deploy preview` |
| Ver logs | `firebase functions:log` |
| Abrir consola | `firebase open hosting:site` |
