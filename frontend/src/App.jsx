import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import NavigationBar from "./components/NavigationBar";
import ReviewForm from "./components/ReviewForm";
import ReviewList from "./components/ReviewList";
import "./styles/base.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchReviews();
    }
  }, [token]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/reviews/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      handleLogout();
    }
  };

  const handleLogin = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    if (!isModalOpen) setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <>
      <NavigationBar
        username={user?.username}
        onLogout={handleLogout}
        openCreateModal={openCreateModal}
      />
      <div className="app-container">
        <ReviewList
          reviews={reviews}
          token={token}
          fetchReviews={fetchReviews}
        />
      </div>

      <div className="app-container">
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <ReviewForm
                closeModal={closeModal}
                token={token}
                onReviewCreated={fetchReviews}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
