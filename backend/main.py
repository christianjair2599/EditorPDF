from fastapi import FastAPI, File, UploadFile, Form, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
import shutil, os, uuid, json, csv, re, time, hmac, hashlib
import stripe
import datetime
from database import SessionLocal, engine
from models import Base, Subscription

Base.metadata.create_all(bind=engine)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID = os.getenv("STRIPE_PRICE_ID", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://editorpdf-christian-mayangas-projects.vercel.app")

# Lemon Squeezy
LEMON_API_KEY      = os.getenv("LEMONSQUEEZY_API_KEY", "")
LEMON_STORE_ID     = os.getenv("LEMONSQUEEZY_STORE_ID", "")
LEMON_VARIANT_ID   = os.getenv("LEMONSQUEEZY_VARIANT_ID", "")
LEMON_WEBHOOK_SECRET = os.getenv("LEMONSQUEEZY_WEBHOOK_SECRET", "")
from pdf2docx import Converter
import fitz  # PyMuPDF
from PIL import Image as PILImage
from docx import Document as DocxDocument
from docx.shared import Inches
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

app = FastAPI()

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
] or [
    "https://editorpdf-christian-mayangas-projects.vercel.app",
    "https://docuflow-app.web.app",
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ── File cleanup ──────────────────────────────────────────────────────────────

_last_cleanup: float = 0

def cleanup_old_files():
    """Delete files older than 24 hours. Runs at most once per hour."""
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup < 3600:
        return
    _last_cleanup = now
    cutoff = now - 86400  # 24 hours
    try:
        for filename in os.listdir(UPLOAD_DIR):
            filepath = os.path.join(UPLOAD_DIR, filename)
            if os.path.isfile(filepath) and os.path.getmtime(filepath) < cutoff:
                os.remove(filepath)
    except Exception as e:
        print(f"Cleanup error: {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────

def hex_to_rgb(hex_color: str) -> tuple:
    hex_color = hex_color.lstrip("#")
    return (
        int(hex_color[0:2], 16) / 255,
        int(hex_color[2:4], 16) / 255,
        int(hex_color[4:6], 16) / 255,
    )

def safe_text(t: str) -> str:
    return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def text_to_pdf(text: str, output_path: str):
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                            leftMargin=50, rightMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    style = styles["Normal"]
    style.fontSize = 11
    style.leading = 16
    story = []
    for line in text.split("\n"):
        line = line.strip()
        if line:
            try:
                story.append(Paragraph(safe_text(line), style))
            except Exception:
                pass
        else:
            story.append(Spacer(1, 8))
    if not story:
        story.append(Paragraph("(Sin contenido)", style))
    doc.build(story)

def table_to_pdf(rows: list[list], output_path: str):
    """Renders a list-of-rows table into a nicely styled PDF."""
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                            leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    if not rows:
        doc.build([Paragraph("(Sin contenido)", styles["Normal"])])
        return
    # Convert all cells to string
    data = [[str(c) if c is not None else "" for c in row] for row in rows]
    t = Table(data, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e3a5f")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f7fa")]),
        ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING",    (0, 0), (-1, -1), 5),
    ]))
    doc.build([t])

def stitch_images(imgs: list, output_path: str, fmt: str):
    if len(imgs) == 1:
        imgs[0].save(output_path, fmt)
        return
    total_w = max(i.width for i in imgs)
    total_h = sum(i.height for i in imgs)
    combined = PILImage.new("RGB", (total_w, total_h), (255, 255, 255))
    y = 0
    for img in imgs:
        combined.paste(img, (0, y))
        y += img.height
    combined.save(output_path, fmt)

def rows_to_json(rows: list[list]) -> str:
    if not rows:
        return "[]"
    headers = [str(h) if h else f"col{i}" for i, h in enumerate(rows[0])]
    result = []
    for row in rows[1:]:
        obj = {}
        for i, h in enumerate(headers):
            obj[h] = row[i] if i < len(row) else None
        result.append(obj)
    return json.dumps(result, ensure_ascii=False, indent=2)

def rows_to_xml(rows: list[list]) -> str:
    if not rows:
        return "<data/>"
    headers = [re.sub(r"[^a-zA-Z0-9_]", "_", str(h)) if h else f"col{i}"
               for i, h in enumerate(rows[0])]
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<data>"]
    for row in rows[1:]:
        lines.append("  <row>")
        for i, h in enumerate(headers):
            val = row[i] if i < len(row) else ""
            lines.append(f"    <{h}>{safe_text(str(val))}</{h}>")
        lines.append("  </row>")
    lines.append("</data>")
    return "\n".join(lines)

def html_table(rows: list[list]) -> str:
    if not rows:
        return "<table></table>"
    header_cells = "".join(f"<th>{safe_text(str(c))}</th>" for c in rows[0])
    body_rows = ""
    for row in rows[1:]:
        cells = "".join(f"<td>{safe_text(str(c if c is not None else ''))}</td>" for c in row)
        body_rows += f"<tr>{cells}</tr>"
    return (
        "<table border='1' cellpadding='4' cellspacing='0' "
        f"style='border-collapse:collapse'><thead><tr>{header_cells}</tr></thead>"
        f"<tbody>{body_rows}</tbody></table>"
    )

def pdf_to_image_list(input_file: str) -> list:
    doc = fitz.open(input_file)
    imgs = []
    for page in doc:
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        imgs.append(PILImage.frombytes("RGB", [pix.width, pix.height], pix.samples))
    doc.close()
    return imgs


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/download/{filename}")
async def download_file(filename: str, name: str = ""):
    safe = os.path.basename(filename)
    path = os.path.join(UPLOAD_DIR, safe)
    if not os.path.exists(path):
        return {"error": "Archivo no encontrado"}
    download_name = os.path.basename(name) if name else safe
    return FileResponse(path, filename=download_name)


