import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

# Create the app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'

app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback_secret_key")

# Configure the SQLite database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///skill_grow.db"
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialize the app with the extension
db.init_app(app)

# Import routes after the app is created to avoid circular imports
from routes import *

with app.app_context():
    # Import models
    import models
    db.create_all()
