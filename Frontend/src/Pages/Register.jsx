import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import { api, getErrorMessage } from "../utils/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nic: "",
  dob: "",
  gender: "",
  password: "",
};

const Register = () => {
  const navigate = useNavigate();
  const { patient, setPatient } = useContext(Context);
  const [form, setForm] = useState(initialForm);
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
      const { data } = await api.post("/user/patient/register", form);
      setPatient({
        isAuthenticated: true,
        user: data.user,
      });
      toast.success(data.message);
      navigate("/profile");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to register right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell container">
      <div className="auth-card auth-card-wide">
        <span className="section-tag">New Patient</span>
        <h1>Create your ZeeCare account</h1>
        <p>
          Register once to book appointments faster and keep your medical profile
          ready for every visit.
        </p>
        <form className="form-card auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              name="firstName"
              placeholder="First name"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={form.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              name="nic"
              placeholder="National ID"
              value={form.nic}
              onChange={handleChange}
            />
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
