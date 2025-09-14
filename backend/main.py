from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import bcrypt 
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
            "INSERT INTO users (user_name, password_hash) VALUES (%s, %s) RETURNING user_id",
            (user.username, hashed_pw)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        return{
            "message": "User registered successfully!",
            "user_registered": user.username,  # ชื่อ username ที่ลงทะเบียน
            "password_hash": hashed_pw,
            "user id" : user_id
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Register failed: {e}")
    finally:
        cur.close()
        conn.close()


class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(user: UserLogin):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT user_id, user_name, password_hash FROM users WHERE user_name = %s",
            (user.username,)
        )
        db_user = cur.fetchone()

        if not db_user:
            return JSONResponse(status_code=404, content={"error": "ไม่มีผู้ใช้"})

        user_id, user_name, hashed_password = db_user

        if bcrypt.checkpw(user.password.encode("utf-8"), hashed_password.encode("utf-8")):
            return {
                "message": "Login successful!",
                "user_id": user_id,
                "username": user_name
            }
        else:
            return JSONResponse(status_code=401, content={"error": "รหัสผ่านไม่ถูกต้อง"})

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {e}")
    finally:
        cur.close()
        conn.close()

    # API สำหรับบันทึกโหวต
class VoteRequest(BaseModel):
    user_id: int
    movie_id: int
    vote: float
    
@app.post("/vote")
def vote_movie(vote_req: VoteRequest):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # ถ้า user เคยโหวตหนังเรื่องนี้แล้ว → อัพเดตคะแนน
        cur.execute(
            """
            INSERT INTO Watched (user_id, movie_id, vote)
            VALUES (%s, %s, %s)
            ON CONFLICT (user_id, movie_id)
            DO UPDATE SET vote = EXCLUDED.vote
            RETURNING watch_id
            """,
            (vote_req.user_id, vote_req.movie_id, vote_req.vote)
        )

        watch_id = cur.fetchone()[0]
        conn.commit()

        return {
            "message": "Vote saved successfully!",
            "watch_id": watch_id,
            "user_id": vote_req.user_id,
            "movie_id": vote_req.movie_id,
            "vote": vote_req.vote
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Vote failed: {e}")
    finally:
        cur.close()
        conn.close()