import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const SetStarRating = ({ value, onChange }) => {
  const [hoveredValue, setHoveredValue] = useState(0);

  const handleMouseOver = (index) => setHoveredValue(index);
  const handleMouseLeave = () => setHoveredValue(0);
  const handleClick = (index) => onChange(index);

  const renderStarIcon = (index, activeValue) => {
    if (index <= activeValue)
      return <FaStar style={{ color: "#ff0", fontSize: "28px" }} />;
    if (index - 0.5 === activeValue)
      return <FaStarHalfAlt style={{ color: "#ff0", fontSize: "28px" }} />;
    return <FaRegStar style={{ color: "#ccc", fontSize: "28px" }} />;
  };

  return (
    <div
      className="star-rating"
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex", cursor: "pointer" }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1; // Full star increments
        return (
          <span
            key={starIndex}
            onMouseOver={() => handleMouseOver(starIndex)}
            onClick={() => handleClick(starIndex)}
            style={{ marginRight: "5px", userSelect: "none" }}
          >
            {renderStarIcon(starIndex, hoveredValue || value)}
          </span>
        );
      })}
    </div>
  );
};

export default SetStarRating;
