import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import { FaBell } from "react-icons/fa";

function Options({
  showModal,
  closeModal,
  darkMode,
  toggleDarkMode,
  notificationEnabled,
  toggleNotification,
}) {
  return (
    <Modal show={showModal} onHide={closeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Options</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="darkModeSwitch"
            checked={darkMode}
            onChange={toggleDarkMode}
          />
          <label className="form-check-label" htmlFor="darkModeSwitch">
            {darkMode ? <FaMoon /> : <FaSun />} Toggle Dark Mode
          </label>
        </div>

        <div className="form-check form-switch mt-1">
          <input
            className="form-check-input"
            type="checkbox"
            id="notificationToggle"
            checked={notificationEnabled}
            onChange={toggleNotification}
          />
          <label className="form-check-label mb-3" htmlFor="notificationToggle">
            <FaBell
              className={`bell-icon ${notificationEnabled ? "gold" : ""}`}
            />
            {notificationEnabled
              ? " Disable Notifications"
              : " Enable Notifications"}
          </label>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Options;
