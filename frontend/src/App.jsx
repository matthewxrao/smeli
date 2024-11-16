import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import NavigationBar from "./components/NavigationBar";
import ReviewForm from "./components/ReviewForm";
import MapReviewList from "./components/MapReviewList";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isUsingFallbackLocation, setIsUsingFallbackLocation] = useState(false);

  // Fallback coordinates (you can set these to a default location for your app)
  const FALLBACK_COORDINATES = {
    latitude: 40.7128, // New York City coordinates as fallback
    longitude: -74.006,
  };

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      requestLocation();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      if (viewMode === "nearby" && !userLocation && !isUsingFallbackLocation) {
        setError("Waiting for location...");
        return;
      }
      fetchReviews();
    }
  }, [token, viewMode, userLocation, isUsingFallbackLocation]);

  const requestLocation = () => {
    setLocationError(null);
    setIsUsingFallbackLocation(false);

    const handlePositionError = (error) => {
      console.error("Error getting location:", error);
      let errorMessage;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location permission denied. Using default location.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage =
            "Location information unavailable. Using default location.";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out. Using default location.";
          break;
        default:
          errorMessage = "Error getting location. Using default location.";
      }
      setLocationError(errorMessage);

      // Use fallback location
      console.log("Using fallback coordinates:", FALLBACK_COORDINATES);
      setUserLocation(FALLBACK_COORDINATES);
      setIsUsingFallbackLocation(true);
    };

    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        console.log("Geolocation permission status:", result.state);

        if (result.state === "denied") {
          handlePositionError({ code: 1, message: "PERMISSION_DENIED" });
          return;
        }

        // Options for getCurrentPosition
        const options = {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 300000, // Cache location for 5 minutes
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("Location obtained:", {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
            setLocationError(null);
            setIsUsingFallbackLocation(false);
          },
          handlePositionError,
          options
        );
      });
    } else {
      handlePositionError({
        code: -1,
        message: "Geolocation not supported",
      });
    }
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = viewMode === "user" ? "reviews/user" : "reviews/nearby";
      const url = new URL(`http://127.0.0.1:5000/${endpoint}`);

      if (viewMode === "nearby") {
        const locationToUse = userLocation || FALLBACK_COORDINATES;
        url.searchParams.append("latitude", locationToUse.latitude);
        url.searchParams.append("longitude", locationToUse.longitude);
      }

      console.log("Fetching reviews from:", url.toString());

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setError(null);
      } else {
        setError(data.message || "Failed to fetch reviews");
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Error connecting to the server");
    } finally {
      setIsLoading(false);
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
        await fetchReviews();
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      setError("Error connecting to the server");
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
        await fetchReviews();
        setEditingReview(null);
        setIsModalOpen(false);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      setError("Error connecting to the server");
    }
  };

  const toggleViewMode = () => {
    setError(null);
    if (viewMode === "user" && !userLocation) {
      requestLocation(); // Request location again when switching to nearby view
    }
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
    setUserLocation(null);
    setReviews([]);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setError(null);
  };

  const openCreateModal = () => {
    setEditingReview(null);
    setIsModalOpen(true);
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
        {locationError && viewMode === "nearby" && (
          <div className="error-message location-error">
            <span>{locationError}</span>
            {isUsingFallbackLocation && (
              <span className="fallback-notice">
                Using default location. Some features may be limited.
              </span>
            )}
            <button onClick={requestLocation} className="retry-button">
              Retry Location
            </button>
          </div>
        )}

        {error && !locationError && (
          <div className="error-message">
            {error}
            {error.includes("location") && (
              <button onClick={requestLocation} className="retry-button">
                Enable Location
              </button>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="loading">Loading reviews...</div>
        ) : (
          <MapReviewList
            reviews={reviews}
            token={token}
            viewMode={viewMode}
            userLocation={userLocation || FALLBACK_COORDINATES}
            onDelete={handleDeleteReview}
            onEdit={handleEditReview}
          />
        )}
      </div>

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
              onReviewCreated={fetchReviews}
              userLocation={userLocation}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
