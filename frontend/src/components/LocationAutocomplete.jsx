import { useState, useEffect, useRef } from "react";
import "../styles/LocationAutocomplete.css";

function LocationAutocomplete({ onLocationSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect({
      displayName: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon),
    });
  };

  return (
    <div className="location-autocomplete">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a location..."
        className="location-input"
      />

      {isLoading && <div className="loading-indicator">Loading...</div>}

      {showSuggestions && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LocationAutocomplete;
