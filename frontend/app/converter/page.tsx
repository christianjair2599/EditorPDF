"use client";

import { useState } from "react";
import axios from "axios";

export default function ConverterPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setMessage("Selecciona un archivo PDF para convertir.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/convert/?output_format=docx", formData);
      setConvertedFile(response.data.output_file);
      setMessage("Conversión exitosa.");
    } catch (error) {
      setMessage("Error en la conversión.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Convertidor de PDF</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleConvert} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md shadow-md transition">
        Convertir PDF
      </button>
      {message && <p className="mt-4 text-red-600">{message}</p>}
      {convertedFile && (
        <a
          href={`http://127.0.0.1:8000/download/${convertedFile}`}
          download
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md mt-4 transition"
        >
          Descargar archivo convertido
        </a>
      )}
    </div>
  );
}
