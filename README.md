# EditorPDF - Conversor y Editor de PDFs

## 📌 Descripción
EditorPDF es una aplicación web que permite **subir, convertir y editar PDFs**.  
Desarrollado con **FastAPI (Backend)** y **Next.js (Frontend)**.

## 🚀 Tecnologías Utilizadas
- **Backend**: FastAPI, pdf2docx, pdf2image
- **Frontend**: Next.js, React, Axios
- **Base de datos**: SQLite (opcional)
- **Despliegue**: Docker, Uvicorn, Nginx

## 📂 Estructura del Proyecto
EditorPDF/
│── backend/                # API en FastAPI
│   ├── main.py             # Código principal
│   ├── requirements.txt    # Dependencias
│   ├── uploads/            # Carpeta de archivos subidos
│   ├── Dockerfile          # Configuración para despliegue
│── frontend/               # Aplicación en Next.js
│   ├── app/                # Páginas de la aplicación
│   ├── components/         # Componentes reutilizables
│   ├── public/             # Archivos estáticos
│   ├── Dockerfile          # Configuración para despliegue
