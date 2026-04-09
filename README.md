# AI Business Co-Founder 🤖

## Overview

**AI Business Co-Founder** is an intelligent web application that helps business owners make data-driven decisions by leveraging AI and Retrieval-Augmented Generation (RAG). Upload your business documents, ask questions, and get instant AI-powered insights with actionable recommendations.

## Problem Solved 💡

Business owners face critical challenges:
- **Information Overload**: Difficulty analyzing large amounts of business documents
- **Time Constraints**: Limited time to review contracts, plans, and reports
- **Decision Making**: Uncertainty on growth opportunities and risk assessment
- **Manual Analysis**: Tedious manual document review processes

**Solution**: AI Business Co-Founder automates document analysis and provides intelligent business insights in seconds.

---

## Key Features ✨

✅ **User Authentication** - Secure signup and login with password hashing  
✅ **Document Upload** - Support for multiple file formats (PDF, TXT, DOCX)  
✅ **AI-Powered Analysis** - Ask business questions about your documents  
✅ **RAG System** - Context-aware responses based on your actual data  
✅ **MongoDB Storage** - Secure cloud storage for documents and user data  
✅ **Modern UI** - Responsive, user-friendly dashboard  
✅ **Real-time Chat** - Interactive Q&A interface  

---

## Technology Stack 🛠️

### Backend
- **Framework**: FastAPI (async Python web framework)
- **Database**: MongoDB (document storage)
- **AI/ML**: 
  - LangChain (orchestration)
  - OpenAI (LLM)
  - FAISS (vector search)
  - PyPDF (document parsing)
- **Auth**: Passlib + Python-Jose (secure authentication)

### Frontend
- **HTML/CSS/JavaScript** (vanilla - no framework)
- **Local Storage** (session management)
- **Fetch API** (HTTP requests)
- **Responsive Design** (mobile-friendly)

---

## Project Structure 📁

```
genai-business-cofounder/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app & routes
│   │   ├── auth.py            # Password hashing & verification
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # MongoDB operations
│   │   ├── models.py          # Pydantic models
│   │   ├── ingest.py          # Document text extraction
│   │   ├── rag.py             # RAG system & vector search
│   │   ├── llm.py             # LLM interactions
│   │   └── schemas.py         # Response schemas
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # Web UI
│   ├── index.html             # Homepage
│   ├── login.html             # Login page
│   ├── signup.html            # Signup page
│   ├── demo.html              # Main dashboard
│   ├── app.js                 # Main app logic
│   ├── auth.js                # Authentication logic
│   ├── demo.js                # Demo-specific logic
│   └── style.css              # Styling
│
├── pyproject.toml             # Project metadata
└── README.md                  # This file
```

---

## Project Flow 🔄

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Web UI)                       │
│  [HTML] → [JavaScript] → [LocalStorage] → [Fetch API]     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Auth API   │  │  Upload API  │  │   Query API  │    │
│  │ /signup      │  │ /upload      │  │ /context     │    │
│  │ /login       │  │ /delete      │  │ /ask         │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└──────────────┬───────────────────┬────────────────┬────────┘
               │                   │                │
        ┌──────▼──────┐    ┌───────▼───────┐   ┌──▼─────────┐
        │  MongoDB    │    │  PyPDF +      │   │ LangChain  │
        │  Database   │    │  Text Extract │   │ + OpenAI   │
        │             │    │               │   │ + FAISS    │
        └─────────────┘    └───────────────┘   └────────────┘
```

### User Flow

```
1. AUTHENTICATION
   User → Signup/Login → Frontend (LocalStorage) → Backend DB

2. DOCUMENT UPLOAD
   User → Select Files → Upload → Backend extracts text → MongoDB stores

3. AI ANALYSIS
   User → Ask Question → Frontend sends query → Backend RAG pipeline:
   a) Search relevant document chunks (FAISS)
   b) Build context from matches
   c) Send to OpenAI with context
   d) Return answer to frontend

