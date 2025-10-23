import redis, json, os
from dotenv import load_dotenv
load_dotenv()  


r = redis.Redis(
    host=os.getenv("REDIS_HOST"),
    port=int(os.getenv("REDIS_PORT")),
    db=int(os.getenv("REDIS_DB", 0)),
    password=os.getenv("REDIS_PASSWORD", None),
    decode_responses=True
)

print(r.ping())

keys = list(r.scan_iter("movie:*"))
for key in keys[:5]:  # ลองแค่ 5 ตัวแรก
    val = r.hgetall(key)
    print(key, val)
    try:
        data = json.loads(val)
        print("Parsed JSON OK:", data.get("movie_name"))
    except:
        print("❌ ไม่สามารถ parse JSON")
