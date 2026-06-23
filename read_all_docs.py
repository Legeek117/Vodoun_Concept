#!/usr/bin/env python3

import pdfplumber
from docx import Document

def read_full_pdf(path):
    print(f"\n{'='*80}")
    print(f"PDF: {path}")
    print(f"{'='*80}\n")
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    print(f"\n--- PAGE {i+1} ---\n")
                    print(text)
                if page.images:
                    print(f"\n[Found {len(page.images)} image(s) on page {i+1}]")
    except Exception as e:
        print(f"Error reading {path}: {e}")

def read_docx(path):
    print(f"\n{'='*80}")
    print(f"DOCX: {path}")
    print(f"{'='*80}\n")
    doc = Document(path)
    for i, para in enumerate(doc.paragraphs):
        if para.text.strip():
            print(para.text)

if __name__ == "__main__":
    read_full_pdf("VODUN CONCEPT STORE VERSION 1.pdf")
    read_full_pdf("DECORATION FESTIVES VODUN CONCEPT STORE_125910.pdf")
    read_docx("V CONCEPT STORE CATALOGUE DES PRODUITS.docx")
