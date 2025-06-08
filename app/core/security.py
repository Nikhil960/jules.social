from passlib.context import CryptContext
from cryptography.fernet import Fernet
from .config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Fernet encryption key - MUST be 32 url-safe base64-encoded bytes
# For simplicity, we'll derive it from the SECRET_KEY. 
# In a production system, you might want to generate and store this separately and securely.
# Ensure SECRET_KEY is strong enough if using this method.
import base64
key = base64.urlsafe_b64encode(SECRET_KEY.encode()[:32].ljust(32, b'\0'))
fernet = Fernet(key)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def encrypt_data(data: str) -> bytes:
    return fernet.encrypt(data.encode())

def decrypt_data(encrypted_data: bytes) -> str:
    return fernet.decrypt(encrypted_data).decode()

# JWT Token Creation
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt