from datetime import datetime, timezone
from config import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    reviews = db.relationship('Review', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    overall_experience = db.Column(db.Float, nullable=False)
    cleanliness = db.Column(db.Float, nullable=False)
    ambience = db.Column(db.Float, nullable=False)
    extra_amenities = db.Column(db.Float, nullable=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    def calculate_overall_experience(self):
        return round((self.cleanliness + self.ambience + self.extra_amenities) / 3, 2)

    def to_json(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'location': self.location,
            'latitude': float(self.latitude),
            'longitude': float(self.longitude),
            'overall_experience': float(self.overall_experience),
            'cleanliness': float(self.cleanliness),
            'ambience': float(self.ambience),
            'extra_amenities': float(self.extra_amenities),
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }