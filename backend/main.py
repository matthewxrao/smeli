from flask import request, jsonify
from config import app, db
from models import Review

# Get all reviews
@app.route("/reviews", methods=["GET"])
def get_reviews():
    reviews = Review.query.all()
    json_reviews = list(map(lambda x: x.to_json(), reviews))
    return jsonify({"reviews": json_reviews})

# Create review
@app.route("/create_review", methods=["POST"])
def create_review():
    location = request.json.get("location")
    overall_experience = request.json.get("overall_experience")
    cleanliness = request.json.get("cleanliness")
    ambience = request.json.get("ambience")
    extra_amenities = request.json.get("extra_amenities")
    notes = request.json.get("notes")

    if not location or not overall_experience or not cleanliness or not ambience or not extra_amenities:
        return jsonify({"message": "You must provide the location and rating of the overall experience, cleanliness, ambience, and extra amenities"}), 400

    new_review = Review(
        location=location, 
        overall_experience=overall_experience, 
        cleanliness=cleanliness, 
        ambience=ambience, 
        extra_amenities=extra_amenities, 
        notes=notes,
        times_visited=1
    )
    try:
        db.session.add(new_review)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": f"An error occurred: {str(e)}"}), 400
    
    return jsonify({"message": "Review created successfully!"}), 201

# Update review
@app.route("/update_review/<int:user_id>", methods=["PATCH"])
def update_review(user_id):
    review = Review.query.get(user_id)

    if not review:
        return jsonify({"message": "Review not found!"}), 404
    
    data = request.json
    review.location = data.get("location", review.location)
    review.overall_experience = data.get("overall_experience", review.overall_experience)
    review.cleanliness = data.get("cleanliness", review.cleanliness)
    review.ambience = data.get("ambience", review.ambience)
    review.extra_amenities = data.get("extra_amenities", review.extra_amenities)
    review.notes = data.get("notes", review.notes)
    review.times_visited = review.times_visited + 1

    db.session.commit()

    return jsonify({"message": "Review updated successfully!"}), 200

@app.route("/delete_review/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    review = Review.query.get(user_id)

    if not review:
        return jsonify({"message": "Review not found!"}), 404
    
    db.session.delete(review)
    db.session.commit()

    return jsonify({"message": "Review deleted successfully!"}), 200

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)