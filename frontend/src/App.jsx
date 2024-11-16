import { useState, useEffect } from "react";
import ReviewList from "./components/ReviewList";
import ReviewForm from "./components/MakeReview";
import "./App.css";

function App() {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const response = await fetch("http://127.0.0.1:5000/reviews");
    const data = await response.json();
    setReviews(data.reviews);
    console.log(data.reviews);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  return (
    <>
      <ReviewList reviews={reviews} />
      <button onClick={openCreateModal}> Create Review </button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <ReviewForm fetchReviews={fetchReviews} closeModal={closeModal} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
