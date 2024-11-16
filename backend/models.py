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
            "id": self.id,
            "username": self.username
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    overall_experience = db.Column(db.Float, nullable=False)
    cleanliness = db.Column(db.Integer, nullable=False)
    ambience = db.Column(db.Integer, nullable=False)
    extra_amenities = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.String(255))
    times_visited = db.Column(db.Integer, default=1)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def calculate_overall_experience(self):
        return round((self.cleanliness + self.ambience + self.extra_amenities) / 3, 2)

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "overall_experience": self.overall_experience,
            "cleanliness": self.cleanliness,
            "ambience": self.ambience,
            "extra_amenities": self.extra_amenities,
            "notes": self.notes,
            "times_visited": self.times_visited,
            "user_id": self.user_id
        }