@app.post("/upload/")
async def upload_pdf(file: UploadFile = File(...)):
    cleanup_old_files()
    file_id = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    return {"message": "Archivo subido con éxito", "filename": file.filename, "file_path": path}


@app.post("/convert-any/")
async def convert_any(file: UploadFile = File(...), output_format: str = Form(...)):
    cleanup_old_files()
    file_id = str(uuid.uuid4())
    original_name = os.path.splitext(file.filename or "archivo")[0]
    original_ext = os.path.splitext(file.filename or "")[1].lower().lstrip(".")
    safe_name = f"{file_id}.{original_ext}" if original_ext else f"{file_id}.bin"
    input_file = os.path.join(UPLOAD_DIR, safe_name)

    with open(input_file, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    base = os.path.splitext(input_file)[0]
    fmt = output_format.lower()
    src = original_ext
    output_file = None

    try:
        # ── PDF → * ───────────────────────────────────────────────────────────
        if src == "pdf":
            if fmt == "docx":
                output_file = f"{base}.docx"
                cv = Converter(input_file)
                cv.convert(output_file)
                cv.close()

            elif fmt in ("jpg", "png", "webp", "bmp", "tiff"):
                output_file = f"{base}.{fmt}"
                imgs = pdf_to_image_list(input_file)
                pil_fmt = {"jpg": "JPEG", "png": "PNG", "webp": "WEBP", "bmp": "BMP", "tiff": "TIFF"}[fmt]
                stitch_images(imgs, output_file, pil_fmt)

            elif fmt == "txt":
                output_file = f"{base}.txt"
                doc = fitz.open(input_file)
                text = "\n".join(page.get_text() for page in doc)
                doc.close()
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(text)

            elif fmt == "html":
                output_file = f"{base}.html"
                doc = fitz.open(input_file)
                html = "<html><body>" + "".join(page.get_text("html") for page in doc) + "</body></html>"
                doc.close()
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(html)

            elif fmt in ("xlsx", "csv"):
                # Extract text lines into a spreadsheet / csv
                doc = fitz.open(input_file)
                rows = [["Página", "Texto"]]
                for page_num, page in enumerate(doc, 1):
                    for line in page.get_text().splitlines():
                        if line.strip():
                            rows.append([page_num, line.strip()])
                doc.close()
                if fmt == "csv":
                    output_file = f"{base}.csv"
                    with open(output_file, "w", newline="", encoding="utf-8") as f:
                        csv.writer(f).writerows(rows)
                else:
                    output_file = f"{base}.xlsx"
                    wb = openpyxl.Workbook()
                    ws = wb.active
                    for row in rows:
                        ws.append(row)
                    wb.save(output_file)

            elif fmt == "json":
                doc = fitz.open(input_file)
                pages_data = []
                for page_num, page in enumerate(doc, 1):
                    pages_data.append({"page": page_num, "text": page.get_text()})
                doc.close()
                output_file = f"{base}.json"
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(pages_data, f, ensure_ascii=False, indent=2)

            elif fmt == "xml":
                doc = fitz.open(input_file)
                lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<document>"]
                for page_num, page in enumerate(doc, 1):
                    lines.append(f'  <page number="{page_num}">')
                    for line in page.get_text().splitlines():
                        if line.strip():
                            lines.append(f"    <line>{safe_text(line.strip())}</line>")
                    lines.append("  </page>")
                lines.append("</document>")
                doc.close()
                output_file = f"{base}.xml"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines))

            elif fmt == "pptx":
                doc = fitz.open(input_file)
                prs = Presentation()
                slide_layout = prs.slide_layouts[1]
                for page_num, page in enumerate(doc):
                    slide = prs.slides.add_slide(slide_layout)
                    slide.shapes.title.text = f"Página {page_num + 1}"
                    tf = slide.placeholders[1].text_frame
                    tf.text = page.get_text()[:800]
                doc.close()
                output_file = f"{base}.pptx"
                prs.save(output_file)

        # ── DOCX / DOC → * ───────────────────────────────────────────────────
        elif src in ("docx", "doc"):
            docx = DocxDocument(input_file)
            paragraphs = [p.text for p in docx.paragraphs]
            full_text = "\n".join(paragraphs)

            if fmt == "pdf":
                output_file = f"{base}.pdf"
                text_to_pdf(full_text, output_file)

            elif fmt == "txt":
                output_file = f"{base}.txt"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(full_text)

            elif fmt == "html":
                output_file = f"{base}.html"
                body = "".join(f"<p>{safe_text(p)}</p>" for p in paragraphs if p.strip())
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{body}</body></html>")

            elif fmt in ("xlsx", "csv"):
                rows = [["#", "Párrafo"]] + [[i + 1, p] for i, p in enumerate(paragraphs) if p.strip()]
                if fmt == "csv":
                    output_file = f"{base}.csv"
                    with open(output_file, "w", newline="", encoding="utf-8") as f:
                        csv.writer(f).writerows(rows)
                else:
                    output_file = f"{base}.xlsx"
                    wb = openpyxl.Workbook()
                    ws = wb.active
                    for row in rows:
                        ws.append(row)
                    wb.save(output_file)

            elif fmt == "json":
                output_file = f"{base}.json"
                data = [{"index": i + 1, "text": p} for i, p in enumerate(paragraphs) if p.strip()]
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

            elif fmt == "xml":
                output_file = f"{base}.xml"
                items = "".join(
                    f"  <paragraph index='{i+1}'>{safe_text(p)}</paragraph>"
                    for i, p in enumerate(paragraphs) if p.strip()
                )
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<document>\n{items}\n</document>')

            elif fmt == "pptx":
                prs = Presentation()
                slide_layout = prs.slide_layouts[1]
                for p in paragraphs:
                    if p.strip():
                        slide = prs.slides.add_slide(slide_layout)
                        slide.shapes.title.text = p[:80]
                        prs.slides[-1].placeholders[1].text_frame.text = ""
                output_file = f"{base}.pptx"
                prs.save(output_file)

            elif fmt == "md":
                output_file = f"{base}.md"
                md_lines = []
                for p in paragraphs:
                    if p.strip():
                        md_lines.append(p.strip())
                        md_lines.append("")
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(md_lines))

        # ── PPTX / PPT → * ───────────────────────────────────────────────────
        elif src in ("pptx", "ppt"):
            prs = Presentation(input_file)
            slides_data = []
            for i, slide in enumerate(prs.slides, 1):
                texts = [shape.text.strip() for shape in slide.shapes
                         if hasattr(shape, "text") and shape.text.strip()]
                slides_data.append({"slide": i, "texts": texts})

            if fmt == "pdf":
                lines = []
                for s in slides_data:
                    lines.append(f"─── Diapositiva {s['slide']} ───")
                    lines.extend(s["texts"])
                    lines.append("")
                output_file = f"{base}.pdf"
                text_to_pdf("\n".join(lines), output_file)

            elif fmt == "txt":
                output_file = f"{base}.txt"
                lines = []
                for s in slides_data:
                    lines.append(f"=== Diapositiva {s['slide']} ===")
                    lines.extend(s["texts"])
                    lines.append("")
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines))

            elif fmt == "html":
                output_file = f"{base}.html"
                sections = ""
                for s in slides_data:
                    paras = "".join(f"<p>{safe_text(t)}</p>" for t in s["texts"])
                    sections += f"<section><h2>Diapositiva {s['slide']}</h2>{paras}</section>"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{sections}</body></html>")

            elif fmt == "docx":
                output_file = f"{base}.docx"
                doc = DocxDocument()
                for s in slides_data:
                    doc.add_heading(f"Diapositiva {s['slide']}", level=1)
                    for t in s["texts"]:
                        doc.add_paragraph(t)
                doc.save(output_file)

            elif fmt in ("xlsx", "csv"):
                rows = [["Diapositiva", "Texto"]]
                for s in slides_data:
                    for t in s["texts"]:
                        rows.append([s["slide"], t])
                if fmt == "csv":
                    output_file = f"{base}.csv"
                    with open(output_file, "w", newline="", encoding="utf-8") as f:
                        csv.writer(f).writerows(rows)
                else:
                    output_file = f"{base}.xlsx"
                    wb = openpyxl.Workbook()
                    ws = wb.active
                    for row in rows:
                        ws.append(row)
                    wb.save(output_file)

            elif fmt == "json":
                output_file = f"{base}.json"
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(slides_data, f, ensure_ascii=False, indent=2)

            elif fmt == "xml":
                output_file = f"{base}.xml"
                lines = ['<?xml version="1.0" encoding="UTF-8"?>', "<presentation>"]
                for s in slides_data:
                    lines.append(f'  <slide number="{s["slide"]}">')
                    for t in s["texts"]:
                        lines.append(f"    <text>{safe_text(t)}</text>")
                    lines.append("  </slide>")
                lines.append("</presentation>")
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(lines))

        # ── XLSX / XLS → * ───────────────────────────────────────────────────
        elif src in ("xlsx", "xls"):
            wb = openpyxl.load_workbook(input_file, data_only=True)
            ws = wb.active
            rows = list(ws.iter_rows(values_only=True))

            if fmt == "csv":
                output_file = f"{base}.csv"
                with open(output_file, "w", newline="", encoding="utf-8") as f:
                    csv.writer(f).writerows(
                        [str(c) if c is not None else "" for c in row] for row in rows
                    )

            elif fmt == "txt":
                output_file = f"{base}.txt"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join(
                        "\t".join(str(c) if c is not None else "" for c in row) for row in rows
                    ))

            elif fmt == "pdf":
                output_file = f"{base}.pdf"
                table_to_pdf(rows, output_file)

            elif fmt == "html":
                output_file = f"{base}.html"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{html_table(rows)}</body></html>")

            elif fmt == "json":
                output_file = f"{base}.json"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(rows_to_json(rows))

            elif fmt == "xml":
                output_file = f"{base}.xml"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(rows_to_xml(rows))

            elif fmt == "docx":
                output_file = f"{base}.docx"
                doc = DocxDocument()
                table = doc.add_table(rows=len(rows), cols=len(rows[0]) if rows else 1)
                table.style = "Table Grid"
                for r_idx, row in enumerate(rows):
                    for c_idx, cell in enumerate(row):
                        table.rows[r_idx].cells[c_idx].text = str(cell) if cell is not None else ""
                doc.save(output_file)

            elif fmt == "pptx":
                prs = Presentation()
                layout = prs.slide_layouts[5]
                slide = prs.slides.add_slide(layout)
                rows_clean = [[str(c) if c is not None else "" for c in row] for row in rows[:20]]
                if rows_clean:
                    n_rows = len(rows_clean)
                    n_cols = max(len(r) for r in rows_clean)
                    tbl = slide.shapes.add_table(n_rows, n_cols,
                        PptxInches(0.5), PptxInches(1), PptxInches(9), PptxInches(5)).table
                    for r_idx, row in enumerate(rows_clean):
                        for c_idx in range(n_cols):
                            tbl.cell(r_idx, c_idx).text = row[c_idx] if c_idx < len(row) else ""
                output_file = f"{base}.pptx"
                prs.save(output_file)

        # ── CSV → * ──────────────────────────────────────────────────────────
        elif src == "csv":
            with open(input_file, "r", encoding="utf-8", errors="replace") as f:
                rows = list(csv.reader(f))

            if fmt == "xlsx":
                output_file = f"{base}.xlsx"
                wb = openpyxl.Workbook()
                ws = wb.active
                for row in rows:
                    ws.append(row)
                wb.save(output_file)

            elif fmt == "txt":
                output_file = f"{base}.txt"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write("\n".join("\t".join(row) for row in rows))

            elif fmt == "pdf":
                output_file = f"{base}.pdf"
                table_to_pdf(rows, output_file)

            elif fmt == "html":
                output_file = f"{base}.html"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{html_table(rows)}</body></html>")

            elif fmt == "json":
                output_file = f"{base}.json"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(rows_to_json(rows))

            elif fmt == "xml":
                output_file = f"{base}.xml"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(rows_to_xml(rows))

            elif fmt == "docx":
                output_file = f"{base}.docx"
                doc = DocxDocument()
                if rows:
                    table = doc.add_table(rows=len(rows), cols=len(rows[0]))
                    table.style = "Table Grid"
                    for r_idx, row in enumerate(rows):
                        for c_idx, cell in enumerate(row):
                            table.rows[r_idx].cells[c_idx].text = cell
                doc.save(output_file)

            elif fmt == "pptx":
                prs = Presentation()
                layout = prs.slide_layouts[5]
                slide = prs.slides.add_slide(layout)
                rows_slice = rows[:20]
                if rows_slice:
                    n_rows = len(rows_slice)
                    n_cols = max(len(r) for r in rows_slice)
                    tbl = slide.shapes.add_table(n_rows, n_cols,
                        PptxInches(0.5), PptxInches(1), PptxInches(9), PptxInches(5)).table
                    for r_idx, row in enumerate(rows_slice):
                        for c_idx in range(n_cols):
                            tbl.cell(r_idx, c_idx).text = row[c_idx] if c_idx < len(row) else ""
                output_file = f"{base}.pptx"
                prs.save(output_file)

        # ── Images → * ───────────────────────────────────────────────────────
        elif src in ("jpg", "jpeg", "png", "webp", "bmp", "gif", "tiff"):
            img_mode = "RGBA" if fmt == "png" else "RGB"
            img = PILImage.open(input_file).convert(img_mode)

            pil_fmts = {
                "pdf":  ("pdf",  "PDF"),
                "jpg":  ("jpg",  "JPEG"),
                "jpeg": ("jpg",  "JPEG"),
                "png":  ("png",  "PNG"),
                "webp": ("webp", "WEBP"),
                "bmp":  ("bmp",  "BMP"),
                "tiff": ("tiff", "TIFF"),
                "gif":  ("gif",  "GIF"),
                "ico":  ("ico",  "ICO"),
            }
            if fmt not in pil_fmts:
                return {"error": f"Conversión de imagen a '{fmt}' no soportada."}
            ext_out, pil_fmt = pil_fmts[fmt]
            output_file = f"{base}.{ext_out}"
            if fmt == "ico":
                img_rgb = img.convert("RGBA")
                img_rgb = img_rgb.resize((256, 256), PILImage.LANCZOS)
                img_rgb.save(output_file, "ICO", sizes=[(256, 256), (128, 128), (64, 64), (32, 32), (16, 16)])
            elif fmt == "pdf":
                img.convert("RGB").save(output_file, "PDF")
            else:
                save_kwargs = {}
                if fmt in ("jpg", "jpeg"):
                    save_kwargs = {"quality": 92}
                elif fmt == "webp":
                    save_kwargs = {"quality": 90}
                img.save(output_file, pil_fmt, **save_kwargs)

        # ── TXT → * ──────────────────────────────────────────────────────────
        elif src == "txt":
            with open(input_file, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
            lines = text.splitlines()

            if fmt == "pdf":
                output_file = f"{base}.pdf"
                text_to_pdf(text, output_file)

            elif fmt == "docx":
                output_file = f"{base}.docx"
                doc = DocxDocument()
                for line in lines:
                    doc.add_paragraph(line)
                doc.save(output_file)

            elif fmt == "html":
                output_file = f"{base}.html"
                body = "".join(f"<p>{safe_text(l)}</p>" for l in lines if l.strip())
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f"<html><body>{body}</body></html>")

            elif fmt in ("xlsx", "csv"):
                rows = [["#", "Línea"]] + [[i + 1, l] for i, l in enumerate(lines) if l.strip()]
                if fmt == "csv":
                    output_file = f"{base}.csv"
                    with open(output_file, "w", newline="", encoding="utf-8") as f:
                        csv.writer(f).writerows(rows)
                else:
                    output_file = f"{base}.xlsx"
                    wb = openpyxl.Workbook()
                    ws = wb.active
                    for row in rows:
                        ws.append(row)
                    wb.save(output_file)

            elif fmt == "json":
                output_file = f"{base}.json"
                data = [{"line": i + 1, "text": l} for i, l in enumerate(lines) if l.strip()]
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

            elif fmt == "xml":
                output_file = f"{base}.xml"
                items = "".join(
                    f'  <line number="{i+1}">{safe_text(l)}</line>'
                    for i, l in enumerate(lines) if l.strip()
                )
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<text>\n{items}\n</text>')

            elif fmt == "pptx":
                prs = Presentation()
                layout = prs.slide_layouts[1]
                for line in lines:
                    if line.strip():
                        slide = prs.slides.add_slide(layout)
                        slide.shapes.title.text = line[:80]
                        slide.placeholders[1].text_frame.text = ""
                output_file = f"{base}.pptx"
                prs.save(output_file)

            elif fmt == "md":
                output_file = f"{base}.md"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(text)

        # ── HTML / HTM → * ───────────────────────────────────────────────────
        elif src in ("html", "htm"):
            with open(input_file, "r", encoding="utf-8", errors="replace") as f:
                raw_html = f.read()
            plain = re.sub(r"<[^>]+>", " ", raw_html)
            plain = re.sub(r"\s+", " ", plain).strip()
            lines = [l.strip() for l in plain.split(".") if l.strip()]

            if fmt == "txt":
                output_file = f"{base}.txt"
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(plain)

            elif fmt == "pdf":
                output_file = f"{base}.pdf"
                text_to_pdf(plain, output_file)

            elif fmt == "docx":
                output_file = f"{base}.docx"
                doc = DocxDocument()
                for line in lines:
                    if line:
                        doc.add_paragraph(line + ".")
                doc.save(output_file)

            elif fmt == "json":
                output_file = f"{base}.json"
                data = {"content": plain, "sentences": lines}
                with open(output_file, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

            elif fmt == "xml":
                output_file = f"{base}.xml"
                items = "".join(f"  <sentence>{safe_text(l)}.</sentence>" for l in lines if l)
                with open(output_file, "w", encoding="utf-8") as f:
                    f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<html_content>\n{items}\n</html_content>')

            elif fmt in ("xlsx", "csv"):
                rows = [["#", "Oración"]] + [[i + 1, l + "."] for i, l in enumerate(lines) if l]
                if fmt == "csv":
                    output_file = f"{base}.csv"
                    with open(output_file, "w", newline="", encoding="utf-8") as f:
                        csv.writer(f).writerows(rows)
                else:
                    output_file = f"{base}.xlsx"
                    wb = openpyxl.Workbook()
                    ws = wb.active
                    for row in rows:
                        ws.append(row)
                    wb.save(output_file)

        # ── Unsupported ────────────────────────────────────────────────────────
        if output_file is None:
            return {"error": f"Conversión de '{src}' a '{fmt}' no soportada."}

    except Exception as e:
        return {"error": f"Error en la conversión: {str(e)}"}

    friendly_name = f"{original_name}.{fmt}"
    return {"message": "Conversión exitosa", "output_file": os.path.basename(output_file), "friendly_name": friendly_name}


# ── URL → PDF / Image / TXT / HTML ───────────────────────────────────────────
@app.post("/url-to-pdf/")
async def url_to_format(url: str = Form(...), output_format: str = Form("pdf")):
    import re as _re
    import requests as _req
    from bs4 import BeautifulSoup

    if not _re.match(r"^https?://", url):
        return JSONResponse({"error": "URL inválida. Debe comenzar con http:// o https://"}, status_code=400)

    file_id = str(uuid.uuid4())
    fmt = output_format.lower()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

    try:
        resp = _req.get(url, timeout=30, headers=headers)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "nav", "footer", "iframe", "noscript"]):
            tag.decompose()

        title = soup.title.string.strip() if soup.title and soup.title.string else url
        paragraphs = [title, f"Fuente: {url}", ""]
        for el in soup.find_all(["h1","h2","h3","h4","p","li","td","th","blockquote","pre"]):
            t = el.get_text(separator=" ", strip=True)
            if t:
                paragraphs.append(t)

        plain_text = "\n".join(paragraphs)

        if fmt in ("pdf", "png", "jpg", "jpeg"):
            pdf_path = os.path.join(UPLOAD_DIR, f"{file_id}_tmp.pdf")
            text_to_pdf(plain_text, pdf_path)

            if fmt == "pdf":
                out_path = pdf_path
            else:
                pil_fmt = {"png": "PNG", "jpg": "JPEG", "jpeg": "JPEG"}[fmt]
                out_path = os.path.join(UPLOAD_DIR, f"{file_id}.{fmt}")
                imgs = pdf_to_image_list(pdf_path)
                stitch_images(imgs, out_path, pil_fmt)
                os.remove(pdf_path)

        elif fmt == "txt":
            out_path = os.path.join(UPLOAD_DIR, f"{file_id}.txt")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(plain_text)

        elif fmt == "html":
            out_path = os.path.join(UPLOAD_DIR, f"{file_id}.html")
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(resp.text)

        else:
            return JSONResponse({"error": f"Formato '{fmt}' no soportado para URLs"}, status_code=400)

    except _req.exceptions.ConnectionError:
        return JSONResponse({"error": "No se pudo conectar a la URL. Verifica que el enlace sea accesible."}, status_code=400)
    except _req.exceptions.Timeout:
        return JSONResponse({"error": "La URL tardó demasiado en responder."}, status_code=400)
    except _req.exceptions.HTTPError as e:
        return JSONResponse({"error": f"La URL devolvió un error HTTP: {e.response.status_code}"}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": f"Error al procesar la URL: {str(e)}"}, status_code=500)

    # Build a friendly filename from the URL hostname
    from urllib.parse import urlparse
    host = urlparse(url).hostname or "pagina"
    host = host.replace("www.", "")
    friendly_name = f"{host}.{fmt}"
    return {"message": "Conversión exitosa", "output_file": os.path.basename(out_path), "friendly_name": friendly_name}


# ── Legacy /convert/ ─────────────────────────────────────────────────────────
@app.post("/convert/")
async def convert_pdf(file: UploadFile = File(...), output_format: str = Form("docx")):
    return await convert_any(file=file, output_format=output_format)


# ── PDF Editor endpoints ──────────────────────────────────────────────────────

@app.post("/edit/")
async def edit_pdf(
    file: UploadFile = File(...),
    comment: str = Form("Editado con EditorPDF"),
    x: float = Form(72), y: float = Form(72),
    font_size: float = Form(12), color: str = Form("#FF0000"),
    apply_to_all: bool = Form(True), page_num: int = Form(0),
):
    file_id = str(uuid.uuid4())
    input_file = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(input_file, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    try:
        rgb = hex_to_rgb(color)
        doc = fitz.open(input_file)
        pages = range(len(doc)) if apply_to_all else [page_num]
        for i in pages:
            if 0 <= i < len(doc):
                doc[i].insert_text((x, y), comment, fontsize=font_size, color=rgb)
        base, _ = os.path.splitext(input_file)
        output_file = f"{base}_edited.pdf"
        doc.save(output_file)
        doc.close()
    except Exception as e:
        return {"error": f"Error al editar PDF: {str(e)}"}
    return {"message": "Edición exitosa", "output_file": os.path.basename(output_file)}


@app.post("/extract/")
async def extract_text(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    input_file = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
    with open(input_file, "wb") as buf:
        shutil.copyfileobj(file.file, buf)
    try:
        doc = fitz.open(input_file)
        blocks = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_dict = page.get_text("dict")
            for block in page_dict.get("blocks", []):
                if block.get("type") != 0:
                    continue
                text_parts, font_size, color = [], 12, "#000000"
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        t = span.get("text", "")
                        if t.strip():
                            text_parts.append(t)
                        font_size = round(span.get("size", 12))
                        c = span.get("color", 0)
                        if isinstance(c, int):
                            color = f"#{(c >> 16) & 0xFF:02x}{(c >> 8) & 0xFF:02x}{c & 0xFF:02x}"
                full_text = " ".join(text_parts).strip()
                if not full_text:
                    continue
                bb = block["bbox"]
                blocks.append({
                    "id": f"p{page_num}_b{block.get('number', len(blocks))}",
                    "page": page_num,
                    "x0": round(bb[0]), "y0": round(bb[1]),
                    "x1": round(bb[2]), "y1": round(bb[3]),
                    "text": full_text, "font_size": font_size, "color": color,
                })
        doc.close()
        return {"blocks": blocks, "file_id": file_id}
    except Exception as e:
        return {"error": f"Error al extraer texto: {str(e)}"}


@app.post("/edit-blocks/")
async def edit_blocks(file_id: str = Form(...), edits: str = Form(...)):
    files = [f for f in os.listdir(UPLOAD_DIR) if f.startswith(file_id)]
    if not files:
        return {"error": "Archivo no encontrado. Vuelve a cargar el PDF."}
    input_file = os.path.join(UPLOAD_DIR, files[0])
    try:
        edits_list = json.loads(edits)
        doc = fitz.open(input_file)
        for edit in edits_list:
            page = doc[edit["page"]]
            rect = fitz.Rect(edit["x0"], edit["y0"], edit["x1"], edit["y1"])
            shape = page.new_shape()
            shape.draw_rect(rect)
            shape.finish(fill=(1, 1, 1), color=(1, 1, 1), width=0)
            shape.commit()
            page.insert_textbox(
                rect, edit["new_text"],
                fontsize=float(edit.get("font_size", 12)),
                fontname=edit.get("font", "helv"),
                color=hex_to_rgb(edit.get("color", "#000000")),
                align=0,
            )
        base, _ = os.path.splitext(input_file)
        output_file = f"{base}_edited.pdf"
        doc.save(output_file)
        doc.close()
    except Exception as e:
        return {"error": f"Error al aplicar ediciones: {str(e)}"}
    return {"message": "Ediciones aplicadas", "output_file": os.path.basename(output_file)}


@app.post("/improve-text/")
async def improve_text(text: str = Form(...)):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return {"error": "ANTHROPIC_API_KEY no configurada en el servidor."}
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1024,
            messages=[{"role": "user", "content": (
                "Mejora el siguiente texto de un documento, haciéndolo más claro, "
                "profesional y bien redactado. Mantén el mismo significado e idioma. "
                "Responde ÚNICAMENTE con el texto mejorado, sin explicaciones ni comillas:\n\n"
                + text
            )}],
        )
        return {"improved_text": response.content[0].text}
    except ImportError:
        return {"error": "Paquete 'anthropic' no instalado en el servidor."}
    except Exception as e:
        return {"error": f"Error con IA: {str(e)}"}


# ── PDF Utilities (Merge, Split, Compress) ────────────────────────────────

@app.post("/merge-pdf/")
async def merge_pdf(files: list[UploadFile] = File(...)):
    """Merge multiple PDF files into one."""
    if len(files) < 2:
        return {"error": "Se necesitan al menos 2 PDFs para fusionar."}

    try:
        temp_paths = []

        # Save all files first
        for file in files:
            if not file.filename.lower().endswith(".pdf"):
                return {"error": f"'{file.filename}' no es un PDF."}

            temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
            content = await file.read()
            with open(temp_path, "wb") as f:
                f.write(content)
            temp_paths.append(temp_path)

        # Now merge using fitz instead of PyPDF2
        output_name = f"{uuid.uuid4()}_merged.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_name)

        merged_doc = fitz.open()

        for temp_path in temp_paths:
            try:
                doc = fitz.open(temp_path)
                merged_doc.insert_pdf(doc)
                doc.close()
            except Exception as e:
                print(f"Error merging {temp_path}: {e}")
                raise

        merged_doc.save(output_path)
        merged_doc.close()

        # Cleanup
        for path in temp_paths:
            try:
                os.remove(path)
            except:
                pass

        return {"message": "PDFs fusionados", "output_file": output_name}
    except Exception as e:
        print(f"Merge error: {str(e)}")
        return {"error": f"Error al fusionar: {str(e)}"}


@app.post("/split-pdf/")
async def split_pdf(file: UploadFile = File(...), start_page: int = Form(0), end_page: int = Form(-1)):
    """Extract pages from a PDF (0-indexed)."""
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Solo se aceptan archivos PDF."}

    try:
        temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        # Use PyMuPDF for splitting
        doc = fitz.open(temp_path)
        total_pages = len(doc)

        if start_page < 0:
            start_page = 0
        if end_page < 0 or end_page >= total_pages:
            end_page = total_pages - 1

        if start_page > end_page:
            doc.close()
            os.remove(temp_path)
            return {"error": f"Páginas inválidas: {start_page}-{end_page}"}

        # Create new PDF with selected pages
        new_doc = fitz.open()
        for page_num in range(start_page, min(end_page + 1, total_pages)):
            new_doc.insert_pdf(doc, from_page=page_num, to_page=page_num)

        base = os.path.splitext(file.filename)[0]
        output_name = f"{uuid.uuid4()}_{base}_pages_{start_page+1}-{end_page+1}.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_name)

        new_doc.save(output_path)
        new_doc.close()
        doc.close()
        os.remove(temp_path)

        return {"message": "PDF dividido", "output_file": output_name}
    except Exception as e:
        print(f"Split error: {str(e)}")
        return {"error": f"Error al dividir: {str(e)}"}


@app.post("/compress-pdf/")
async def compress_pdf(file: UploadFile = File(...), quality: int = Form(2)):
    """Compress PDF or image files."""
    if not file.filename:
        return {"error": "Nombre de archivo vacío."}

    try:
        temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
        base = os.path.splitext(file.filename)[0]
        output_name = f"{uuid.uuid4()}_{base}_compressed.{ext}"
        output_path = os.path.join(UPLOAD_DIR, output_name)

        # PDF compression
        if ext == "pdf":
            doc = fitz.open(temp_path)
            # Use garbage collection and deflate compression
            doc.save(output_path, garbage=4, deflate=True)
            doc.close()

        # Image compression
        elif ext in ("jpg", "jpeg", "png", "webp", "bmp"):
            img = PILImage.open(temp_path)

            # Quality levels: 0=no reduction, 1=10%, 2=20%, 3=30%
            scale = max(0.5, 1 - (quality * 0.1))
            new_width = max(50, int(img.width * scale))
            new_height = max(50, int(img.height * scale))
            img_resized = img.resize((new_width, new_height), PILImage.LANCZOS)

            if ext == "png":
                img_resized.save(output_path, "PNG", optimize=True)
            else:
                quality_jpeg = [95, 85, 75, 60][min(quality, 3)]
                img_resized.save(output_path, "JPEG", quality=quality_jpeg, optimize=True)

        else:
            # For other files, just copy
            shutil.copy(temp_path, output_path)

        os.remove(temp_path)
        return {"message": "Archivo comprimido", "output_file": output_name}
    except Exception as e:
        print(f"Compress error: {str(e)}")
        return {"error": f"Error al comprimir: {str(e)}"}


@app.post("/ocr-pdf/")
async def ocr_pdf(file: UploadFile = File(...)):
    """Extract text from images or scanned PDFs using OCR (pytesseract)."""
    try:
        import pytesseract

        temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        imgs = []
        fname = (file.filename or "").lower()
        if fname.endswith(".pdf"):
            doc = fitz.open(temp_path)
            for page_idx, page in enumerate(doc):
                pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
                img = PILImage.frombytes("RGB", [pix.width, pix.height], pix.samples)
                imgs.append((page_idx + 1, img))
            doc.close()
        else:
            imgs.append((1, PILImage.open(temp_path)))

        all_text = []
        for page_num, img in imgs:
            try:
                text = pytesseract.image_to_string(img, lang="spa+eng")
                all_text.append(f"--- PÁGINA {page_num} ---\n{text.strip()}")
            except Exception as e:
                all_text.append(f"--- PÁGINA {page_num} ---\nNo se pudo procesar: {e}")

        output_name = f"{uuid.uuid4()}_ocr.txt"
        output_path = os.path.join(UPLOAD_DIR, output_name)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n\n".join(all_text))

        os.remove(temp_path)
        return {"message": "OCR completado", "output_file": output_name}

    except Exception as e:
        print(f"OCR error: {str(e)}")
        return {"error": f"Error en OCR: {str(e)}"}


@app.post("/watermark-pdf/")
async def watermark_pdf(
    file: UploadFile = File(...),
    text: str = Form("CONFIDENCIAL"),
    opacity: float = Form(0.3),
    font_size: int = Form(48),
    color: str = Form("#FF0000"),
):
    """Add a diagonal text watermark to every page of a PDF."""
    if not file.filename.lower().endswith(".pdf"):
        return {"error": "Solo se aceptan archivos PDF."}

    try:
        import math

        temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}_{file.filename}")
        content = await file.read()
        with open(temp_path, "wb") as f:
            f.write(content)

        doc = fitz.open(temp_path)

        # Parse color
        r, g, b = hex_to_rgb(color.lstrip("#") if not color.startswith("#") else color)

        for page in doc:
            pw, ph = page.rect.width, page.rect.height
            # Place watermark text diagonally across the page
            center_x = pw / 2
            center_y = ph / 2
            angle = -45  # degrees

            page.insert_text(
                fitz.Point(center_x - font_size * len(text) * 0.3, center_y),
                text,
                fontsize=font_size,
                color=(r, g, b),
                rotate=angle,
                overlay=True,
            )

        base = os.path.splitext(file.filename)[0]
        output_name = f"{uuid.uuid4()}_{base}_watermark.pdf"
        output_path = os.path.join(UPLOAD_DIR, output_name)
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        os.remove(temp_path)

        return {"message": "Marca de agua añadida", "output_file": output_name}
    except Exception as e:
        print(f"Watermark error: {str(e)}")
        return {"error": f"Error al añadir marca de agua: {str(e)}"}


@app.post("/share/")
async def share_file(file: UploadFile = File(...)):
    """Store a file and return a shareable token."""
    try:
        token = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1]
        stored_name = f"{token}{ext}"
        stored_path = os.path.join(UPLOAD_DIR, stored_name)
        content = await file.read()
        with open(stored_path, "wb") as f:
            f.write(content)
        return {"token": token, "filename": stored_name}
    except Exception as e:
        return {"error": f"Error al compartir: {str(e)}"}


