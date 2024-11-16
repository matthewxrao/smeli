import React, { useState } from "react";
import { FaStar, FaEdit, FaTrash } from "react-icons/fa";
import "../styles/Reviews.css";
import "../styles/Modal.css";

function ReviewList({ reviews, viewMode, userLocation, onDelete, onEdit }) {
  const [selectedReview, setSelectedReview] = useState(null);

  const calculateDistance = (reviewLat, reviewLng) => {
    if (!userLocation) return null;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(reviewLat - userLocation.latitude);
    const dLon = toRad(reviewLng - userLocation.longitude);
    const lat1 = toRad(userLocation.latitude);
    const lat2 = toRad(reviewLat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value) => (value * Math.PI) / 180;

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

  const ReviewPreview = ({ review }) => {
    const distance =
      review.distance_km ||
      calculateDistance(review.latitude, review.longitude);

    const formatDate = (dateString) => {
      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("en-US", options);
    };

    return (
      <div
        className="review-preview-card"
        onClick={() => setSelectedReview(review)}
      >
        <div className="preview-header">
          <h4>{review.title}</h4>
          <span className="preview-username">by {review.username}</span>
        </div>
        <p className="preview-location">{review.location}</p>
        <div className="preview-meta">
          {distance && (
            <span className="preview-distance">
              {distance.toFixed(2)} km away
            </span>
          )}
          <span className="preview-date">{formatDate(review.created_at)}</span>
        </div>
        <div className="preview-rating">
          <div className="stars">{renderStars(review.overall_experience)}</div>
        </div>
      </div>
    );
  };

  const DetailModal = ({ review, onClose }) => (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <div className="review-detail">
          <div className="review-header">
            <div className="review-title-group">
              <h2>{review.title}</h2>
              <div className="review-meta">
                <span className="review-author">by {review.username}</span>
                <span className="review-date">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {review.updated_at !== review.created_at && (
                  <span className="review-edited">(posted)</span>
                )}
              </div>
            </div>
            {viewMode === "user" && (
              <div className="review-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(review);
                    onClose();
                  }}
                  className="action-button edit"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        "Are you sure you want to delete this review?"
                      )
                    ) {
                      onDelete(review.id);
                      onClose();
                    }
                  }}
                  className="action-button delete"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          <p className="detail-location">{review.location}</p>
          {review.distance_km && (
            <p className="detail-distance">
              {review.distance_km.toFixed(2)} km away
            </p>
          )}

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
                <label>Amenities</label>
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
