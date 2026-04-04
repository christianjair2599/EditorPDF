export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TextBlock {
  id: string;
  page: number;
  x0: number; y0: number; x1: number; y1: number;
  text: string;
  font_size: number;
  color: string;
}

export interface BlockEdit {
  id: string;
  page: number;
  x0: number; y0: number; x1: number; y1: number;
  new_text: string;
  font: string;
  font_size: number;
  color: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function post(path: string, body: FormData) {
  try {
    const res = await fetch(`${API_URL}${path}`, { method: "POST", body });
    return await res.json();
  } catch (err) {
    console.error(`POST ${path} failed:`, err);
    return null;
  }
}

// ── API calls ──────────────────────────────────────────────────────────────

export const uploadFile = async (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return post("/upload/", fd);
};

export const convertFile = async (file: File, format: string) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("output_format", format);
  return post("/convert/", fd);
};

export const convertAny = async (
  file: File,
  format: string
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("output_format", format);
  return post("/convert-any/", fd);
};

export const editFile = async (
  file: File,
  options: {
    comment: string; x: number; y: number;
    fontSize: number; color: string;
    applyToAll: boolean; pageNum: number;
  }
) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("comment", options.comment);
  fd.append("x", options.x.toString());
  fd.append("y", options.y.toString());
  fd.append("font_size", options.fontSize.toString());
  fd.append("color", options.color);
  fd.append("apply_to_all", options.applyToAll.toString());
  fd.append("page_num", options.pageNum.toString());
  return post("/edit/", fd);
};

export const extractTextBlocks = async (
  file: File
): Promise<{ blocks: TextBlock[]; file_id: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  return post("/extract/", fd);
};

export const editBlocks = async (
  fileId: string,
  edits: BlockEdit[]
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file_id", fileId);
  fd.append("edits", JSON.stringify(edits));
  return post("/edit-blocks/", fd);
};

export const improveText = async (
  text: string
): Promise<{ improved_text?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("text", text);
  return post("/improve-text/", fd);
};

export const mergePdf = async (
  files: File[]
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  return post("/merge-pdf/", fd);
};

export const splitPdf = async (
  file: File,
  startPage: number,
  endPage: number
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("start_page", startPage.toString());
  fd.append("end_page", endPage.toString());
  return post("/split-pdf/", fd);
};

export const compressPdf = async (
  file: File,
  quality: number = 2
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("quality", quality.toString());
  return post("/compress-pdf/", fd);
};

export const ocrPdf = async (
  file: File
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  return post("/ocr-pdf/", fd);
};

export const watermarkPdf = async (
  file: File,
  options: { text?: string; opacity?: number; fontSize?: number; color?: string }
): Promise<{ output_file?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  if (options.text !== undefined) fd.append("text", options.text);
  if (options.opacity !== undefined) fd.append("opacity", options.opacity.toString());
  if (options.fontSize !== undefined) fd.append("font_size", options.fontSize.toString());
  if (options.color !== undefined) fd.append("color", options.color);
  return post("/watermark-pdf/", fd);
};

export const shareFile = async (
  file: File
): Promise<{ token?: string; filename?: string; error?: string } | null> => {
  const fd = new FormData();
  fd.append("file", file);
  return post("/share/", fd);
};
