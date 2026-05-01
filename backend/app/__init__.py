from flask import Flask
from flask_cors import CORS
from backend.app.routes.auth import auth_bp
from backend.app.routes.data import data_bp
from backend.app.routes.favorites import favorites_bp
import os
 
app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "temp_key")
 
app.register_blueprint(auth_bp)
app.register_blueprint(data_bp)
app.register_blueprint(favorites_bp)