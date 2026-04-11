import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import { api, getErrorMessage } from "../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const { patient, setPatient } = useContext(Context);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (patient.isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/user/patient/login", form);
      setPatient({
        isAuthenticated: true,
        user: data.user,
      });
      toast.success(data.message);
      navigate("/profile");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to log in right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell container">
      <div className="auth-card">
        <span className="section-tag">Patient Access</span>
        <h1>Sign in to manage your appointments</h1>
        <p>
          Review upcoming visits, update your profile, and keep your booking
          history in one place.
        </p>
        <div className="login-role-actions">
          <span className="muted-copy">Admin access is only available here before login.</span>
          <Link to="/admin/login" className="secondary-button">
            Admin Login
          </Link>
        </div>
        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="auth-switch">
          New to ZeeCare? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