# ── Stripe / Payments ─────────────────────────────────────────────────────────

def get_or_create_subscription(db, email: str) -> Subscription:
    sub = db.query(Subscription).filter(Subscription.email == email).first()
    if not sub:
        sub = Subscription(email=email, status="free")
        db.add(sub)
        db.commit()
        db.refresh(sub)
    return sub


@app.post("/create-checkout-session")
async def create_checkout_session(request: Request):
    try:
        body = await request.json()
        email = body.get("email")
        if not email:
            return JSONResponse({"error": "Email requerido"}, status_code=400)
        if not stripe.api_key:
            return JSONResponse({"error": "Stripe no configurado"}, status_code=500)

        db = SessionLocal()
        sub = get_or_create_subscription(db, email)

        # Reuse existing Stripe customer if we have one
        customer_id = sub.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(email=email)
            customer_id = customer.id
            sub.stripe_customer_id = customer_id
            db.commit()
        db.close()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
            mode="subscription",
            success_url=f"{FRONTEND_URL}/pricing?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/pricing?canceled=true",
            metadata={"email": email},
        )
        return {"url": session.url}
    except stripe.StripeError as e:
        return JSONResponse({"error": str(e)}, status_code=400)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.get("/subscription-status")
async def subscription_status(email: str):
    if not email:
        return {"status": "free", "isPremium": False}
    db = SessionLocal()
    sub = get_or_create_subscription(db, email)
    is_premium = sub.status == "active" and (
        sub.current_period_end is None or sub.current_period_end > datetime.datetime.utcnow()
    )
    result = {
        "status": sub.status,
        "isPremium": is_premium,
        "currentPeriodEnd": sub.current_period_end.isoformat() if sub.current_period_end else None,
    }
    db.close()
    return result


