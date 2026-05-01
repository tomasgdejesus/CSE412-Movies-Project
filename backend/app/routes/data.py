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

@data_bp.route("/api/details/<int:show_id>", methods=["GET"])
def get_media_details(show_id):
    conn, err, status = _get_db()
    if err:
        return err, status
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT show_id, title, type, release_year, rating, description
                FROM media
                WHERE show_id = %s
            """, (show_id,))
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Media not found"}), 404
            
            # director(s)
            cur.execute("""
                SELECT p.first_name, p.last_name
                FROM directed d
                JOIN director dr ON d.d_dir_id = dr.dir_id
                JOIN person p ON dr.dir_id = p.person_id
                WHERE d.d_show_id = %s
            """, (show_id,))

            directors = [
                f"{r[0]} {r[1]}" for r in cur.fetchall()
            ]

            # actors
            cur.execute("""
                SELECT p.first_name, p.last_name
                FROM actedin ai
                JOIN actor a ON ai.ai_actor_id = a.actor_id
                JOIN person p ON a.actor_id = p.person_id
                WHERE ai.ai_show_id = %s
            """, (show_id,))

            actors = [f"{r[0]} {r[1]}" for r in cur.fetchall()]

            # countries
            cur.execute("""
                SELECT c.name
                FROM producedIn p
                JOIN country c ON p.p_country_id = c.country_id
                WHERE p.p_show_id = %s
            """, (show_id,))

            countries = [r[0] for r in cur.fetchall()]

            # genres
            cur.execute("""
                SELECT g.name
                FROM listedIn li
                JOIN genre g ON li.li_genre_id = g.genre_id
                WHERE li.li_show_id = %s
            """, (show_id,))

            genres = [r[0] for r in cur.fetchall()]
            
            media_details = {
                "show_id": row[0],
                "title": row[1],
                "type": row[2],
                "release_year": row[3],
                "rating": row[4],
                "description": row[5],
                "directors": directors,
                "actors": actors,
                "countries": countries,
                "genres": genres,
            }
            return jsonify(media_details), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    