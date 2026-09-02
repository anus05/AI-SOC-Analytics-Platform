import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from sqlalchemy import text
from backend.database.db import engine

try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("[+] Database Connected Successfully!")

except Exception as e:
    print("[-] Connection Failed")
    print(e)