@app.post("/customer-portal")
async def customer_portal(request: Request):
    try:
        body = await request.json()
        email = body.get("email")
        if not email:
            return JSONResponse({"error": "Email requerido"}, status_code=400)
        db = SessionLocal()
        sub = db.query(Subscription).filter(Subscription.email == email).first()
        db.close()
        if not sub or not sub.stripe_customer_id:
            return JSONResponse({"error": "Sin suscripción activa"}, status_code=404)
        portal = stripe.billing_portal.Session.create(
            customer=sub.stripe_customer_id,
            return_url=f"{FRONTEND_URL}/pricing",
        )
        return {"url": portal.url}
    except stripe.StripeError as e:
        return JSONResponse({"error": str(e)}, status_code=400)


@app.post("/stripe-webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except stripe.SignatureVerificationError:
        return JSONResponse({"error": "Invalid signature"}, status_code=400)

    db = SessionLocal()
    try:
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            email = session.get("metadata", {}).get("email") or session.get("customer_details", {}).get("email")
            stripe_sub_id = session.get("subscription")
            customer_id = session.get("customer")
            if email and stripe_sub_id:
                sub = get_or_create_subscription(db, email)
                sub.stripe_customer_id = customer_id
                sub.stripe_subscription_id = stripe_sub_id
                sub.status = "active"
                db.commit()

        elif event["type"] in ("customer.subscription.updated", "customer.subscription.deleted"):
            stripe_sub = event["data"]["object"]
            customer_id = stripe_sub.get("customer")
            sub = db.query(Subscription).filter(Subscription.stripe_customer_id == customer_id).first()
            if sub:
                sub.status = stripe_sub.get("status")  # "active", "canceled", "past_due"
                period_end = stripe_sub.get("current_period_end")
                if period_end:
                    sub.current_period_end = datetime.datetime.utcfromtimestamp(period_end)
                sub.updated_at = datetime.datetime.utcnow()
                db.commit()
    finally:
        db.close()

    return {"received": True}


# ── Lemon Squeezy ─────────────────────────────────────────────────────────────

@app.post("/lemon-checkout")
async def lemon_checkout(request: Request):
    """Return a Lemon Squeezy checkout URL with email pre-filled."""
    try:
        body = await request.json()
        email = body.get("email", "")
        variant_id = LEMON_VARIANT_ID
        if not variant_id:
            return JSONResponse({"error": "Lemon Squeezy no configurado"}, status_code=500)
        import urllib.parse
        base = f"https://docufloww.lemonsqueezy.com/checkout/buy/{variant_id}"
        params = urllib.parse.urlencode({
            "checkout[email]": email,
            "checkout[custom][user_email]": email,
        })
        url = f"{base}?{params}"
        return {"url": url}
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)


