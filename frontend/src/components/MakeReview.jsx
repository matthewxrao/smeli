import { useState } from "react";

const MakeReview = ({}) => {
  const [location, setLocation] = useState("");
  const [overall_experience, setOverallExperience] = useState("");
  const [cleanliness, setCleanliness] = useState("");
  const [ambience, setAmbience] = useState("");
  const [extra_amenities, setExtraAmenities] = useState("");
  const [notes, setNotes] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = {
      location,
      overall_experience,
      cleanliness,
      ambience,
      extra_amenities,
      notes,
    };
    const url = "http://127.0.0.1:5000/create_review";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(url, options);

    if (response.status !== 201) {
      // Handle only 201
      const data = await response.json();
      alert(data.message);
    } else {
      //successful
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="overall_experience">Overall Experience:</label>
        <input
          type="number"
          id="overall_experience"
          value={overall_experience}
          onChange={(e) => setOverallExperience(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="cleanliness">Cleanliness:</label>
        <input
          type="number"
          id="cleanliness"
          value={cleanliness}
          onChange={(e) => setCleanliness(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="ambience">Ambience:</label>
        <input
          type="number"
          id="ambience"
          value={ambience}
          onChange={(e) => setAmbience(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="extra_amenities">Extra Amenities:</label>
        <input
          type="number"
          id="extra_amenities"
          value={extra_amenities}
          onChange={(e) => setExtraAmenities(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="notes">Additional Notes:</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default MakeReview;
