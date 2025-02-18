from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import uuid
from pdf2docx import Converter
from pdf2image import convert_from_path

app = FastAPI()

# Configurar CORS para permitir conexión con el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todas las conexiones (ajustar en producción)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    """Recibe un archivo PDF y lo guarda en el servidor"""
    file_id = str(uuid.uuid4())
    file_location = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"message": "Archivo subido con éxito", "filename": file.filename, "file_path": file_location}

@app.get("/download/{filename}")
async def download_pdf(filename: str):
    """Permite descargar un archivo convertido"""
    file_path = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}
    return FileResponse(file_path, filename=filename)

@app.post("/convert/")
async def convert_pdf(file: UploadFile = File(...), output_format: str = "docx"):
    """Convierte un archivo PDF a otro formato (docx, jpg)"""
    file_id = str(uuid.uuid4())
    input_file = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")

    with open(input_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    output_file = input_file.replace(".pdf", f".{output_format}")

    if output_format == "docx":
        cv = Converter(input_file)
        cv.convert(output_file, start=0, end=None)
        cv.close()
    elif output_format == "jpg":
        images = convert_from_path(input_file)
        output_file = output_file.replace(".docx", ".jpg")
        images[0].save(output_file, "JPEG")

    return {"message": "Conversión exitosa", "output_file": output_file}
