from datetime import datetime, timedelta
from typing import Optional, Dict
import secrets

# In-memory session store (ในการใช้งานจริงควรใช้ Redis)
sessions: Dict[str, dict] = {}

SESSION_EXPIRE_MINUTES = 600

def create_session(user_id: int, username: str) -> str:
    """สร้าง session ใหม่สำหรับ user"""
    session_id = secrets.token_urlsafe(32)
    sessions[session_id] = {
        "user_id": user_id,
        "username": username,
        "expires": datetime.now() + timedelta(minutes=SESSION_EXPIRE_MINUTES)
    }
    return session_id

def get_session(session_id: str) -> Optional[dict]:
    """ดึงข้อมูล session และ refresh expire time"""
    if not session_id:
        return None
    
    session = sessions.get(session_id)
    if session and session["expires"] > datetime.now():
        # Refresh session expiry
        session["expires"] = datetime.now() + timedelta(minutes=SESSION_EXPIRE_MINUTES)
        return session
    elif session:
        # Session หมดอายุ ลบออก
        del sessions[session_id]
    return None

def delete_session(session_id: str) -> bool:
    """ลบ session (สำหรับ logout)"""
    if session_id in sessions:
        del sessions[session_id]
        return True
    return False

def cleanup_expired_sessions():
    """ลบ session ที่หมดอายุทั้งหมด"""
    now = datetime.now()
    expired = [sid for sid, data in sessions.items() if data["expires"] <= now]
    for sid in expired:
        del sessions[sid]
    return len(expired)