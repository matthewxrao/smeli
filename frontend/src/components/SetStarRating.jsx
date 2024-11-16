import React, { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const SetStarRating = ({ value, onChange, disabled = false }) => {
  const [hoveredValue, setHoveredValue] = useState(0);

  const handleMouseOver = (index) => {
    if (!disabled) {
      setHoveredValue(index);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredValue(0);
    }
  };

  const handleClick = (index) => {
    if (!disabled) {
      onChange(index);
    }
  };

  const renderStarIcon = (index, activeValue) => {
    const starStyle = {
      color: "#ffc107",
      fontSize: "28px",
      opacity: disabled ? 0.6 : 1,
      cursor: disabled ? "default" : "pointer",
    };

    if (index <= activeValue) return <FaStar style={starStyle} />;
    if (index - 0.5 === activeValue) return <FaStarHalfAlt style={starStyle} />;
    return <FaRegStar style={{ ...starStyle, color: "#ccc" }} />;
  };

  return (
    <div
      className="star-rating"
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex", cursor: disabled ? "default" : "pointer" }}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
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
