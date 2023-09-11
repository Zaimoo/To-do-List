import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";
import { FaBell } from "react-icons/fa";
import { BsFillAirplaneFill } from "react-icons/bs";

function Options({
  showModal,
  closeModal,
  darkMode,
  toggleDarkMode,
  notificationEnabled,
  toggleNotification,
  autoStart,
  toggleAutoStart,
  about
}

) 

{
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
            {darkMode ? <FaMoon /> : <FaSun />} Dark Mode
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
          <label className="form-check-label" htmlFor="notificationToggle">
            <FaBell
              className={`bell-icon ${notificationEnabled ? "gold" : ""}`}
            /> Notifications
          </label>
        </div>

        <div className="form-check form-switch mt-1">
        <input
          className="form-check-input"
          type="checkbox"
          id="autoStartToggle"
          checked={autoStart}
          onChange={toggleAutoStart}
        />
        <label className="form-check-label mb-3" htmlFor="autoStartToggle">
          <BsFillAirplaneFill /> Launch on Startup
        </label>
      </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={about}>
          About
        </Button>
        <Button variant="secondary" onClick={closeModal}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default Options;
