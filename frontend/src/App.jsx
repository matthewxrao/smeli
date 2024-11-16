import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import NavigationBar from "./components/NavigationBar";
import ReviewForm from "./components/ReviewForm";
import "./styles/base.css";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
    }
  }, [token]);

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
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={closeModal}>
                &times;
              </span>
              <ReviewForm closeModal={closeModal} token={token} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
