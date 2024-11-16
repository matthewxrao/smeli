import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import ReviewForm from "./ReviewForm";
import "../styles/Reviews.css";
import "../styles/Modal.css";

function ReviewList({ reviews, token, fetchReviews }) {
  const [editingReview, setEditingReview] = useState(null);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/delete_review/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete review");
      }

      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleUpdate = async (id, updateData) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update_review/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      await fetchReviews();
      setEditingReview(null);
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        style={{
          color: index < rating ? "#ffc107" : "#e4e5e9",
          marginRight: "2px",
        }}
      />
    ));
  };

  return (
    <div className="reviews-container">
      {reviews.map((review) => (
        <div key={review.id} className="review-card">
          {editingReview === review.id ? (
            <div className="edit-modal">
              <div className="edit-modal-content">
                <span className="close" onClick={() => setEditingReview(null)}>
                  &times;
                </span>
                <ReviewForm
                  initialData={review}
                  onSubmit={(data) => handleUpdate(review.id, data)}
                  closeModal={() => setEditingReview(null)}
                  token={token}
                  isEditing={true}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="review-header">
                <h3>{review.location}</h3>
                <div className="review-actions">
                  <button
                    onClick={() => setEditingReview(review.id)}
                    className="update-button"
                    aria-label="Update review"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="delete-button"
                    aria-label="Delete review"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="rating-group">
                <label>Overall Experience:</label>
                <div className="stars">
                  {renderStars(review.overall_experience)}
                </div>
              </div>
              <div className="rating-group">
                <label>Cleanliness:</label>
                <div className="stars">{renderStars(review.cleanliness)}</div>
              </div>
              <div className="rating-group">
                <label>Ambience:</label>
                <div className="stars">{renderStars(review.ambience)}</div>
              </div>
              <div className="rating-group">
                <label>Extra Amenities:</label>
                <div className="stars">
                  {renderStars(review.extra_amenities)}
                </div>
              </div>
              {review.notes && <p className="notes">Notes: {review.notes}</p>}
              <p className="visits">Times visited: {review.times_visited}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default ReviewList;
