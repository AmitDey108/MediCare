import React from "react";
import { Link } from "react-router-dom";

const Hero = ({ title, imageUrl, compact = false }) => (
  <section className={`hero-section ${compact ? "hero-compact" : ""}`}>
    <div className="container hero-grid">
      <div className="hero-copy">
        <span className="section-tag">ZeeCare Medical Institute</span>
        <h1>{title}</h1>
        <p>
          A production-ready healthcare experience for patients and hospital
          teams, designed for faster bookings, clearer communication, and better
          operational visibility.
        </p>
        {!compact && (
          <div className="hero-actions">
            <Link to="/appointment" className="primary-button">
              Book Appointment
            </Link>
            <Link to="/login" className="secondary-button">
              Patient Login
            </Link>
          </div>
        )}
      </div>
      <div className="hero-visual">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <img src={imageUrl} alt="Medical care" className="hero-image" />
      </div>
    </div>
  </section>
);

export default Hero;
