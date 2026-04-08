import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI",)
DB_NAME = "genai_cofounder"
SECRET_KEY = "supersecretkey"
