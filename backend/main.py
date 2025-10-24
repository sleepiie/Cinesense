from fastapi import FastAPI, HTTPException, Cookie
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import bcrypt 
from db import get_connection
from password_utills import hash_password
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import pandas as pd
from typing import Optional
from session import create_session, get_session, delete_session
import redis
import json
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import subprocess
import logging
from datetime import datetime
import sys

load_dotenv()

EXPECTED_COLS = [
    'user_valence', 'user_arousal', 'movie_valence', 'movie_arousal',
    'user_genre_Action', 'user_genre_Comedy', 'user_genre_Documentary', 
    'user_genre_Drama', 'user_genre_Horror', 'user_genre_Romance', 'user_genre_Sci-Fi', 
    'movie_genre_Action', 'movie_genre_Comedy', 'movie_genre_Documentary', 
    'movie_genre_Drama', 'movie_genre_Horror', 'movie_genre_Romance', 'movie_genre_Sci-Fi'
]


try:
    model = joblib.load("./nlp_ml/ml_model/cinesense_model.pkl")
    encoder = joblib.load("./nlp_ml/ml_model/encoder.pkl")
    
    ENCODER_KNOWN_GENRES = set(encoder.categories_[1]) 
    DEFAULT_GENRE = 'drama' 
    if DEFAULT_GENRE not in ENCODER_KNOWN_GENRES:
        DEFAULT_GENRE = list(ENCODER_KNOWN_GENRES)[0] if ENCODER_KNOWN_GENRES else 'unknown'

except Exception as e:
    print(f"ERROR LOADING ML FILES: {e}")
    model = None
    encoder = None


app = FastAPI()

host = os.getenv("URL_RUN_DEV")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[host],
    allow_credentials=True,  
    allow_methods=["*"],
    allow_headers=["*"],
)

r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    db=int(os.getenv("REDIS_DB", 0)),
    password=os.getenv("REDIS_PASSWORD", None),
    decode_responses=True
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()

def scheduled_movie_update():
    """Function ที่จะถูกเรียกใช้ทุกๆ 7 วันเวลาเที่ยงคืน"""
    try:
        logger.info(f"Starting scheduled movie update at {datetime.now()}")
        python_executable = sys.executable
        
        # เรียกใช้ fetch_movie.py
        logger.info("Running fetch_movie.py...")
        result_fetch = subprocess.run(
            [python_executable, "fetch_movie.py"], 
            capture_output=True, 
            text=True, 
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        if result_fetch.returncode == 0:
            logger.info("fetch_movie.py completed successfully")
            logger.info(f"fetch_movie output: {result_fetch.stdout}")
        else:
            logger.error(f"fetch_movie.py failed with return code {result_fetch.returncode}")
            logger.error(f"fetch_movie error: {result_fetch.stderr}")
            return
        
        # เรียกใช้ sync_db.py
        logger.info("Running sync_db.py...")
        result_sync = subprocess.run(
            [python_executable, "sync_db.py"], 
            capture_output=True, 
            text=True, 
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        
        if result_sync.returncode == 0:
            logger.info("sync_db.py completed successfully")
            logger.info(f"sync_db output: {result_sync.stdout}")
        else:
            logger.error(f"sync_db.py failed with return code {result_sync.returncode}")
            logger.error(f"sync_db error: {result_sync.stderr}")
            return
            
        logger.info("Scheduled movie update completed successfully")
        
    except Exception as e:
        logger.error(f"Error in scheduled_movie_update: {str(e)}")

# ตั้งค่า scheduler ให้ทำงานทุกๆ 7 วันเวลาเที่ยงคืน (วันอาทิตย์เวลา 00:00)
scheduler.add_job(
    scheduled_movie_update,
    trigger=CronTrigger(day_of_week=6, hour=0, minute=0),  # วันอาทิตย์ (6) เวลา 00:00
    id='weekly_movie_update',
    name='Weekly Movie Data Update',
    replace_existing=True
)

# เริ่ม scheduler
scheduler.start()
logger.info("Scheduler started - Movie update will run every Sunday at midnight")

# เพิ่ม shutdown handler เพื่อหยุด scheduler เมื่อปิดแอป
@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Scheduler stopped")

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI! API is working."}

# เพิ่ม endpoint สำหรับจัดการ scheduler
@app.get("/scheduler/status")
def get_scheduler_status():
    """ตรวจสอบสถานะของ scheduler"""
    jobs = scheduler.get_jobs()
    return {
        "scheduler_running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run_time": str(job.next_run_time) if job.next_run_time else None
            }
            for job in jobs
        ]
    }

