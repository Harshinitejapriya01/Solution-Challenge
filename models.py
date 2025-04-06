from app import db
from flask_login import UserMixin
from datetime import datetime
import json

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)
    progress = db.relationship('Progress', backref='user', lazy=True)
    achievements = db.relationship('Achievement', backref='user', lazy=True)

class Progress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    module_id = db.Column(db.String(64), nullable=False)
    completion_percentage = db.Column(db.Integer, default=0)
    last_activity = db.Column(db.DateTime, default=datetime.utcnow)
    
    def update_progress(self, percentage):
        self.completion_percentage = percentage
        self.last_activity = datetime.utcnow()

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    achievement_name = db.Column(db.String(128), nullable=False)
    achievement_description = db.Column(db.Text)
    date_earned = db.Column(db.DateTime, default=datetime.utcnow)

# Function to load module data from JSON
def get_modules():
    try:
        with open('static/data/modules.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading modules: {e}")
        return []

# Function to get a specific module by ID
def get_module_by_id(module_id):
    modules = get_modules()
    for module in modules:
        if module.get('id') == module_id:
            return module
    return None
