from pydoc import text
from flask import request, jsonify
from config import app, db
from models import Review, User
from functools import wraps
import jwt
from datetime import datetime, timedelta, timezone
import math

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
        'exp': datetime.now(timezone.utc) + timedelta(days=1)
    }, app.config['SECRET_KEY'])

    return jsonify({
        "token": token,
        "user": user.to_json()
    })

@app.route("/reviews/nearby", methods=["GET"])
@token_required
def get_nearby_reviews(current_user):
    try:
        lat = float(request.args.get('latitude'))
        lng = float(request.args.get('longitude'))
    except (TypeError, ValueError):
        return jsonify({"message": "Invalid latitude or longitude"}), 400

    try:
        # Get all reviews with user information
        reviews = db.session.query(Review, User).join(User).all()
        nearby_reviews = []

        for review, user in reviews:
            try:
                lat1 = math.radians(lat)
                lon1 = math.radians(lng)
                lat2 = math.radians(review.latitude)
                lon2 = math.radians(review.longitude)

                dlon = lon2 - lon1
                dlat = lat2 - lat1
                a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
                c = 2 * math.asin(math.sqrt(a))
                r = 6371  # Radius of Earth in kilometers

                distance = c * r

                if distance <= 50:  # Only include reviews within 50km
                    review_dict = review.to_json()
                    review_dict['username'] = user.username  # Add username directly
                    review_dict['distance_km'] = round(distance, 2)
                    nearby_reviews.append(review_dict)

            except (TypeError, ValueError) as e:
                print(f"Error calculating distance for review {review.id}: {e}")
                continue

        nearby_reviews.sort(key=lambda x: x['distance_km'])

        if not nearby_reviews:
            return jsonify({
                "reviews": [],
                "message": "No reviews found within 50km of your location"
            })

        return jsonify({
            "reviews": nearby_reviews,
            "total": len(nearby_reviews)
        })

    except Exception as e:
        print(f"Error in get_nearby_reviews: {str(e)}")
        return jsonify({
            "message": "An error occurred while fetching nearby reviews",
            "error": str(e)
        }), 500

@app.route("/reviews/user", methods=["GET"])
@token_required
def get_user_reviews(current_user):
    try:
        user_reviews = db.session.query(Review, User)\
            .join(User)\
            .filter(Review.user_id == current_user.id)\
            .all()
            
        return jsonify({
            "reviews": [{
                **review.to_json(),
                'username': user.username
            } for review, user in user_reviews]
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
        
        # Get the review with username for response
        review_with_user = db.session.query(Review, User)\
            .join(User)\
            .filter(Review.id == new_review.id)\
            .first()
        
        response_data = review_with_user[0].to_json()
        response_data['username'] = review_with_user[1].username

        return jsonify({
            "message": "Review created successfully!",
            "review": response_data
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

@app.route("/update_review/<int:review_id>", methods=["PATCH"])
@token_required
def update_review(current_user, review_id):
    review = Review.query.filter_by(id=review_id, user_id=current_user.id).first()
    if not review:
        return jsonify({"message": "Review not found or unauthorized"}), 404

    data = request.json
    
    try:
        for field in ["title", "location", "latitude", "longitude", "cleanliness", "ambience", "extra_amenities", "notes"]:
            if field in data:
                setattr(review, field, data[field])
        
        if any(field in data for field in ["cleanliness", "ambience", "extra_amenities"]):
            review.overall_experience = review.calculate_overall_experience()
        
        db.session.commit()

        # Get updated review with username
        updated_review_with_user = db.session.query(Review, User)\
            .join(User)\
            .filter(Review.id == review_id)\
            .first()
            
        response_data = updated_review_with_user[0].to_json()
        response_data['username'] = updated_review_with_user[1].username

        return jsonify({
            "message": "Review updated successfully!",
            "review": response_data
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

@app.route("/delete_review/<int:review_id>", methods=["DELETE"])
@token_required
def delete_review(current_user, review_id):
    review = Review.query.filter_by(id=review_id, user_id=current_user.id).first()
    if not review:
        return jsonify({"message": "Review not found or unauthorized"}), 404

    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Review deleted successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)