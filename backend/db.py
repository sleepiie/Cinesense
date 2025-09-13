import os
import psycopg2 
from dotenv import load_dotenv , find_dotenv
load_dotenv()
def get_connection():
        return psycopg2.connect(
            dbname = os.getenv('PG_DBNAME'),
            user =  os.getenv('PG_USER'),
            password = os.getenv('PG_PASSWORD'),
            host =  os.getenv('PG_HOST'),
            port = os.getenv('PG_PORT')
            
    )
