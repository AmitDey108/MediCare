import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import { api, getErrorMessage } from "../utils/api";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { patient, clearPatient } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await api.post("/user/patient/logout");
      toast.success(data.message);
      clearPatient();
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to log out right now."));
    }
  };

  return (
    <header className="site-header">
      <nav className="container site-nav">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="ZeeCare" className="logo-img" />
          <div>
            <strong>ZeeCare</strong>
            <span>Smart hospital booking & admin operations</span>
          </div>
        </Link>

        <button
          type="button"
          className="menu-toggle"
          onClick={() => setOpen((current) => !current)}
        >
          Menu
        </button>

        <div className={`nav-panel ${open ? "nav-panel-open" : ""}`}>
          <div className="nav-links">
            <NavLink to="/" onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/appointment" onClick={() => setOpen(false)}>
              Appointment
            </NavLink>
            <NavLink to="/doctors" onClick={() => setOpen(false)}>
              Doctors
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>
              About
            </NavLink>
            {patient.isAuthenticated && (
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                My Profile
              </NavLink>
            )}
          </div>

          <div className="nav-actions">
            {patient.isAuthenticated ? (
              <button
                type="button"
                className="primary-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="primary-button"
                onClick={() => setOpen(false)}
              >
                Patient Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