@app.post("/lemon-webhook")
async def lemon_webhook(request: Request, x_signature: str = Header(None, alias="X-Signature")):
    """Handle Lemon Squeezy webhook events."""
    payload = await request.body()

    # Verify signature
    if LEMON_WEBHOOK_SECRET and LEMON_WEBHOOK_SECRET != "pending":
        expected = hmac.new(
            LEMON_WEBHOOK_SECRET.encode("utf-8"), payload, hashlib.sha256
        ).hexdigest()
        if not hmac.compare_digest(expected, x_signature or ""):
            return JSONResponse({"error": "Invalid signature"}, status_code=400)

    try:
        data = json.loads(payload)
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    event_name = data.get("meta", {}).get("event_name", "")
    attrs = data.get("data", {}).get("attributes", {})
    custom = data.get("meta", {}).get("custom_data", {})
    email = custom.get("user_email") or attrs.get("user_email") or attrs.get("customer_email", "")

    if not email:
        # Try to get from order user email
        email = attrs.get("user_email", "")

    db = SessionLocal()
    try:
        if event_name in ("order_created", "subscription_created") and email:
            sub = get_or_create_subscription(db, email)
            sub.status = "active"
            ends_at = attrs.get("ends_at") or attrs.get("renews_at")
            if ends_at:
                try:
                    sub.current_period_end = datetime.datetime.fromisoformat(ends_at.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    pass
            sub.updated_at = datetime.datetime.utcnow()
            db.commit()

        elif event_name == "subscription_updated" and email:
            sub = db.query(Subscription).filter(Subscription.email == email).first()
            if sub:
                status = attrs.get("status", "")
                sub.status = "active" if status == "active" else status
                ends_at = attrs.get("ends_at") or attrs.get("renews_at")
                if ends_at:
                    try:
                        sub.current_period_end = datetime.datetime.fromisoformat(ends_at.replace("Z", "+00:00")).replace(tzinfo=None)
                    except Exception:
                        pass
                sub.updated_at = datetime.datetime.utcnow()
                db.commit()

        elif event_name in ("subscription_cancelled", "subscription_expired") and email:
            sub = db.query(Subscription).filter(Subscription.email == email).first()
            if sub:
                sub.status = "canceled"
                sub.updated_at = datetime.datetime.utcnow()
                db.commit()
    finally:
        db.close()

    return {"received": True}
