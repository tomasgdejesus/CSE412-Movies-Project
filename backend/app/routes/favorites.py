from flask import Blueprint, jsonify, request, current_app
import jwt
import psycopg2
from backend.app.db_util import getConnection

favorites_bp = Blueprint("favorites", __name__)

def get_id_from_token():
    #getting the token from the user id
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    
    token = auth_header.split(" ")[1] #take it
    try:
        payload = jwt.decode(token, current_app.config["SECRET_KEY"], algorithms=["HS256"])
        return payload.get("user_id")

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
#GET favorite
@favorites_bp.route("/favorites", methods=["GET"])
def get_favorites():
        user_id = get_id_from_token()
        #mistakes
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 401
        
        connection = getConnection()

        if not connection:
            return jsonify({"error": "Database connection failed"}), 500
        

        try:
            #get favorites table
            with connection.cursor() as cur:
                cur.execute("""
                    SELECT m.show_id, m.title, m.type, m.release_year, m.rating, m.description
                    FROM isFavorited f
                    JOIN media m ON f.f_show_id = m.show_id
                    WHERE f.f_user_id = %s
                """, (user_id,))
                rows = cur.fetchall()
                favorites = [
                    {
                        "show_id": r[0],
                        "title": r[1],
                        "type": r[2],
                        "release_year": r[3],
                        "rating": r[4],
                        "description": r[5]
            
                    }
                    for r in rows
                ]
                return jsonify(favorites), 200
            
        except psycopg2.Error as error:
                    return jsonify({"error": str(error)}), 500
        
        finally:
             connection.close()


#POST show id
@favorites_bp.route("/favorites/<int:show_id>", methods=["POST"])
def add_favorite(show_id):
    user_id = get_id_from_token()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = getConnection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        #insert show_id into favorite
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO isFavorited (f_user_id, f_show_id)
                VALUES (%s, %s)
                ON CONFLICT DO NOTHING
            """, (user_id, show_id))
            conn.commit()
            return jsonify({"message": "Favorited"}), 201
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@favorites_bp.route("/favorites/<int:show_id>", methods=["DELETE"])
def remove_favorite(show_id):
    user_id = get_id_from_token()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn = getConnection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        #remove show from favorite
        with conn.cursor() as cur:
            cur.execute("""
                DELETE FROM isFavorited
                WHERE f_user_id = %s AND f_show_id = %s
            """, (user_id, show_id))
            conn.commit()
            return jsonify({"message": "Unfavorited"}), 200
    except psycopg2.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

            








