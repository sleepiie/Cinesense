import pandas as pd
import joblib
import os
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder # แม้จะโหลด แต่ก็ควร import ไว้
from db import get_connection


logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
log = logging.getLogger(__name__)


MODEL_PATH = "./nlp_ml/ml_model/cinesense_model.pkl"
OLD_MODEL_PATH = "./nlp_ml/ml_model/cinesense_model_old.pkl"
ENCODER_PATH = "./nlp_ml/ml_model/encoder.pkl"
MOCK_DATA_PATH = "./nlp_ml/ml_model/mock_dataset_v3.csv" 

def get_feedback_data():
    if not get_connection:
        log.error("ฟังก์ชัน get_connection ไม่พร้อมใช้งาน")
        return pd.DataFrame(), 0

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # ดึงข้อมูลที่จำเป็นสำหรับการเทรน
        cur.execute("""
            SELECT user_valence, user_arousal, user_genre, 
                   movie_valence, movie_arousal, movie_genre, vote AS matching_rate
            FROM feedback
        """)
        data = cur.fetchall()
        count = len(data)

        columns = [
            'user_valence', 'user_arousal', 'user_genre',
            'movie_valence', 'movie_arousal', 'movie_genre', 'matching_rate'
        ]
        
        df = pd.DataFrame(data, columns=columns)
        
        for col in ['user_valence', 'user_arousal', 'movie_valence', 'movie_arousal', 'matching_rate']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        
        df = df.dropna()
        
        log.info(f"ดึงข้อมูล {len(df)} rows จากตาราง 'feedback' สำเร็จ")
        return df, len(df) # คืนค่า count ใหม่หลังจาก dropna
    
    except Exception as e:
        log.error(f"เกิดข้อผิดพลาดในการดึงข้อมูลจาก PostgreSQL: {e}")
        if conn:
            conn.rollback()
        return pd.DataFrame(), 0
    finally:
        if conn:
            cur.close()
            conn.close()

def preprocess_data(df, encoder_path):
    try:
        # โหลด encoder ที่มีอยู่
        encoder = joblib.load(encoder_path)
        
        categorical_cols = ['user_genre', 'movie_genre']
        numeric_cols = ['user_valence', 'user_arousal', 'movie_valence', 'movie_arousal']

        encoded_data = encoder.transform(df[categorical_cols])
        
        encoded_cols = encoder.get_feature_names_out(categorical_cols)
        
        encoded_df = pd.DataFrame(encoded_data, columns=encoded_cols, index=df.index)
        
        X = pd.concat([df[numeric_cols], encoded_df], axis=1)
        y = df['matching_rate']
        
        log.info(f"เตรียมข้อมูลสำเร็จ, X shape: {X.shape}, y shape: {y.shape}")
        return X, y
        
    except FileNotFoundError:
        log.error(f"ไม่พบ Encoder ที่: {encoder_path}")
        return None, None
    except Exception as e:
        log.error(f"เกิดข้อผิดพลาดระหว่าง Preprocessing: {e}")
        return None, None

def train_and_save_model(X, y, model_path, old_model_path):

    try:
        log.info("กำลังเริ่มต้นการเทรนโมเดล (RandomForestRegressor)...")
        model = RandomForestRegressor(random_state=0, n_jobs=-1)
        model.fit(X, y)
        log.info("เทรนโมเดลสำเร็จ")

        if os.path.exists(model_path):
            if os.path.exists(old_model_path):
                os.remove(old_model_path)
                log.info(f"ลบไฟล์เก่าทิ้ง: {old_model_path}")
                
            os.rename(model_path, old_model_path)
            log.info(f"ย้ายโมเดลเก่าไปที่: {old_model_path}")
            
        joblib.dump(model, model_path)
        log.info(f"เซฟโมเดลใหม่สำเร็จที่: {model_path}")
        
    except Exception as e:
        log.error(f"เกิดข้อผิดพลาดระหว่างเทรนหรือเซฟโมเดล: {e}")

def run_feedback_loop():
    log.info("--- เริ่มกระบวนการ Feedback Loop ---")

    feedback_df, count = get_feedback_data()

    if count > 200:
        log.info(f"ข้อมูล Feedback ({count} rows) > 200. ใช้ข้อมูลจาก DB เท่านั้น")
        training_df = feedback_df
    else:
        log.info(f"ข้อมูล Feedback ({count} rows) <= 200. กำลังรวมกับ mock dataset...")
        try:
            mock_df = pd.read_csv(MOCK_DATA_PATH)
            training_df = pd.concat([feedback_df, mock_df], ignore_index=True)
        except FileNotFoundError:
            log.error(f"ไม่พบไฟล์ mock dataset ที่: {MOCK_DATA_PATH}")
            if count == 0:
                log.error("ไม่มีข้อมูล feedback และ mock data. ยกเลิกการเทรน")
                return
            log.warning("ดำเนินการต่อโดยใช้ข้อมูล feedback ที่มีเท่านั้น")
            training_df = feedback_df
        except Exception as e:
            log.error(f"เกิดข้อผิดพลาดในการอ่าน mock data: {e}. ยกเลิกการเทรน")
            return

    if training_df.empty:
        log.warning("ไม่มีข้อมูลสำหรับเทรน. จบการทำงาน")
        return
    log.info(f"จำนวนข้อมูลสำหรับเทรนทั้งหมด: {len(training_df)} rows")

    X, y = preprocess_data(training_df, ENCODER_PATH)
    
    if X is None or y is None:
        log.error("ไม่สามารถเตรียมข้อมูลได้. ยกเลิกการเทรน")
        return

    train_and_save_model(X, y, MODEL_PATH, OLD_MODEL_PATH)
    
    log.info("--- Feedback Loop เสร็จสิ้น ---")

if __name__ == "__main__":

    log.info("รัน feedbackloop.py แบบ standalone เพื่อทดสอบ")
    run_feedback_loop()