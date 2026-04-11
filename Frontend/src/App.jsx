import React, { useContext } from "react";
import "./App.css";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./Pages/Home";
import Appointment from "./Pages/Appointment";
import AboutUs from "./Pages/AboutUs";
import Doctors from "./Pages/Doctors";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminDashboard from "./Pages/AdminDashboard";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Context } from "./context/appContext";

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

const PatientRoute = ({ children }) => {
  const { patient, isBootstrapping } = useContext(Context);

  if (isBootstrapping) {
    return <div className="page-loading">Loading your session...</div>;
  }

  if (!patient.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { admin, isBootstrapping } = useContext(Context);

  if (isBootstrapping) {
    return <div className="page-loading">Loading admin session...</div>;
  }

  if (!admin.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const App = () => (
  <Router>
    <Routes>
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/appointment"
        element={
          <PublicLayout>
            <Appointment />
          </PublicLayout>
        }
      />
      <Route
        path="/doctors"
        element={
          <PublicLayout>
            <Doctors />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutUs />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <Register />
          </PublicLayout>
        }
      />
      <Route
        path="/login"
        element={
          <PublicLayout>
            <Login />
          </PublicLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <PublicLayout>
            <PatientRoute>
              <Dashboard />
            </PatientRoute>
          </PublicLayout>
        }
      />
      <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <ToastContainer position="top-right" autoClose={2500} />
  </Router>
);

export default App;
