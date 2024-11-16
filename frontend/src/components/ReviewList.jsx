import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import "../styles/Reviews.css";
import "../styles/Modal.css";

function ReviewList({ reviews }) {
  const [selectedReview, setSelectedReview] = useState(null);

  const renderStars = (rating, small = false) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        style={{
          color: index < rating ? "#ffc107" : "#e4e5e9",
          marginRight: "2px",
          fontSize: small ? "12px" : "14px",
        }}
      />
    ));
  };

  const ReviewPreview = ({ review }) => (
    <div
      className="review-preview-card"
      onClick={() => setSelectedReview(review)}
    >
      <h4>{review.title}</h4>
      <p className="preview-location">{review.location}</p>
      <div className="preview-rating">
        <div className="stars">{renderStars(review.overall_experience)}</div>
      </div>
    </div>
  );

  const DetailModal = ({ review, onClose }) => (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div className="review-detail">
          <h2>{review.title}</h2>
          <p className="detail-location">{review.location}</p>

          <div className="ratings-container">
            <div className="main-rating">
              <label>Overall Experience</label>
              <div className="stars">
                {renderStars(review.overall_experience)}
              </div>
            </div>

            <div className="secondary-ratings">
              <div className="secondary-rating">
                <label>Cleanliness</label>
                <div className="stars">
                  {renderStars(review.cleanliness, true)}
                </div>
              </div>
              <div className="secondary-rating">
                <label>Ambience</label>
                <div className="stars">
                  {renderStars(review.ambience, true)}
                </div>
              </div>
              <div className="secondary-rating">
                <label>Extra Amenities</label>
                <div className="stars">
                  {renderStars(review.extra_amenities, true)}
                </div>
              </div>
            </div>
          </div>

          {review.notes && (
            <div className="notes-section">
              <h3>Notes</h3>
              <p>{review.notes}</p>
            </div>
          )}

          <div className="visits-section">
            <p>Times visited: {review.times_visited}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="reviews-scroll-container">
        {reviews.map((review) => (
          <ReviewPreview key={review.id} review={review} />
        ))}
      </div>

      {selectedReview && (
        <DetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </>
  );
}

export default ReviewList;
