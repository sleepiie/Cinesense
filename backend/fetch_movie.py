import requests
import asyncio
import aiohttp
import csv
from pathlib import Path
import os
from dotenv import load_dotenv
from db import get_connection
from nlp_ml.nlp_synopsis import analyze_va
from psycopg2.extras import execute_values

load_dotenv()

#Fetch ข้อมูลจาก TMDB
url = os.getenv('URL')

headers = {
    "accept": "application/json",
    "Authorization": os.getenv('API_KEY')
}


async def async_get_movie_page(session, page_num):
    # ใช้ params เดียวกัน แต่ส่ง page_num เข้าไป
    url = os.getenv('URL') 
    headers = {
        "accept": "application/json",
        "Authorization": os.getenv('API_KEY')
    }
    params = {
        "language": "en-US",
        "sort_by": "vote_average.desc",
        "vote_average.gte": 6, 
        "vote_count.gte": 300,
        "page": page_num
    }
    async with session.get(url, headers=headers, params=params) as response:
        return await response.json()

async def async_get_movie_from_tmdb(num_pages=500, concurrency=20):
    all_movies = []
    pages_to_fetch = list(range(1, num_pages + 1)) 
    
    semaphore = asyncio.Semaphore(concurrency)

    async with aiohttp.ClientSession() as session:
        async def sem_task(page):
            async with semaphore:
                return await async_get_movie_page(session, page)

        tasks = [sem_task(page) for page in pages_to_fetch]
        
        for i, task in enumerate(asyncio.as_completed(tasks), 1):
            data = await task
            if "results" in data and data["results"]:
                all_movies.extend(data["results"])
            
            if i % 50 == 0:
                print(f"Fetched {i} pages...")

    return all_movies[:10000]


def get_genre_map():
    url = "https://api.themoviedb.org/3/genre/movie/list"
    params = {"language": "en-US"}
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    return {genre['id']: genre['name'] for genre in data['genres']}

genre_map = get_genre_map()

#ใช้ async ในการ fetch directorname , streaming link เพื่อความเร็ว
async def fetch_json(session, url):
    async with session.get(url, headers=headers) as response:
        return await response.json()

async def get_director_name(movie_id, session):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/credits"
    data = await fetch_json(session, url)
    directors = [member['name'] for member in data.get('crew', []) if member['job'] == 'Director']
    return directors if directors else ['N/A']

async def get_streaming_link(movie_id, session, region="TH"):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/watch/providers"
    data = await fetch_json(session, url)
    provider_list = []
    if 'results' in data and region in data['results']:
        region_data = data['results'][region]
        for key in ['flatrate', 'buy']:
            if key in region_data:
                provider_list.extend([p['provider_name'] for p in region_data[key]])
        provider_list = list(set(provider_list))
    return provider_list if provider_list else ['N/A']

async def process_movie(movie, session):
    movie_id = movie['id']
    director_task = get_director_name(movie_id, session)
    link_task = get_streaming_link(movie_id, session)
    director, link = await asyncio.gather(director_task, link_task)
    return {
        "id": movie_id,
        "title": movie['title'],
        "genre_ids": movie.get("genre_ids", []),
        "rating": movie.get("vote_average"),
        "synopsis": movie.get("overview"),
        "poster_path": movie.get("poster_path"),
        "director": director,
        "link": link
    }

async def fetch_all_movies_parallel(movies, concurrency=20):
    semaphore = asyncio.Semaphore(concurrency)
    results = []

    async with aiohttp.ClientSession() as session:
        async def sem_task(movie):
            async with semaphore:
                return await process_movie(movie, session)

        tasks = [sem_task(m) for m in movies]
        for i, task in enumerate(asyncio.as_completed(tasks), 1):
            movie_data = await task
            results.append(movie_data)
            if i % 100 == 0:
                print(f"Processed {i} movies...")
    return results


async def main_async():
    print("Fetching movie list from TMDB...")
    tmdb_movies = await async_get_movie_from_tmdb()
    print(f"Total movies fetched: {len(tmdb_movies)}")

    print("Fetching directors and streaming links in parallel...")
    movies_with_details = await fetch_all_movies_parallel(tmdb_movies, concurrency=15)

    #ใช้ batch insert
    data_list = []
    for movie in movies_with_details:
        movie_id = movie["id"]
        movie_name = movie["title"]
        movie_genres = [genre_map.get(gid, "N/A") for gid in movie["genre_ids"]]
        movie_rating = movie["rating"]
        movie_synopsis = movie["synopsis"]
        movie_poster = f"https://www.themoviedb.org/t/p/w1280{movie['poster_path']}" if movie["poster_path"] else None
        movie_direct = movie["director"]
        movie_link = movie["link"]
        emotion_va = analyze_va(movie_synopsis)

        data_list.append((
            movie_id, movie_name, movie_genres, movie_rating, movie_synopsis,
            movie_link, movie_direct, emotion_va, movie_poster
        ))


    pgconn = get_connection()
    if not pgconn:
        print("Cannot connect to database")
        return

    try:
        cur = pgconn.cursor()
        insert_query = """
            INSERT INTO movies (movie_id, movie_name, movie_genre, movie_rating, movie_synopsis,
                                movie_link, movie_direct, movie_emotion, movie_poster)
            VALUES %s
            ON CONFLICT (movie_id) DO UPDATE SET
                movie_name = EXCLUDED.movie_name,
                movie_genre = EXCLUDED.movie_genre,
                movie_rating = EXCLUDED.movie_rating,
                movie_synopsis = EXCLUDED.movie_synopsis,
                movie_link = EXCLUDED.movie_link,
                movie_direct = EXCLUDED.movie_direct,
                movie_emotion = EXCLUDED.movie_emotion,
                movie_poster = EXCLUDED.movie_poster;
        """
        batch_size = 100
        for i in range(0, len(data_list), batch_size):
            batch = data_list[i:i + batch_size]
            execute_values(cur, insert_query, batch)
            pgconn.commit()
            print(f"Inserted {i + len(batch)} / {len(data_list)} movies...")

        print("All movies saved successfully.")
    except Exception as e:
        print(f"Error saving movies: {e}")
        pgconn.rollback()
    finally:
        pgconn.close()

if __name__ == "__main__":
    asyncio.run(main_async())