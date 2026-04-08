from pymongo import MongoClient, errors
import gridfs
from app.config import MONGO_URI, DB_NAME
from datetime import datetime
from bson.objectid import ObjectId
import logging
import json
import os

logger = logging.getLogger(__name__)

# Fallback file-based storage for users (when MongoDB is down)
USERS_FALLBACK_FILE = "users.json"

def _load_fallback_users():
	"""Load users from JSON file (fallback when MongoDB is down)."""
	if os.path.exists(USERS_FALLBACK_FILE):
		try:
			with open(USERS_FALLBACK_FILE, 'r') as f:
				return json.load(f)
		except:
			return []
	return []

def _save_fallback_users(users):
	"""Save users to JSON file (fallback when MongoDB is down)."""
	with open(USERS_FALLBACK_FILE, 'w') as f:
		json.dump(users, f, indent=2, default=str)

# create client (lazy connection)
client = MongoClient(MONGO_URI)
mongodb_available = False

def test_connection(timeout_ms: int = 5000) -> bool:
	"""Try to ping the MongoDB server. Returns True if reachable."""
	global mongodb_available
	try:
		client.admin.command("ping", readPreference="primary", maxTimeMS=timeout_ms)
		mongodb_available = True
		return True
	except Exception as e:
		logger.warning("MongoDB ping failed: %s", e)
		mongodb_available = False
		return False


def ensure_connection_or_raise():
	"""Ensure MongoDB is reachable; raise RuntimeError with hints if not."""
	try:
		client.admin.command("ping")
	except errors.PyMongoError as e:
		msg = (
			"Cannot connect to MongoDB. Check MONGO_URI, network, and credentials. "
			"Example local URI: mongodb://localhost:27017. "
			"Example auth URI: mongodb://user:password@host:27017/?authSource=admin"
		)
		logger.error(msg + " Error: %s", e)
		raise RuntimeError(msg) from e


# get database and GridFS (after client created)
db = client[DB_NAME]
fs = gridfs.GridFS(db)

users_collection = db["users"]
documents_collection = db["documents"]


def save_file(file_bytes: bytes, filename: str, content_type: str | None = None) -> ObjectId:
	"""Save raw file bytes to GridFS and return the ObjectId."""
	grid_id = fs.put(file_bytes, filename=filename, contentType=content_type, uploaded_at=datetime.utcnow())
	return grid_id


def get_file(grid_id: ObjectId) -> bytes:
	"""Retrieve raw file bytes from GridFS by ObjectId."""
	g = fs.get(grid_id)
	return g.read()


def create_user(email: str, hashed_password: str) -> dict:
	"""Create a new user in MongoDB (or fallback to JSON file)."""
	user_data = {
		"_id": f"u_{int(datetime.utcnow().timestamp() * 1000)}",
		"email": email,
		"password": hashed_password,
		"created_at": datetime.utcnow().isoformat()
	}
	
	if mongodb_available:
		try:
			result = users_collection.insert_one(user_data)
			user_data["_id"] = str(result.inserted_id)
		except Exception as e:
			logger.warning("MongoDB write failed, using fallback: %s", e)
			users = _load_fallback_users()
			users.append(user_data)
			_save_fallback_users(users)
	else:
		# Use JSON file fallback
		users = _load_fallback_users()
		users.append(user_data)
		_save_fallback_users(users)
		logger.info("✅ User created (using JSON fallback): %s", email)
	
	return user_data


def get_user_by_email(email: str) -> dict | None:
	"""Retrieve user by email from MongoDB (or fallback to JSON file)."""
	if mongodb_available:
		try:
			return users_collection.find_one({"email": email})
		except Exception as e:
			logger.warning("MongoDB read failed, using fallback: %s", e)
	
	# Use JSON file fallback
	users = _load_fallback_users()
	for user in users:
		if user.get("email") == email:
			return user
	return None


def user_exists(email: str) -> bool:
	"""Check if user already exists."""
	if mongodb_available:
		try:
			return users_collection.find_one({"email": email}) is not None
		except Exception as e:
			logger.warning("MongoDB read failed, using fallback: %s", e)
	
	# Use JSON file fallback
	users = _load_fallback_users()
	return any(user.get("email") == email for user in users)


def get_all_users() -> list:
	"""Retrieve all users (without passwords) from MongoDB or JSON file."""
	users_list = []
	
	if mongodb_available:
		try:
			users_cursor = users_collection.find({}, {"password": 0})  # Exclude password field
			users_list = list(users_cursor)
			# Convert ObjectId to string
			for user in users_list:
				if "_id" in user:
					user["_id"] = str(user["_id"])
		except Exception as e:
			logger.warning("MongoDB read failed, using fallback: %s", e)
	
	if not users_list:
		# Use JSON file fallback
		users = _load_fallback_users()
		users_list = []
		for user in users:
			# Exclude password from response
			safe_user = {k: v for k, v in user.items() if k != "password"}
			users_list.append(safe_user)
	
	return users_list
