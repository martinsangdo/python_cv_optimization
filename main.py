from flask import Flask, request, send_file, jsonify
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from html2docx import html2docx
import uuid
import os

app = Flask(__name__)

# Setup template engine
env = Environment(loader=FileSystemLoader("templates"))

OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# 🔹 Render HTML from template
def render_resume(template_name, data):
    template = env.get_template(template_name)
    return template.render(data)


# 🔹 Generate PDF
def generate_pdf(html_content, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    HTML(string=html_content).write_pdf(path)
    return path


# 🔹 Generate DOCX
def generate_docx(html_content, filename):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "wb") as f:
        f.write(html2docx(html_content))
    return path


# 🔹 API: Generate Resume
@app.route("/generate_resume", methods=["POST"])
def generate_resume():

    data = request.json

    resume_json = data.get("resume_json")
    template_name = data.get("template", "classic.html")
    file_type = data.get("format", "pdf")

    if not resume_json:
        return jsonify({"error": "Missing resume_json"}), 400

    # Render HTML
    html = render_resume(template_name, resume_json)

    # Unique filename
    file_id = str(uuid.uuid4())

    if file_type == "pdf":
        filename = f"{file_id}.pdf"
        path = generate_pdf(html, filename)

    elif file_type == "docx":
        filename = f"{file_id}.docx"
        path = generate_docx(html, filename)

    else:
        return jsonify({"error": "Invalid format"}), 400

    return send_file(path, as_attachment=True)


# 🔹 Health check (for Render / UptimeRobot)
@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    app.run(debug=True)