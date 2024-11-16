import { useState, useEffect } from "react";
import LocationAutocomplete from "./LocationAutocomplete";
import SetStarRating from "./SetStarRating";
import "../styles/Reviews.css";
import "../styles/Modal.css";

function ReviewForm({
  fetchReviews,
  closeModal,
  token,
  initialData,
  onSubmit,
  isEditing,
}) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    latitude: null,
    longitude: null,
    overall_experience: 0,
    cleanliness: 0,
    ambience: 0,
    extra_amenities: 0,
    notes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const average = (
      (formData.cleanliness + formData.ambience + formData.extra_amenities) /
      3
    ).toFixed(2);

    setFormData((prev) => ({
      ...prev,
      overall_experience: parseFloat(average),
    }));
  }, [formData.cleanliness, formData.ambience, formData.extra_amenities]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.latitude || !formData.longitude) {
      alert("Please select a valid location from the suggestions");
      return;
    }

    if (isEditing && onSubmit) {
      await onSubmit(formData);
    } else {
      try {
        const response = await fetch("http://127.0.0.1:5000/create_review", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error("Failed to create review");
        }

        await fetchReviews();
      } catch (error) {
        console.error("Error creating review:", error);
      }
    }

    closeModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLocationSelect = (locationData) => {
    setFormData({
      ...formData,
      location: locationData.displayName,
      latitude: locationData.latitude,
      longitude: locationData.longitude,
    });
  };

  const handleRatingChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="form-group">
        <label>Overall Experience</label>
        <div className="stars">
          <span className="rating-value">{formData.overall_experience}</span>
          <SetStarRating
            value={formData.overall_experience}
            onChange={() => {}}
            disabled={true}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="Give your review a title..."
        />
      </div>

      <div className="form-group">
        <label>Location</label>
        <LocationAutocomplete onLocationSelect={handleLocationSelect} />
      </div>

      <div className="form-group">
        <label>Cleanliness</label>
        <SetStarRating
          value={formData.cleanliness}
          onChange={(value) => handleRatingChange("cleanliness", value)}
        />
      </div>

      <div className="form-group">
        <label>Ambience</label>
        <SetStarRating
          value={formData.ambience}
          onChange={(value) => handleRatingChange("ambience", value)}
        />
      </div>

      <div className="form-group">
        <label>Extra Amenities</label>
        <SetStarRating
          value={formData.extra_amenities}
          onChange={(value) => handleRatingChange("extra_amenities", value)}
        />
      </div>

      <div className="form-group">
        <label>Notes (Optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="form-textarea"
        />
      </div>

      <button type="submit" className="submit-button">
        {isEditing ? "Update Review" : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;
