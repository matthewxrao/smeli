from config import db

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(255), unique=True, nullable=False)
    overall_experience = db.Column(db.Integer, nullable=False)
    cleanliness = db.Column(db.Integer, nullable=False)
    ambience = db.Column(db.Integer, nullable=False)
    extra_amenities = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.String(255))
    times_visited = db.Column(db.Integer, default=1)


    def to_json(self):
        return {
            "id": self.id,
            "location": self.location,
            "overall_experience": self.overall_experience,
            "cleanliness": self.cleanliness,
            "ambience": self.ambience,
            "extra_amenities": self.extra_amenities,
            "notes": self.notes,
            'times_visited': self.times_visited
      }