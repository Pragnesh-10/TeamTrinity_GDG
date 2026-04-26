import os
import secrets
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, APIKeyHeader
from firebase_admin import auth

security = HTTPBearer()
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key_header: str = Security(api_key_header)):
    # Hackathon Demo: Use environment variable or simple check
    EXPECTED_API_KEY = os.getenv("API_KEY", "hackathon_demo_key_123")
    if api_key_header == EXPECTED_API_KEY:
        return api_key_header
    raise HTTPException(status_code=403, detail="Could not validate API Key")

def generate_api_key():
    return f"fp_{secrets.token_hex(16)}"

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Vulnerability 2: Authentication & Authorization
    Extracts the Firebase JWT Token, verifies it, and prevents unauthenticated access. 
    Tokens naturally expire and this guarantees session expiration. No hardcoded secrets used.
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except auth.RevokedIdTokenError:
        raise HTTPException(status_code=401, detail="Token has been revoked.")
    except auth.InvalidIdTokenError:
        raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication required.")
