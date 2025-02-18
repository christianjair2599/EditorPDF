"use client";

import { useState } from "react";
import axios from "axios";

export default function EditorPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleEdit = async () => {
    if (!selectedFile) {
      setMessage("Selecciona un archivo PDF para editar.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post("http://127.0.0.1:8000/edit/", formData);
      setMessage(response.data.message || "Edición exitosa.");
    } catch (error) {
      setMessage("Error en la edición.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Editor de PDF</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} className="mb-4" />
      <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md transition">
        Editar PDF
      </button>
      {message && <p className="mt-4 text-red-600">{message}</p>}
    </div>
  );
}