4. LOGOUT
   User → Click Logout → Clear LocalStorage → Redirect to Home
```

---

## Installation & Setup 🚀

### Prerequisites
- Python 3.10+
- Node.js (optional, for local development)
- MongoDB account (Atlas or local)
- OpenAI API key

### Step 1: Clone & Navigate
```bash
git clone https://github.com/yourname/genai-business-cofounder.git
cd genai-business-cofounder
```

### Step 2: Create Virtual Environment
```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 4: Set Environment Variables
Create a `.env` file in the `backend/` directory:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
OPENAI_API_KEY=sk-your-key-here
ENVIRONMENT=development
```

### Step 5: Run Backend Server
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`

### Step 6: Run Frontend
Open `frontend/index.html` in a web browser or use a local server:
```bash
# Using Python
python -m http.server 8080 --directory frontend

# Using Node
npx http-server frontend
```

Frontend runs at: `http://localhost:8080`

---

## How to Use 📖

### 1. **Create Account**
   - Go to `http://localhost:8080`
   - Click "Sign Up"
   - Fill in Name, Email, Password
   - (Optional) Add profile picture URL
   - Click "Create Account"

### 2. **Login**
   - Click "Sign In"
   - Enter email and password
   - Click "Sign In" button
   - Redirects to Demo dashboard

### 3. **Upload Documents**
   - On Demo page, select files (PDF, TXT, DOCX)
   - Click "Upload Selected"
   - Wait for upload confirmation

### 4. **Ask Questions**
   - Type your business question
   - Click "Send"
   - AI analyzes your documents and responds
   - View chat history

### 5. **Logout**
   - Click your profile picture/name in header
   - Click "Logout" button
   - Returns to home page

---

## API Endpoints 🔌

### Authentication
```
POST   /signup           - Create new user
POST   /login            - Authenticate user
```

### Documents
```
POST   /upload           - Upload and index documents
GET    /documents        - List user documents
DELETE /documents/{id}   - Delete a document
```

### RAG & Chat
```
GET    /context?query=...  - Get relevant context
POST   /ask                - Ask AI question
```

---

## Database Schema 📊

### Users Collection
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "hashed_password",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Documents Collection
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "filename": "business_plan.pdf",
  "content": "extracted text...",
  "chunks": ["chunk1", "chunk2"],
  "vectors": [embedding_vectors],
  "uploaded_at": "2024-01-01T00:00:00Z"
}
```

---

## Environment Variables 🔐

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ENVIRONMENT` | Development/Production | `development` |

---

## Troubleshooting 🔧

### Backend won't start
```
Error: Module not found
→ Solution: pip install -r backend/requirements.txt
```

### MongoDB connection failed
```
Error: Connection refused
→ Check MONGODB_URL in .env
→ Ensure MongoDB is running or Atlas cluster is active
```

### Login still shows "No accounts"
```
→ Create account in signup first
→ Check browser localStorage (Dev Tools → Application)
```

### Profile picture not showing
```
→ If no URL provided, initials display instead (first name + last name)
→ Add valid image URL in signup to show custom picture
```

---

## Future Enhancements 📈

- [ ] Reseller module with sub-reseller support
- [ ] Multi-document analysis
- [ ] Export insights as PDF
- [ ] Advanced analytics dashboard
- [ ] API key management for resellers
- [ ] Billing & commission tracking
- [ ] White-labeling support
- [ ] Advanced permission system

---

## Security Notes 🔒

⚠️ **Important**:
- Passwords are hashed with bcrypt
- Frontend auth uses localStorage (demo only - use JWT tokens for production)
- CORS enabled for development (restrict in production)
- Never commit `.env` file with real credentials

---

## Contributing 🤝

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add your feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open Pull Request

---

## License 📄

MIT License - feel free to use this project!

---

## Support 💬

For issues, questions, or feedback:
- Open an Issue on GitHub
- Check existing documentation
- Review API logs in backend console

---

**Happy coding! 🚀**