@app.post("/scheduler/trigger-update")
def trigger_manual_update():
    """เรียกใช้ scheduled task ด้วยตนเอง (สำหรับทดสอบ)"""
    try:
        scheduled_movie_update()
        return {"message": "Manual movie update triggered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger update: {str(e)}")

class UserRegister(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserRegister):
    conn = get_connection()
    cur = conn.cursor()

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
            "user_registered": user.username,
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
            # ← สร้าง session
            session_id = create_session(user_id, user_name)
            
            response = JSONResponse(content={
                "message": "Login successful!",
                "user_id": user_id,
                "username": user_name
            })
            
            # ← ตั้ง cookie
            response.set_cookie(
                key="session_id",
                value=session_id,
                httponly=True,
                secure=False,  # ตั้งเป็น True ถ้าใช้ HTTPS
                samesite="lax",
                max_age=30 * 60  # 30 นาที
            )
            
            return response
        else:
            return JSONResponse(status_code=401, content={"error": "รหัสผ่านไม่ถูกต้อง"})

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Login failed: {e}")
    finally:
        cur.close()
        conn.close()


# ← เพิ่ม endpoint สำหรับ logout
@app.post("/logout")
def logout(session_id: Optional[str] = Cookie(None)):
    if session_id:
        delete_session(session_id)
    
    response = JSONResponse(content={"message": "Logged out successfully!"})
    response.delete_cookie("session_id")
    return response


# ← เพิ่ม endpoint สำหรับตรวจสอบ session

