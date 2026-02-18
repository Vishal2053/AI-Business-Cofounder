from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.ingest import extract_text
from app.rag import get_context, add_document

app = FastAPI(title="GenAI Business Co-Founder")

# 🔓 Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    text = extract_text(content, file.filename)
    add_document(text)
    return {"message": "Document indexed"}

@app.get("/context")
def fetch_context(query: str):
    context = get_context(query)
    return {"context": context}
