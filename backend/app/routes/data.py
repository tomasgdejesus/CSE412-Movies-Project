from flask import Blueprint, jsonify
from backend.app.db_util import getConnection
from backend.queries import NetflixDB
 
data_bp = Blueprint("data", __name__)
 
 
def _get_db():
    conn = getConnection()
    if not conn:
        return None, jsonify({"error": "Database connection failed"}), 500
    return conn, None, None
 
 
@data_bp.route("/api/content-last-decade", methods=["GET"])
def content_last_decade():
    conn, err, status = _get_db()
    if err:
        return err, status
    try:
        db = NetflixDB(conn)
        rows = db.netflix_content_last_decade()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
 
 
@data_bp.route("/api/actors-top-genres", methods=["GET"])
def actors_top_genres():
    conn, err, status = _get_db()
    if err:
        return err, status
    try:
        db = NetflixDB(conn)
        rows = db.actors_top_genres()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
 
 
@data_bp.route("/api/countries-genres", methods=["GET"])
def countries_genres():
    conn, err, status = _get_db()
    if err:
        return err, status
    try:
        db = NetflixDB(conn)
        rows = db.countries_produced_genres()
        return jsonify([dict(r) for r in rows]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()
    
#added new method
 
@data_bp.route("/api/media", methods=["GET"])
def get_media():
    conn, err, status = _get_db()
    if err:
        return err, status
    try:
        #get 100 shows
        with conn.cursor() as cur:
            cur.execute("""
                SELECT show_id, title, type, release_year, rating, description
                FROM media
                ORDER BY release_year DESC
                LIMIT 100
            """)
            rows = cur.fetchall()
            media = [
                {
                    "show_id": r[0],
                    "title": r[1],
                    "type": r[2],
                    "release_year": r[3],
                    "rating": r[4],
                    "description": r[5],
                }
                for r in rows
            ]
            return jsonify(media), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()