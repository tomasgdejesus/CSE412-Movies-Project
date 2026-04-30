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
 