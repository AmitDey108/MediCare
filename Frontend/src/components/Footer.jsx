import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="site-footer">
    <div className="container footer-grid">
      <div>
        <img src="/logo.png" alt="ZeeCare" className="logo-img footer-logo" />
        <p>
          ZeeCare unifies patient booking, doctor coordination, and hospital
          administration in one modern workflow.
        </p>
      </div>
      <div>
        <h4>Explore</h4>
        <Link to="/">Home</Link>
        <Link to="/appointment">Appointments</Link>
        <Link to="/about">About</Link>
      </div>
      <div>
        <h4>Availability</h4>
        <p>Mon - Thu: 9:00 AM - 10:00 PM</p>
        <p>Friday: 2:00 PM - 10:00 PM</p>
        <p>Saturday: 9:00 AM - 6:00 PM</p>
      </div>
      <div>
        <h4>Contact</h4>
        <p>24/7 Hotline: 09645-34562</p>
        <p>Email: care@zeecare.demo</p>
        <p>Dhaka, Bangladesh</p>
      </div>
    </div>
  </footer>
);

export default Footer;
