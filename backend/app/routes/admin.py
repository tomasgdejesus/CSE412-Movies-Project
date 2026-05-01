from flask import Blueprint, jsonify, request, current_app
import jwt
import psycopg2
from backend.app.db_util import getConnection

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/listusers', methods=['GET'])
def list_users():
    conn = getConnection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, username, created_at, role FROM users")
            rows = cur.fetchall()
            users = [{"user_id": r[0], "username": r[1], "created_at": r[2], "role": r[3]} for r in rows]
            return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@admin_bp.route('/admin/deleteuser/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = getConnection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
            # check if there even is user
            if cur.rowcount == 0:
                return jsonify({"error": "User not found"}), 404
            conn.commit()
            return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()