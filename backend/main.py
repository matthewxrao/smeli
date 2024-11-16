from pydoc import text
from flask import request, jsonify
from config import app, db
from models import Review, User
from functools import wraps
import jwt
from datetime import datetime, timedelta

# Secret key for JWT
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key in production

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        try:
            token = token.split()[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({"message": "Username already exists"}), 400

    new_user = User(username=data['username'])
    new_user.set_password(data['password'])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"message": "Missing username or password"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({"message": "Invalid username or password"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, app.config['SECRET_KEY'])

    return jsonify({
        "token": token,
        "user": user.to_json()
    })

@app.route("/reviews/nearby", methods=["GET"])
@token_required
def get_nearby_reviews(current_user):
    # Get latitude and longitude from query parameters
    try:
        lat = float(request.args.get('latitude'))
        lng = float(request.args.get('longitude'))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid latitude or longitude"}), 400

    # Haversine formula in SQL to calculate distance
    distance_query = """
    WITH distances AS (
        SELECT 
            *,
            (6371 * acos(
                cos(radians(:latitude)) * 
                cos(radians(latitude)) * 
                cos(radians(longitude) - radians(:longitude)) + 
                sin(radians(:latitude)) * 
                sin(radians(latitude))
            )) AS distance
        FROM review
    )
    SELECT * FROM distances 
    ORDER BY distance ASC 
    LIMIT 10;
    """

    try:
        result = db.session.execute(
            text(distance_query),
            {"latitude": lat, "longitude": lng}
        )
        
        # Convert result to list of dictionaries
        nearby_reviews = []
        for row in result:
            review_dict = {
                "id": row.id,
                "title": row.title,
                "location": row.location,
                "latitude": row.latitude,
                "longitude": row.longitude,
                "overall_experience": row.overall_experience,
                "cleanliness": row.cleanliness,
                "ambience": row.ambience,
                "extra_amenities": row.extra_amenities,
                "notes": row.notes,
                "distance_km": round(row.distance, 2)
            }
            nearby_reviews.append(review_dict)

        return jsonify({"reviews": nearby_reviews})
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/reviews/user", methods=["GET"])
@token_required
def get_user_reviews(current_user):
    try:
        user_reviews = Review.query.filter_by(user_id=current_user.id).all()
        return jsonify({
            "reviews": [review.to_json() for review in user_reviews]
        })
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500

@app.route("/create_review", methods=["POST"])
@token_required
def create_review(current_user):
    data = request.json
    required_fields = ["title", "location", "latitude", "longitude", "cleanliness", "ambience", "extra_amenities"]
    
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    new_review = Review(
        title=data["title"],
        location=data["location"],
        latitude=data["latitude"],
        longitude=data["longitude"],
        cleanliness=data["cleanliness"],
        ambience=data["ambience"],
        extra_amenities=data["extra_amenities"],
        notes=data.get("notes"),
        user_id=current_user.id
    )
    
    new_review.overall_experience = new_review.calculate_overall_experience()

    try:
        db.session.add(new_review)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

    return jsonify({"message": "Review created successfully!"}), 201

@app.route("/update_review/<int:review_id>", methods=["PATCH"])
@token_required
def update_review(current_user, review_id):
    review = Review.query.filter_by(id=review_id, user_id=current_user.id).first()
    if not review:
        return jsonify({"message": "Review not found or unauthorized"}), 404

    data = request.json
    
    for field in ["title", "location", "latitude", "longitude", "cleanliness", "ambience", "extra_amenities", "notes"]:
        if field in data:
            setattr(review, field, data[field])
    
    if any(field in data for field in ["cleanliness", "ambience", "extra_amenities"]):
        review.overall_experience = review.calculate_overall_experience()
    
    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

    return jsonify({
        "message": "Review updated successfully!",
        "review": review.to_json()
    }), 200


@app.route("/delete_review/<int:review_id>", methods=["DELETE"])
@token_required
def delete_review(current_user, review_id):
    review = Review.query.filter_by(id=review_id, user_id=current_user.id).first()
    if not review:
        return jsonify({"message": "Review not found or unauthorized"}), 404

    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted successfully!"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)