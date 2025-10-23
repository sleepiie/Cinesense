import os
import psycopg2
import redis
import json
from dotenv import load_dotenv

load_dotenv()

postgres_config = {
    'dbname': os.getenv('PG_DBNAME'),
    'user': os.getenv('PG_USER'),
    'password': os.getenv('PG_PASSWORD'),
    'host': os.getenv('PG_HOST'),
    'port': os.getenv('PG_PORT')
}

redis_config = {
    'host': os.getenv('REDIS_HOST'),
    'port': os.getenv('REDIS_PORT'),
    'db': os.getenv('REDIS_DB', 0),
    'password': os.getenv('REDIS_PASSWORD')
}

def sync_movie_data_to_redis():
    try:
        pgconn = psycopg2.connect(**postgres_config)
        redisconn = redis.Redis(**redis_config)
        redisconn.ping()
        print('Success connecting to database')
    except (psycopg2.OperationalError , redis.exceptions.ConnectionError) as e:
        print(f'Error connecting to database : {e}')
        return
    try:
        delete_key = redisconn.keys('movie:*')
        if delete_key:
            redisconn.delete(*delete_key)
        print(f"Cleared {len(delete_key)} old movie keys from Redis.")
    
        cur = pgconn.cursor()
        cur.execute("""
                SELECT
                    movie_id,
                    movie_name,
                    movie_genre,
                    movie_rating,
                    movie_synopsis,
                    movie_link,
                    movie_direct,
                    movie_emotion,
                    movie_poster
                FROM movies
            """)

        movies = cur.fetchall()
        cur.close()

        if not movies:
            print('No movie data to sync')
            return
        
        pipeline = redisconn.pipeline()
        for movie in movies:
            (movie_id, movie_name, movie_genre, movie_rating, movie_synopsis, 
                movie_link, movie_direct, movie_emotion , movie_poster) = movie
        
            pipeline.hset(
                f'movie:{movie_id}',
                mapping={
                    'name': movie_name if movie_name is not None else '',
                    'gerne': json.dumps(movie_genre) if movie_genre is not None else '[]', 
                    'rating': movie_rating if movie_rating is not None else 0.0,
                    'synopsis': movie_synopsis if movie_synopsis is not None else '',
                    'link': json.dumps(movie_link) if movie_link is not None else '[]',
                    'direct': movie_direct if movie_direct is not None else '',
                    'emotion': json.dumps(movie_emotion) if movie_emotion is not None else '[]',
                    'poster': movie_poster if movie_poster is not None else ''
                }
            )
        
        pipeline.execute()
        print(f"Successfully synced {len(movies)} movies to Redis.")

    except (psycopg2.Error, redis.exceptions.RedisError) as e:
        print(f'Sync error : {e}')


    finally:
        if pgconn:
            pgconn.close()




if __name__ == '__main__':
    sync_movie_data_to_redis()
