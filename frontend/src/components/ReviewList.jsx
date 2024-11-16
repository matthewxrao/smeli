import React from "react";

const ReviewList = ({ reviews }) => {
  return (
    <div>
      <h2>Reviews</h2>
      <table>
        <thead>
          <tr>
            <th>Location</th>
            <th>Overall Experience</th>
            <th>Cleanliness</th>
            <th>Ambience</th>
            <th>Extra Ameneties</th>
            <th>Notes</th>
            <th>Times Visited</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.location}</td>
              <td>{review.overall_experience}</td>
              <td>{review.cleanliness}</td>
              <td>{review.ambience}</td>
              <td>{review.extra_amenities}</td>
              <td>{review.notes}</td>
              <td>{review.times_visited}</td>
              <td>
                <button>Edit</button>
                <button>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewList;
