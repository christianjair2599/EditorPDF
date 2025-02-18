import axios from "axios";

const API_URL = "http://localhost:8000"; // URL del backend en FastAPI

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(`${API_URL}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return null;
  }
};

export const convertFile = async (file: File, format: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("output_format", format);

  try {
    const response = await axios.post(`${API_URL}/convert/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error en la conversión:", error);
    return null;
  }
};
