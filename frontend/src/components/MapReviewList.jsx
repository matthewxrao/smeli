import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  FaStar,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapReviewList = ({
  reviews,
  viewMode,
  userLocation,
  onDelete,
  onEdit,
}) => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [orderedReviews, setOrderedReviews] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const createNumberedIcon = (number, isSelected = false) => {
    return L.divIcon({
      className: "custom-marker-icon",
      html: `<div class="marker-number ${
        isSelected ? "selected" : ""
      }">${number}</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  useEffect(() => {
    setOrderedReviews(
      reviews.map((review, index) => ({
        ...review,
        orderIndex: index + 1,
      }))
    );
  }, [reviews]);

  const handleReviewSelect = (review) => {
    setSelectedReview(review);
    setOrderedReviews((prev) => [
      review,
      ...prev.filter((r) => r.id !== review.id),
    ]);
  };

  return (
    <div className="map-review-container">
      <style>
        {`
          .map-review-container {
            display: flex;
            height: calc(100vh - 60px);
            width: 100%;
            position: relative;
            background-color: #f8fafc;
          }
          
          .map-container {
            width: calc(100% - 320px);
            height: 100%;
            transition: all 0.3s ease;
            border-radius: 12px;
            overflow: hidden;
            margin: 16px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          }
          
          .map-container.sidebar-collapsed {
            width: calc(100% - 80px);
          }
          
          .review-list-container {
            width: 320px;
            height: 100%;
            transition: all 0.3s ease;
            position: relative;
            background: white;
            border-left: 1px solid #e2e8f0;
          }
          
          .review-list-container.collapsed {
            width: 80px;
          }
          
          .review-list-content {
            height: 100%;
            overflow-y: auto;
            transition: opacity 0.2s ease;
          }
          
          .review-list-content::-webkit-scrollbar {
            width: 8px;
          }
          
          .review-list-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          
          .review-list-content::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          
          .review-list-content::-webkit-scrollbar-thumb:hover {
            background: #666;
          }
          
          .review-list-container.collapsed .review-list-content {
            opacity: 0;
            pointer-events: none;
          }
          
          .custom-marker-icon {
            background: none;
          }
          
          .marker-number {
            width: 30px;
            height: 30px;
            background-color: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transition: all 0.2s ease;
          }
          
          .marker-number.selected {
            background-color: #1e40af;
            transform: scale(1.1);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }
          
          .review-preview-card {
            position: relative;
            padding: 12px 12px 12px 50px;
            margin: 12px;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .review-preview-card:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }
          
          .review-number {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 30px;
            height: 30px;
            background-color: #2563eb;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            transition: all 0.2s ease;
          }
          
          .selected-review {
            border: 2px solid #2563eb;
            background-color: #f0f7ff;
          }
          
          .selected-review .review-number {
            background-color: #1e40af;
            transform: translateY(-50%) scale(1.1);
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3);
          }

          .toggle-sidebar {
            position: absolute;
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1000;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 20px;
            width: 24px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: -2px 0 8px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
          }

          .toggle-sidebar:hover {
            background: #f8fafc;
          }

          .leaflet-popup-content {
            margin: 8px;
          }

          .leaflet-popup-content h4 {
            margin: 0 0 4px 0;
            color: #1e293b;
            font-size: 14px;
            font-weight: 600;
          }

          .leaflet-popup-content p {
            margin: 0;
            color: #64748b;
            font-size: 12px;
          }

          .reviews-header {
            padding: 20px 20px 0 20px;
            border-bottom: 1px solid #e2e8f0;
            background: white;
          }

          .reviews-header h2 {
            margin: 0 0 4px 0;
            font-size: 1.1rem;
            color: #1e293b;
          }

          .reviews-count {
            font-size: 0.85rem;
            color: #64748b;
            display: block;
            margin-bottom: 12px;
          }
        `}
      </style>

      <div
        className={`map-container ${
          isSidebarCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <MapContainer
          center={
            userLocation
              ? [userLocation.latitude, userLocation.longitude]
              : [0, 0]
          }
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {orderedReviews.map((review) => (
            <Marker
              key={review.id}
              position={[review.latitude, review.longitude]}
              icon={createNumberedIcon(
                review.orderIndex,
                selectedReview?.id === review.id
              )}
              eventHandlers={{
                click: () => handleReviewSelect(review),
              }}
            >
              <Popup>
                <h4>{review.title}</h4>
                <p>{review.location}</p>
              </Popup>
            </Marker>
          ))}

          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={L.divIcon({
                className: "custom-marker-icon",
                html: '<div class="marker-number" style="background-color: #16a34a;">You</div>',
                iconSize: [30, 30],
                iconAnchor: [15, 30],
              })}
            >
              <Popup>Your Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      <div
        className={`review-list-container ${
          isSidebarCollapsed ? "collapsed" : ""
        }`}
      >
        <button
          className="toggle-sidebar"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <div className="review-list-content">
          <div className="reviews-header">
            <h2>
              {viewMode === "user" ? "My entries" : "Bathrooms around you"}
            </h2>
            <span className="reviews-count">
              {reviews.length} {reviews.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {orderedReviews.map((review) => (
            <div
              key={review.id}
              className={`review-preview-card ${
                selectedReview?.id === review.id ? "selected-review" : ""
              }`}
              onClick={() => handleReviewSelect(review)}
            >
              <div className="review-number">{review.orderIndex}</div>
              <ReviewPreview
                review={review}
                onEdit={onEdit}
                onDelete={onDelete}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// Reuse the existing ReviewPreview component with slight modifications
const ReviewPreview = ({ review, onEdit, onDelete, viewMode }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        style={{
          color: index < rating ? "#ffc107" : "#e4e5e9",
          marginRight: "2px",
          fontSize: "14px",
        }}
      />
    ));
  };

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
    <>
      <div className="preview-header">
        <div className="preview-title-group">
          <h4 className="preview-title">{review.title}</h4>
          <span className="preview-username">by {review.username}</span>
        </div>
        {viewMode === "user" && (
          <div className="review-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(review);
              }}
              className="action-button edit"
              aria-label="Edit review"
            >
              <FaEdit />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (
                  window.confirm("Are you sure you want to delete this review?")
                ) {
                  onDelete(review.id);
                }
              }}
              className="action-button delete"
              aria-label="Delete review"
            >
              <FaTrash />
            </button>
          </div>
        )}
      </div>
      <p className="preview-location">{review.location}</p>
      <div className="preview-meta">
        {review.distance_km && (
          <span className="preview-distance">
            {review.distance_km.toFixed(2)} km away
          </span>
        )}
        <span className="preview-date">{formatDate(review.created_at)}</span>
      </div>
      <div className="preview-rating">
        <div className="stars">{renderStars(review.overall_experience)}</div>
      </div>
    </>
  );
};

export default MapReviewList;
