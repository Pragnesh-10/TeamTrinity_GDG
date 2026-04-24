import os
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth

security = HTTPBearer()

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
