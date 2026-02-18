from io import BytesIO
import pandas as pd
from pypdf import PdfReader


def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract readable text from uploaded business files.
    Supported:
    - PDF
    - CSV
    - TXT
    """

    filename = filename.lower()

    # 📄 PDF files
    if filename.endswith(".pdf"):
        reader = PdfReader(BytesIO(file_bytes))
        text = []
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text.append(page_text)
        return "\n".join(text)

    # 📊 CSV files
    if filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(file_bytes))
        return df.to_string(index=False)

    # 📄 TXT files
    if filename.endswith(".txt"):
        return file_bytes.decode("utf-8", errors="ignore")

    # ❌ Unsupported files
    raise ValueError("Unsupported file type. Upload PDF, CSV, or TXT only.")
