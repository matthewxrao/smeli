import React, { useState } from "react";
import { IoGrid } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import "../styles/Navbar.css";

function NavigationBar({
  username,
  onLogout,
  openCreateModal,
  viewMode,
  onToggleView,
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleProfileClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Smeli</h1>
      </div>

      <div className="navbar-items">
        <div
          className={`nav-item ${viewMode === "nearby" ? "active" : ""}`}
          data-view={viewMode}
          onClick={onToggleView}
          title={
            viewMode === "user"
              ? "Switch to Nearby Reviews"
              : "Switch to My Reviews"
          }
        >
          <IoGrid className="nav-icon" />
        </div>

        <div className="nav-item" onClick={openCreateModal}>
          <FaPlus className="nav-icon" />
        </div>

        <div className="nav-item profile-menu">
          <div className="profile-trigger" onClick={handleProfileClick}>
            <FaUserCircle className="nav-icon" />
          </div>

          {showDropdown && (
            <>
              <div className="overlay" onClick={handleClickOutside} />
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <span>View Profile</span>
                </div>
                <div className="dropdown-item" onClick={onLogout}>
                  <span>Logout</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavigationBar;
