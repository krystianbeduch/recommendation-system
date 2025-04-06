from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
from os import getenv

load_dotenv() # Ladowanie zmiennych z pliku .env
mongo_uri = getenv('MONGO_URI')

# Polaczenie z MongoDB Atlas
MONGO_URI = f"{mongo_uri}"
# client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
client = AsyncIOMotorClient(MONGO_URI)

db = client["recommendations"]
collection = db["movies"]