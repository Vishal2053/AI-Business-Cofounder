from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.ingest import extract_text
from app.rag import get_context, add_document
from app.database import save_file, documents_collection, ensure_connection_or_raise, create_user, get_user_by_email, user_exists, test_connection, get_all_users
from app.models import User
from app.auth import hash_password, verify_password
from datetime import datetime

app = FastAPI(title="GenAI Business Co-Founder")

# 🔓 Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Startup event to verify MongoDB connection (non-blocking)
@app.on_event("startup")
def startup_event():
    """Verify MongoDB connection on app startup."""
    import sys
    
    # Check MongoDB availability
    mongo_available = test_connection(timeout_ms=3000)
    
    if mongo_available:
        print("✅ MongoDB connection established")
    else:
        print(f"\n⚠️  WARNING: MongoDB not accessible")

@app.post("/signup")
async def signup(user: User):
    """Create a new user account."""
    try:
        email = user.email.lower()
        
        # Check if user already exists
        if user_exists(email):
            raise HTTPException(status_code=409, detail="Email already registered")
        
        # Hash password and create user
        hashed_pw = hash_password(user.password)
        created_user = create_user(email, hashed_pw)
        return {
            "message": "User created successfully",
            "user_id": created_user.get("_id"),
            "email": email
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Signup error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Signup failed: {str(e)}")


@app.post("/login")
async def login(user: User):
    """Authenticate user and return success status."""
    try:
        email = user.email.lower()
        
        # Find user in database
        db_user = get_user_by_email(email)
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(user.password, db_user["password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Return user info (without password)
        return {
            "message": "Login successful",
            "user_id": str(db_user.get("_id")),
            "email": db_user["email"]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/users")
def get_users():
    """Retrieve all registered users (without passwords)."""
    try:
        users = get_all_users()
        return {
            "message": f"Found {len(users)} user(s)",
            "total": len(users),
            "users": users
        }
    except Exception as e:
        print(f"❌ Get users error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve users: {str(e)}")


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = extract_text(content, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # save raw file bytes to GridFS and store metadata + extracted text
    grid_id = save_file(content, file.filename, getattr(file, "content_type", None))
    doc = {
        "filename": file.filename,
        "content_type": getattr(file, "content_type", None),
        "gridfs_id": grid_id,
        "text": text,
        "uploaded_at": datetime.utcnow(),
    }
    res = documents_collection.insert_one(doc)

    # keep in-memory index for retrieval currently used by RAG
    add_document(text)

    return {"message": "Document indexed", "document_id": str(res.inserted_id)}

@app.get("/context")
def fetch_context(query: str):
    context = get_context(query)
    return {"context": context}


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Backend is running"}
