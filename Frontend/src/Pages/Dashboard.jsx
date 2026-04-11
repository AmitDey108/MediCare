import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import {
  api,
  formatDate,
  formatTime,
  getErrorMessage,
} from "../utils/api";

const createProfileForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  phone: user?.phone || "",
  dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
  gender: user?.gender || "",
  address: user?.address || "",
  emergencyContact: user?.emergencyContact || "",
  bloodGroup: user?.bloodGroup || "",
  allergies: user?.allergies || "",
  chronicConditions: user?.chronicConditions || "",
  preferredDepartment: user?.preferredDepartment || "",
});

const Dashboard = () => {
  const { patient, setPatient } = useContext(Context);
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState(createProfileForm(patient.user));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(createProfileForm(patient.user));
  }, [patient.user]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResponse, appointmentsResponse] = await Promise.all([
          api.get("/user/patient/me"),
          api.get("/appointment/my"),
        ]);

        setPatient({
          isAuthenticated: true,
          user: profileResponse.data.user,
        });
        setAppointments(appointmentsResponse.data.appointments || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load your dashboard."));
      }
    };

    loadData();
  }, [setPatient]);

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        ["Pending", "Accepted"].includes(appointment.status)
      ),
    [appointments]
  );

  const stats = useMemo(
    () => ({
      total: appointments.length,
      upcoming: upcomingAppointments.length,
      completed: appointments.filter((item) => item.status === "Completed").length,
      cancelled: appointments.filter((item) => item.status === "Cancelled").length,
    }),
    [appointments, upcomingAppointments.length]
  );

  const handleProfileChange = ({ target: { name, value } }) => {
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const { data } = await api.put("/user/patient/update", profile);
      setPatient({
        isAuthenticated: true,
        user: data.user,
      });
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save your profile."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const { data } = await api.patch(`/appointment/cancel/${appointmentId}`, {
        cancelReason: "Cancelled by patient from dashboard",
      });
      toast.success(data.message);

      const refreshed = await api.get("/appointment/my");
      setAppointments(refreshed.data.appointments || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to cancel this appointment."));
    }
  };

  return (
    <section className="patient-dashboard container">
      <div className="dashboard-header-card">
        <div>
          <span className="section-tag">Patient Profile</span>
          <h1>{patient.user?.firstName || "Patient"}'s profile</h1>
          <p>
            Review your personal details, update your profile, and keep your
            appointment history organized in one place.
          </p>
        </div>
        <Link to="/appointment" className="primary-button">
          Book New Appointment
        </Link>
      </div>

      <div className="stats-grid">
        <article className="metric-card">
          <strong>{stats.total}</strong>
          <span>Total appointments</span>
        </article>
        <article className="metric-card">
          <strong>{stats.upcoming}</strong>
          <span>Upcoming visits</span>
        </article>
        <article className="metric-card">
          <strong>{stats.completed}</strong>
          <span>Completed visits</span>
        </article>
        <article className="metric-card">
          <strong>{stats.cancelled}</strong>
          <span>Cancelled visits</span>
        </article>
      </div>

      <div className="two-column-layout dashboard-layout">
        <div className="panel-card">
          <div className="panel-heading">
            <div>
              <span className="section-tag">Appointments</span>
              <h2>Appointment history</h2>
            </div>
          </div>
          <div className="stack-list">
            {appointments.length ? (
              appointments.map((appointment) => (
                <article className="appointment-item" key={appointment._id}>
                  <div className="appointment-item-top">
                    <div>
                      <strong>{appointment.department}</strong>
                      <span>
                        {formatDate(appointment.appointment_date)} at{" "}
                        {formatTime(appointment.appointment_time)}
                      </span>
                    </div>
                    <span className={`status-pill status-${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p>{appointment.reasonForVisit}</p>
                  <small>Email: {patient.user?.email || appointment.email}</small>
                  <small>
                    Doctor:{" "}
                    {appointment.doctor?.firstName
                      ? `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                      : "To be assigned"}
                  </small>
                  {["Pending", "Accepted"].includes(appointment.status) && (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleCancelAppointment(appointment._id)}
                    >
                      Cancel Appointment
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p className="muted-copy">No appointments found yet.</p>
            )}
          </div>
        </div>

        <form className="panel-card" onSubmit={handleProfileSubmit}>
          <div className="panel-heading">
            <div>
              <span className="section-tag">Profile</span>
              <h2>Personal information</h2>
            </div>
          </div>
          <input
            value={patient.user?.email || ""}
            disabled
            placeholder="Email"
          />
          <div className="form-row">
            <input
              name="firstName"
              placeholder="First name"
              value={profile.firstName}
              onChange={handleProfileChange}
            />
            <input
              name="lastName"
              placeholder="Last name"
              value={profile.lastName}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-row">
            <input
              name="phone"
              placeholder="Phone"
              value={profile.phone}
              onChange={handleProfileChange}
            />
            <input
              name="dob"
              type="date"
              value={profile.dob}
              onChange={handleProfileChange}
            />
          </div>
          <div className="form-row">
            <select name="gender" value={profile.gender} onChange={handleProfileChange}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <select
              name="bloodGroup"
              value={profile.bloodGroup}
              onChange={handleProfileChange}
            >
              <option value="">Blood group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
          <div className="form-row">
            <input
              name="emergencyContact"
              placeholder="Emergency contact"
              value={profile.emergencyContact}
              onChange={handleProfileChange}
            />
            <input
              name="preferredDepartment"
              placeholder="Preferred department"
              value={profile.preferredDepartment}
              onChange={handleProfileChange}
            />
          </div>
          <textarea
            rows="3"
            name="address"
            placeholder="Address"
            value={profile.address}
            onChange={handleProfileChange}
          />
          <div className="form-row">
            <textarea
              rows="3"
              name="allergies"
              placeholder="Allergies"
              value={profile.allergies}
              onChange={handleProfileChange}
            />
            <textarea
              rows="3"
              name="chronicConditions"
              placeholder="Chronic conditions"
              value={profile.chronicConditions}
              onChange={handleProfileChange}
            />
          </div>
          <button type="submit" className="primary-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Dashboard;
