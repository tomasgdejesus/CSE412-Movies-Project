import psycopg2
import os

# ez shared code for db connection, i.e. conn = getConnection()
# use 'from app.db_util import getConnection' to import this function
def getConnection():
    user_name = os.environ.get("USER")

    if not user_name:
        print("No $USER variable found, connection fails")
        return None

    try:
        return psycopg2.connect(
            database="project",
            user=user_name,
            host="127.0.0.1",
            port=8888,
        )
    except psycopg2.OperationalError as e:
        print("OperationalError:")
        print(f"Message {e}")
        print(f"pgcode {e.pgcode}")
        print(f"pgerror {e.pgerror}")
        return None