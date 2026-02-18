from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password: str

class Question(BaseModel):
    query: str
