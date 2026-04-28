from flask import Blueprint, request, jsonify, current_app
import psycopg2
import jwt
import datetime
from zoneinfo import ZoneInfo
from backend.app.db_util import getConnection
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__)

def auth_check_login(username, password):
    conn = getConnection()
    if not conn:
        return False

    try:
        # use wekzeug for password hashing
        pass_hashed = generate_password_hash(password)
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT user_id, username, password_hash, role FROM users WHERE username = %s",
                (username,)
            )
            user = cursor.fetchone()
            if user and check_password_hash(user[2], password):
                return {
                    "id": user[0],
                    "username": user[1],
                    "role": user[3]
                }
    except psycopg2.Error as e:
        print(f"Error occurred while checking login: {e}")
    finally:
        conn.close()

    return False


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    #TODO: Actual auth
    if username == "admin" and password == "123":
    #Create a token that expires in an hour
        token = jwt.encode(
            {
                "user_id": 1,
                "username": username,
                "role": "admin",
                "exp": datetime.datetime.now(ZoneInfo("America/Phoenix")) + datetime.timedelta(hours=1)
            },
            current_app.config["SECRET_KEY"],
            algorithm="HS256"
        )
        return jsonify({
        "token": token,
        "user": {
            "id": 1,
            "username": username,
            "role": "admin"
        }
        }),200
    else:
        user = auth_check_login(username, password)
        #Create a token that expires in an hour
        if user:
            token = jwt.encode(
                {
                    "user_id": user["id"],
                    "username": user["username"],
                    "role": user["role"],
                    "exp": datetime.datetime.now(ZoneInfo("America/Phoenix")) + datetime.timedelta(hours=1)
                },
                current_app.config["SECRET_KEY"],
                algorithm="HS256"
            )
            return jsonify({
                "token": token,
                "user": user
            }), 200
        else:
            return jsonify({
                "error": "Invalid credentials"
            }), 401
        
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = getConnection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cursor:
            # we only do unique username
            cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
            if cursor.fetchone():
                return jsonify({"error": "Username already exists"}), 400
            
            # hash pw and then store in db
            pass_hashed = generate_password_hash(password)
            created_at = datetime.datetime.now(ZoneInfo("America/Phoenix"))
            # default role is user (1), hardcode for now since we don't modify roles table anyway
            cursor.execute(
                "INSERT INTO users (username, password_hash, role, created_at) VALUES (%s, %s, %s, %s) RETURNING user_id",
                (username, pass_hashed, 1, created_at)
            )
            user_id = cursor.fetchone()[0]
            conn.commit()
            return jsonify({"message": "User registered successfully", "user_id": user_id}), 201
    except psycopg2.Error as e:
        print(f"Error occurred during registration: {e}")
        return jsonify({"error": "Internal error -- Registration failed"}), 500
    finally:
        conn.close()