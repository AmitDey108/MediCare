import React, { useContext, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import { api, getErrorMessage } from "../utils/api";

const fallbackCredentials = {
  email: "admin@zeecare.demo",
  password: "Admin@12345",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const { admin, setAdmin } = useContext(Context);
  const [form, setForm] = useState(fallbackCredentials);
  const [demoCredentials, setDemoCredentials] = useState(fallbackCredentials);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDemoCredentials = async () => {
      try {
        const { data } = await api.get("/user/admin/demo-credentials");
        setDemoCredentials(data.credentials || fallbackCredentials);
        setForm(data.credentials || fallbackCredentials);
      } catch {
        setDemoCredentials(fallbackCredentials);
      }
    };

    fetchDemoCredentials();
  }, []);

  if (admin.isAuthenticated) {
    return <Navigate to="/admin" replace />;
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
      const { data } = await api.post("/user/admin/login", form);
      setAdmin({
        isAuthenticated: true,
        user: data.user,
      });
      toast.success(data.message);
      navigate("/admin");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in as admin."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="admin-login-shell">
      <div className="admin-login-card">
        <div className="admin-login-copy">
          <span className="section-tag">Admin Control Center</span>
          <h1>Secure admin access for ZeeCare operations</h1>
          <p>
            This dashboard manages patients, doctors, appointments, messages,
            analytics, and activity logs.
          </p>

          <div className="demo-credentials">
            <strong>Demo credentials</strong>
            <p>Email: {demoCredentials.email}</p>
            <p>Password: {demoCredentials.password}</p>
          </div>
        </div>

        <form className="form-card admin-auth-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Admin email"
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
            {isSubmitting ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
