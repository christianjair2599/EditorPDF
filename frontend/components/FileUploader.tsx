import { useState } from "react";
import axios from "axios";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Selecciona un archivo antes de subirlo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(`Subida exitosa: ${response.data.filename}`);
    } catch (error) {
      setMessage("Error al subir el archivo.");
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Subir Archivo PDF</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload}>Subir</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUploader;