@app.get("/session")
def get_current_user(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return {
        "user_id": session["user_id"],
        "username": session["username"],
        "authenticated": True
    }

# API สำหรับตรวจสอบ username availability
class UsernameCheckRequest(BaseModel):
    username: str

@app.post("/check-username")
def check_username(request: UsernameCheckRequest):
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # ตรวจสอบว่า username เป็นภาษาอังกฤษหรือตัวเลขเท่านั้น (ไม่รองรับอักขระอื่น)
        if not request.username.isalnum():
            return {
                "available": False,
                "message": "ชื่อผู้ใช้ต้องเป็นภาษาอังกฤษและตัวเลขเท่านั้น"
            }
        
        # ตรวจสอบความยาว
        if len(request.username) < 3:
            return {
                "available": False,
                "message": "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร"
            }
        
        if len(request.username) > 20:
            return {
                "available": False,
                "message": "ชื่อผู้ใช้ต้องไม่เกิน 20 ตัวอักษร"
            }
        
        # ตรวจสอบใน database
        cur.execute(
            "SELECT user_id FROM users WHERE user_name = %s",
            (request.username,)
        )
        existing_user = cur.fetchone()
        
        if existing_user:
            return {
                "available": False,
                "message": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
            }
        
        return {
            "available": True,
            "message": "ชื่อผู้ใช้พร้อมใช้งาน"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking username: {e}")
    finally:
        cur.close()
        conn.close()


# API สำหรับบันทึกโหวต (เพิ่มการตรวจสอบ session)
class VoteRequest(BaseModel):
    movie_id: int
    vote: float
    movie_poster: str
    movie_name: str
    
@app.post("/vote")
def vote_movie(vote_req: VoteRequest, session_id: Optional[str] = Cookie(None)):
    # ← ตรวจสอบ session
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user_id = session["user_id"]  # ← ดึง user_id จาก session
    
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO watched (user_id, movie_id, vote, movie_poster, movie_name)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, movie_id)
            DO UPDATE SET vote = EXCLUDED.vote, movie_poster = EXCLUDED.movie_poster, movie_name = EXCLUDED.movie_name
            RETURNING watch_id
            """,
            (user_id, vote_req.movie_id, vote_req.vote, vote_req.movie_poster, vote_req.movie_name)
        )

        watch_id = cur.fetchone()[0]
        conn.commit()

        return {
            "message": "Vote saved successfully!",
            "watch_id": watch_id,
            "user_id": user_id,
            "movie_id": vote_req.movie_id,
            "vote": vote_req.vote,
            "movie_poster": vote_req.movie_poster,
            "movie_name": vote_req.movie_name
        }

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Vote failed: {e}")
    finally:
        cur.close()
        conn.close()

'''
# Prediction part
class PredictionInput(BaseModel):
    user_valence: float
    user_arousal: float
    user_genre: str
    movie_valence: float
    movie_arousal: float
    movie_genre: str

@app.post("/predict")
def predict(data: PredictionInput, session_id: Optional[str] = Cookie(None)):
    # ← เพิ่มการตรวจสอบ session ถ้าต้องการ
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    input_df = pd.DataFrame([data.dict()])

    genre_cols = ["user_genre", "movie_genre"]
    encoded_genres = encoder.transform(input_df[genre_cols])
    encoded_cols = encoder.get_feature_names_out(genre_cols)
    encoded_df = pd.DataFrame(encoded_genres, columns=encoded_cols)

    processed_df = pd.concat([input_df.drop(columns=genre_cols), encoded_df], axis=1)
    prediction = model.predict(processed_df)
    
    return {"matching rate" : float(prediction[0])}
'''

class SubmitRequest(BaseModel):
    q1: int
    q2: int
    q3: int
    genre: str

def safe_parse_genre(x):
    """แปลง Genre จาก Redis ให้เป็น lowercase และใช้ค่า default หากไม่รู้จัก"""
    try:
        genres_list = json.loads(x)
        if genres_list:
            genre = genres_list[0].lower()
            if genre in ENCODER_KNOWN_GENRES:
                return genre
            else:
                return DEFAULT_GENRE
        return DEFAULT_GENRE
    except:
        return DEFAULT_GENRE

@app.post("/submit")
def submit_mood(submit: SubmitRequest, session_id: Optional[str] = Cookie(None)):

    if model is None or encoder is None:
        raise HTTPException(status_code=503, detail="ML Model or Encoder not loaded.")

    try:
        # 1. Authentication & User Input Pre-processing
        if not session_id:
            raise HTTPException(status_code=401, detail="Not authenticated")
        session = get_session(session_id)
        if not session:
            raise HTTPException(status_code=401, detail="Invalid or expired session")
        
        user_id = session["user_id"]
        user_valence = (submit.q1) / 5
        user_arousal = ((submit.q2+submit.q3) /2 )/ 5
        
        # Map form genre to encoder format (case-sensitive)
        genre_mapping = {
            "action": "Action",
            "comedy": "Comedy", 
            "drama": "Drama",
            "documentary": "Documentary",
            "horror": "Horror",
            "romance": "Romance",
            "sci-fi": "Sci-Fi"
        }
        
        user_genre = genre_mapping.get(submit.genre.lower(), submit.genre)
        print(f"DEBUG: Original genre from form = '{submit.genre}'")
        print(f"DEBUG: Mapped genre = '{user_genre}'")
        print(f"DEBUG: ENCODER_KNOWN_GENRES = {ENCODER_KNOWN_GENRES}")
        print(f"DEBUG: DEFAULT_GENRE = '{DEFAULT_GENRE}'")
        
        if user_genre not in ENCODER_KNOWN_GENRES:
             print(f"DEBUG: Genre '{user_genre}' not in known genres, using DEFAULT_GENRE '{DEFAULT_GENRE}'")
             user_genre = DEFAULT_GENRE
        else:
             print(f"DEBUG: Genre '{user_genre}' found in known genres")

        # 2. ดึงข้อมูลจาก Redis
        all_keys = list(r.scan_iter("movie:*"))
        pipe = r.pipeline()
        for key in all_keys:
            pipe.hgetall(key)
        results = pipe.execute()
        movies_list = [movie for movie in results if movie]
        if not movies_list:
            raise HTTPException(status_code=404, detail="No valid movie data in Redis")

        df_movies = pd.DataFrame(movies_list)
        df_movies["movie_id"] = [key.split(":")[1] for key in all_keys]

        # 3. Data Pre-processing
        df_movies = df_movies.rename(columns={
            "name": "movie_name", "emotion": "movie_emotion", 
            "gerne": "movie_genre", "poster": "movie_poster",
            "link": "movie_links", "synopsis": "movie_synopsis"
        })

        emotion_data = df_movies["movie_emotion"].apply(json.loads)
        df_movies[["movie_valence", "movie_arousal"]] = pd.DataFrame(emotion_data.tolist(), index=df_movies.index)
        # Keep a list of genres for filtering, then derive a single genre for the encoder
        try:
            df_movies["movie_genres_list"] = df_movies["movie_genre"].apply(lambda s: [g.lower() for g in json.loads(s)] if s else [])
        except Exception:
            df_movies["movie_genres_list"] = [[] for _ in range(len(df_movies))]
        df_movies["movie_genre"] = df_movies["movie_genre"].apply(safe_parse_genre)
        
        df_movies["user_valence"] = user_valence
        df_movies["user_arousal"] = user_arousal
        df_movies["user_genre"] = user_genre

        #Filter by selected genre first with fallback
        print(f"DEBUG: user_genre = '{user_genre}'")
        print(f"DEBUG: movie_genre values = {df_movies['movie_genre'].unique()}")
        print(f"DEBUG: Movies before filtering = {len(df_movies)}")
        
        # Filter by any matching genre in the list (case-insensitive)
        df_movies_filtered = df_movies[df_movies["movie_genres_list"].apply(lambda gs: user_genre.lower() in gs)].copy()
        print(f"DEBUG: Movies after filtering = {len(df_movies_filtered)}")
        
        if df_movies_filtered.empty:
            # Fallback to all movies if no movies in selected genre
            print("DEBUG: No movies in selected genre, using fallback to all movies")
            df_movies_filtered = df_movies.copy()
        df_movies = df_movies_filtered

        # 4. Feature Selection, OHE, and Final Preparation (CRITICAL FIX)
        
        numerical_cols = ["user_valence", "user_arousal", "movie_valence", "movie_arousal"]
        genre_cols = ["user_genre", "movie_genre"]
        
        # เลือกเฉพาะ Features ที่จะใช้ในการสร้าง processed_df
        df_features = df_movies[numerical_cols + genre_cols].copy() 

        # One-hot Encoding (OHE)
        encoded_genres = encoder.transform(df_features[genre_cols])
        encoded_cols = encoder.get_feature_names_out(genre_cols)
        encoded_df = pd.DataFrame(encoded_genres, columns=encoded_cols, index=df_features.index)

        # รวม Features ตัวเลขเข้ากับ OHE Features
        processed_df = pd.concat([df_features.drop(columns=genre_cols), encoded_df], axis=1)

        try:
            processed_df = processed_df.reindex(columns=EXPECTED_COLS, fill_value=0)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to reindex features: {e}. Check EXPECTED_COLS.")


        preds = model.predict(processed_df)
        df_movies["matching_rate"] = preds


        top_10 = df_movies.sort_values(by="matching_rate", ascending=False).head(10)

        results = []
        for _, row in top_10.iterrows():
            # ดึงข้อมูล streaming จาก Redis
            movie_links = []
            try:
                if row.get("movie_links") and row["movie_links"] != "[]":
                    movie_links = json.loads(row["movie_links"])
            except:
                movie_links = []
            

            if not movie_links:
                streaming_services = []
            else:

                streaming_services = movie_links
            
            results.append({
                "movie_id": str(row["movie_id"]),
                "title": str(row.get("movie_name", "Unknown")),
                "genres": list(row.get("movie_genres_list", [])),
                "poster": str(row.get("movie_poster", "")),
                "matching_rate": float(row["matching_rate"]),
                "streaming_services": streaming_services,
                "synopsis": str(row.get("movie_synopsis", ""))
            })
        print(user_id,results)
        return {
            "message": "Prediction successful!",
            "user_id": user_id,
            "top_movies": results
        }

    except Exception as e:
        print(f"--- ERROR IN /submit ENDPOINT ---: {e}") 
        if 'processed_df' in locals():
             print(f"DEBUG: Current columns in processed_df: {processed_df.columns.tolist()}")


        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.get("/watch-history")
def get_watch_history(session_id: Optional[str] = Cookie(None)):
    """ดึงประวัติการรับชมภาพยนตร์ของผู้ใช้"""
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    user_id = session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User not found in session")
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # ดึงประวัติการรับชม
        cur.execute("""
            SELECT 
                w.watch_id,
                w.movie_id,
                w.vote,
                w.movie_poster,
                w.movie_name
            FROM watched w
            WHERE w.user_id = %s
            ORDER BY w.watch_id DESC
        """, (user_id,))
        
        watch_history = cur.fetchall()
        
        # นับจำนวนภาพยนตร์ที่ดูแล้ว
        cur.execute("""
            SELECT COUNT(*) as total_watched
            FROM watched w
            WHERE w.user_id = %s
        """, (user_id,))
        
        total_watched = cur.fetchone()[0]
        
        # แปลงข้อมูลเป็น format ที่เหมาะสม
        history_data = []
        for record in watch_history:
            history_data.append({
                "watch_id": record[0],
                "movie_id": record[1],
                "vote": float(record[2]),
                "movie_poster": record[3],
                "movie_name": record[4]
            })
        
        return {
            "message": "Watch history retrieved successfully",
            "total_watched": total_watched,
            "watch_history": history_data
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to get watch history: {e}")
    finally:
        cur.close()
        conn.close()