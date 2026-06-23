import pdfplumber
from docx import Document

def read_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n\n"
    return text

def read_docx(file_path):
    doc = Document(file_path)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

print("=== BRIEF DE DEMARRAGE SITE VODUN CONCEPT STORE ===")
print(read_pdf("BRIEF DE DEMARRAGE SITE VODUN CONCEPT STORE.pdf"))
print("\n=== DECORATION FESTIVES VODUN CONCEPT STORE ===")
print(read_pdf("DECORATION FESTIVES VODUN CONCEPT STORE_125910.pdf"))
print("\n=== VODUN CONCEPT STORE VERSION 1 ===")
print(read_pdf("VODUN CONCEPT STORE VERSION 1.pdf"))
print("\n=== V CONCEPT STORE CATALOGUE DES PRODUITS ===")
print(read_docx("V CONCEPT STORE CATALOGUE DES PRODUITS.docx"))
