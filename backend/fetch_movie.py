import requests
import csv
from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

#Fetch ข้อมูลจาก TMDB
url = os.getenv('URL')

headers = {
    "accept": "application/json",
    "Authorization": os.getenv('API_KEY')
}
movies = []

for page in range(1, 26): #เอามาจากหน้า 1-25  
    params = {
        "language": "en-US",
        "sort_by": "vote_average.desc", #เรียงจาก rating น้อยไปมาก
        "vote_average.gte": 7.0,  #rating 7 ขึ้นไป      
        "vote_count.gte": 500,  #คนโหวต 500 คนขึ้นไป         
        "page": page
    }

    r = requests.get(url,headers=headers, params=params)
    if r.status_code == 200:
        data = r.json()
        movies.extend(data.get("results", []))
    else:
        print(f"Error {r.status_code}: {r.text}")
        break

# print(len(movies))

# รวมหนัง 500 เรื่องเป็น CSV
OUTPUT_FILE = Path("movies_500.csv")
with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # เขียน header
    writer.writerow(["id", "title", "overview", "release_date", "vote_average", "vote_count"])
    # เขียนข้อมูลหนัง
    for m in movies:
        writer.writerow([
            m.get("id", ""),
            m.get("title", ""),
            m.get("overview", "").replace("\n", " "),  
            m.get("release_date", ""),
            m.get("vote_average", 0),
            m.get("vote_count", 0)
        ])

print(f"Saved {len(movies)} movies to {OUTPUT_FILE}") 


