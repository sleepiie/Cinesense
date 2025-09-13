from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from db import get_connection
from password_utills import hash_password

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI! API is working."}

class UserRegister(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserRegister):
    conn = get_connection()
    cur = conn.cursor()

    # hash password ก่อนเก็บ
    hashed_pw = hash_password(user.password)

    try:
        cur.execute(
            "INSERT INTO users (user_name, password_hash) VALUES (%s, %s)",
            (user.username, hashed_pw)
        )
        conn.commit()
        return{
            "message": "User registered successfully!",
            "user_registered": user.username,  # ชื่อ username ที่ลงทะเบียน
            "password_hash": hashed_pw
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Register failed: {e}")
    finally:
        cur.close()
        conn.close()
