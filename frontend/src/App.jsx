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
  const [viewMode, setViewMode] = useState("user");
  const [userLocation, setUserLocation] = useState(null);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);

      // Get user's location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
          }
        );
      }
      fetchReviews();
    }
  }, [token, viewMode]);

  const fetchReviews = async () => {
    try {
      const endpoint = viewMode === "user" ? "reviews/user" : "reviews/nearby";
      const url = new URL(`http://127.0.0.1:5000/${endpoint}`);

      if (viewMode === "nearby" && userLocation) {
        url.searchParams.append("latitude", userLocation.latitude);
        url.searchParams.append("longitude", userLocation.longitude);
      }

      const response = await fetch(url, {
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

  const handleEditReview = (review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/delete_review/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await fetchReviews(); // Immediately fetch updated reviews
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const handleUpdateReview = async (formData) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/update_review/${editingReview.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        await fetchReviews(); // Immediately fetch updated reviews
        setEditingReview(null);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "user" ? "nearby" : "user"));
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
        viewMode={viewMode}
        onToggleView={toggleViewMode}
      />
      <div className="app-container">
        <ReviewList
          reviews={reviews}
          token={token}
          viewMode={viewMode}
          userLocation={userLocation}
          onDelete={handleDeleteReview}
          onEdit={handleEditReview}
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
                onSubmit={editingReview ? handleUpdateReview : undefined}
                initialData={editingReview}
                isEditing={!!editingReview}
                onReviewCreated={fetchReviews} // Changed from onReviewCreated to match the prop name
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
