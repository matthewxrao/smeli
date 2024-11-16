import React, { useState } from "react";

const SetStarRating = ({ value, onChange }) => {
  const [hoveredValue, setHoveredValue] = useState(0);

  const handleMouseOver = (index) => setHoveredValue(index);
  const handleMouseLeave = () => setHoveredValue(0);
  const handleClick = (index) => onChange(index);

  return (
    <div className="flex cursor-pointer" onMouseLeave={handleMouseLeave}>
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const isActive = starIndex <= (hoveredValue || value);
        return (
          <span
            key={starIndex}
            onMouseOver={() => handleMouseOver(starIndex)}
            onClick={() => handleClick(starIndex)}
            className="mr-2 select-none text-2xl"
          >
            {isActive ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
};

const ReviewForm = () => {
  const [location, setLocation] = useState("");
  const [cleanliness, setCleanliness] = useState(0);
  const [ambience, setAmbience] = useState(0);
  const [extraAmenities, setExtraAmenities] = useState(0);
  const [notes, setNotes] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      location,
      cleanliness,
      ambience,
      extra_amenities: extraAmenities,
      notes,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/create_review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        alert("Review submitted successfully!");
        // Reset form
        setLocation("");
        setCleanliness(0);
        setAmbience(0);
        setExtraAmenities(0);
        setNotes("");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error submitting review");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Submit a Review</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="location" className="block font-medium text-gray-700">
            Location:
          </label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Cleanliness:
          </label>
          <SetStarRating value={cleanliness} onChange={setCleanliness} />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">Ambience:</label>
          <SetStarRating value={ambience} onChange={setAmbience} />
        </div>

        <div className="space-y-2">
          <label className="block font-medium text-gray-700">
            Extra Amenities:
          </label>
          <SetStarRating value={extraAmenities} onChange={setExtraAmenities} />
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block font-medium text-gray-700">
            Additional Notes:
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2 border rounded min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
