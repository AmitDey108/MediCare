import React, { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import {
  api,
  departments,
  formatDate,
  formatDateTime,
  formatTime,
  getErrorMessage,
} from "../utils/api";

const tabs = ["overview", "users", "doctors", "appointments", "messages", "activity"];

const createDoctorForm = () => ({
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  nic: "",
  dob: "",
  gender: "",
  password: "",
  doctorDepartment: "",
  availabilityStatus: "Available",
  availableForAppointments: true,
  doctorSchedule: "",
  specialization: "",
  biography: "",
  yearsOfExperience: 0,
  avatarUrl: "",
  address: "",
});

const createAppointmentForm = () => ({
  patientId: "",
  doctorId: "",
  appointment_date: "",
  appointment_time: "",
  department: "",
  reasonForVisit: "",
  symptoms: "",
  patientNotes: "",
  status: "Accepted",
});

const AdminDashboard = () => {
  const { admin, clearAdmin } = useContext(Context);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState("");
  const [doctorForm, setDoctorForm] = useState(createDoctorForm());
  const [appointmentForm, setAppointmentForm] = useState(createAppointmentForm());
  const [isBusy, setIsBusy] = useState(false);

  const loadAdminData = async () => {
    try {
      const [
        dashboardResponse,
        usersResponse,
        appointmentsResponse,
        messagesResponse,
        activityResponse,
      ] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/users"),
        api.get("/admin/appointments"),
        api.get("/admin/messages"),
        api.get("/admin/activity"),
      ]);

      setDashboard(dashboardResponse.data);
      setUsers(usersResponse.data.users || []);
      setAppointments(appointmentsResponse.data.appointments || []);
      setMessages(messagesResponse.data.messages || []);
      setLogs(activityResponse.data.logs || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load admin data."));
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const doctors = useMemo(() => users.filter((user) => user.role === "Doctor"), [users]);
  const patients = useMemo(() => users.filter((user) => user.role === "Patient"), [users]);

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return users;
    }

    return users.filter((user) =>
      [user.firstName, user.lastName, user.email, user.phone, user.role]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [query, users]);

  const chartMax = useMemo(() => {
    const values = dashboard?.charts?.appointmentStatus?.map((item) => item.value) || [];
    return Math.max(...values, 1);
  }, [dashboard]);

  const handleAdminLogout = async () => {
    try {
      await api.post("/user/admin/logout");
      clearAdmin();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to log out."));
    }
  };

  const handleUserToggle = async (userId, isActive) => {
    setIsBusy(true);
    try {
      const { data } = await api.put(`/admin/users/${userId}`, { isActive: !isActive });
      toast.success(data.message);
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update user."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (path, fallbackMessage) => {
    setIsBusy(true);
    try {
      const { data } = await api.delete(path);
      toast.success(data.message);
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error, fallbackMessage));
    } finally {
      setIsBusy(false);
    }
  };

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);

    try {
      const endpoint = doctorForm._id
        ? api.put(`/admin/doctors/${doctorForm._id}`, doctorForm)
        : api.post("/admin/doctors", doctorForm);
      const { data } = await endpoint;
      toast.success(data.message);
      setDoctorForm(createDoctorForm());
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save doctor."));
    } finally {
      setIsBusy(false);
    }
  };

  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();
    setIsBusy(true);

    try {
      const { data } = await api.post("/admin/appointments", appointmentForm);
      toast.success(data.message);
      setAppointmentForm(createAppointmentForm());
      await loadAdminData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create appointment."));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <span className="section-tag">Admin</span>
          <h2>ZeeCare Ops</h2>
          <p>{admin.user?.email}</p>
        </div>

        <div className="admin-nav">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "admin-nav-active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <button type="button" className="secondary-button" onClick={handleAdminLogout}>
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <section className="admin-topbar">
          <div>
            <span className="section-tag">Control Center</span>
            <h1>Hospital operations dashboard</h1>
          </div>
          <input
            className="admin-search"
            placeholder="Search users"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </section>

        {activeTab === "overview" && dashboard && (
          <>
            <div className="stats-grid admin-stats-grid">
              {Object.entries(dashboard.stats).map(([label, value]) => (
                <article className="metric-card" key={label}>
                  <strong>{value}</strong>
                  <span>{label.replace(/([A-Z])/g, " $1").trim()}</span>
                </article>
              ))}
            </div>

            <div className="admin-overview-grid">
              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <span className="section-tag">Analytics</span>
                    <h2>Appointment status distribution</h2>
                  </div>
                </div>
                <div className="chart-stack">
                  {dashboard.charts.appointmentStatus.map((item) => (
                    <div className="chart-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="chart-bar-track">
                        <div
                          className="chart-bar-fill"
                          style={{ width: `${(item.value / chartMax) * 100}%` }}
                        />
                      </div>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel-card">
                <div className="panel-heading">
                  <div>
                    <span className="section-tag">Recent</span>
                    <h2>Latest system activity</h2>
                  </div>
                </div>
                <div className="stack-list compact-list">
                  {logs.slice(0, 8).map((log) => (
                    <article className="activity-row" key={log._id}>
                      <strong>{log.description}</strong>
                      <span>{formatDateTime(log.createdAt)}</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}

        {activeTab === "users" && (
          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">Users</span>
                <h2>User management</h2>
              </div>
            </div>
            <div className="table-list">
              {filteredUsers.map((user) => (
                <article className="table-row" key={user._id}>
                  <div>
                    <strong>
                      {user.firstName} {user.lastName}
                    </strong>
                    <span>{user.role} - {user.email}</span>
                  </div>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => handleUserToggle(user._id, user.isActive)}
                      disabled={isBusy}
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() => handleDelete(`/admin/users/${user._id}`, "Unable to delete user.")}
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "doctors" && (
          <div className="admin-overview-grid">
            <form className="panel-card" onSubmit={handleDoctorSubmit}>
              <div className="panel-heading">
                <div>
                  <span className="section-tag">Doctors</span>
                  <h2>{doctorForm._id ? "Edit doctor" : "Create doctor"}</h2>
                </div>
              </div>
              <div className="form-row">
                <input
                  placeholder="First name"
                  value={doctorForm.firstName}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                />
                <input
                  placeholder="Last name"
                  value={doctorForm.lastName}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                />
              </div>
              <div className="form-row">
                <input
                  placeholder="Email"
                  value={doctorForm.email}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
                <input
                  placeholder="Phone"
                  value={doctorForm.phone}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
              <div className="form-row">
                <input
                  placeholder="NIC"
                  value={doctorForm.nic}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, nic: event.target.value }))
                  }
                />
                <input
                  type="date"
                  value={doctorForm.dob}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, dob: event.target.value }))
                  }
                />
              </div>
              <div className="form-row">
                <select
                  value={doctorForm.gender}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, gender: event.target.value }))
                  }
                >
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <select
                  value={doctorForm.doctorDepartment}
                  onChange={(event) =>
                    setDoctorForm((current) => ({
                      ...current,
                      doctorDepartment: event.target.value,
                    }))
                  }
                >
                  <option value="">Department</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <select
                  value={doctorForm.availabilityStatus}
                  onChange={(event) =>
                    setDoctorForm((current) => ({
                      ...current,
                      availabilityStatus: event.target.value,
                    }))
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="On Leave">On Leave</option>
                </select>
                <label className="checkbox-row admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={doctorForm.availableForAppointments}
                    onChange={(event) =>
                      setDoctorForm((current) => ({
                        ...current,
                        availableForAppointments: event.target.checked,
                      }))
                    }
                  />
                  <span>Bookable for appointments</span>
                </label>
              </div>
              <div className="form-row">
                <input
                  placeholder="Specialization"
                  value={doctorForm.specialization}
                  onChange={(event) =>
                    setDoctorForm((current) => ({
                      ...current,
                      specialization: event.target.value,
                    }))
                  }
                />
                <input
                  type="number"
                  placeholder="Years of experience"
                  value={doctorForm.yearsOfExperience}
                  onChange={(event) =>
                    setDoctorForm((current) => ({
                      ...current,
                      yearsOfExperience: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-row">
                <input
                  type="password"
                  placeholder="Password"
                  value={doctorForm.password}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
                <input
                  placeholder="Avatar URL"
                  value={doctorForm.avatarUrl}
                  onChange={(event) =>
                    setDoctorForm((current) => ({ ...current, avatarUrl: event.target.value }))
                  }
                />
              </div>
              <input
                placeholder="Address"
                value={doctorForm.address}
                onChange={(event) =>
                  setDoctorForm((current) => ({ ...current, address: event.target.value }))
                }
              />
              <input
                placeholder="Schedule"
                value={doctorForm.doctorSchedule}
                onChange={(event) =>
                  setDoctorForm((current) => ({
                    ...current,
                    doctorSchedule: event.target.value,
                  }))
                }
              />
              <textarea
                rows="4"
                placeholder="Biography"
                value={doctorForm.biography}
                onChange={(event) =>
                  setDoctorForm((current) => ({ ...current, biography: event.target.value }))
                }
              />
              <div className="table-actions">
                <button type="submit" className="primary-button" disabled={isBusy}>
                  {doctorForm._id ? "Update Doctor" : "Create Doctor"}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setDoctorForm(createDoctorForm())}
                >
                  Reset
                </button>
              </div>
            </form>

            <section className="panel-card">
              <div className="panel-heading">
                <div>
                  <span className="section-tag">Directory</span>
                  <h2>Doctor roster</h2>
                </div>
              </div>
              <div className="table-list">
                {doctors.map((doctor) => (
                  <article className="table-row" key={doctor._id}>
                    <div>
                      <strong>
                        Dr. {doctor.firstName} {doctor.lastName}
                      </strong>
                      <span>
                        {doctor.doctorDepartment} - {doctor.specialization || "General"}
                      </span>
                      <small>
                        {doctor.availabilityStatus} -{" "}
                        {doctor.availableForAppointments ? "Bookable" : "Hidden from booking"}
                      </small>
                      <small>{doctor.doctorSchedule || "Schedule not set"}</small>
                    </div>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          setDoctorForm({
                            ...createDoctorForm(),
                            ...doctor,
                            dob: doctor.dob
                              ? new Date(doctor.dob).toISOString().split("T")[0]
                              : "",
                            avatarUrl: doctor.docAvatar?.url || "",
                            availableForAppointments:
                              typeof doctor.availableForAppointments === "boolean"
                                ? doctor.availableForAppointments
                                : true,
                            password: "",
                          })
                        }
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          handleDelete(`/admin/doctors/${doctor._id}`, "Unable to delete doctor.")
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="admin-overview-grid">
            <form className="panel-card" onSubmit={handleAppointmentSubmit}>
              <div className="panel-heading">
                <div>
                  <span className="section-tag">Appointments</span>
                  <h2>Create appointment</h2>
                </div>
              </div>
              <div className="form-row">
                <select
                  value={appointmentForm.patientId}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({ ...current, patientId: event.target.value }))
                  }
                >
                  <option value="">Select patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                <select
                  value={appointmentForm.doctorId}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({ ...current, doctorId: event.target.value }))
                  }
                >
                  <option value="">Assign later</option>
                  {doctors.map((doctor) => (
                    <option
                      key={doctor._id}
                      value={doctor._id}
                      disabled={
                        !doctor.availableForAppointments ||
                        doctor.availabilityStatus !== "Available"
                      }
                    >
                      Dr. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <input
                  type="date"
                  value={appointmentForm.appointment_date}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      appointment_date: event.target.value,
                    }))
                  }
                />
                <input
                  type="time"
                  value={appointmentForm.appointment_time}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      appointment_time: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="form-row">
                <select
                  value={appointmentForm.department}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({ ...current, department: event.target.value }))
                  }
                >
                  <option value="">Department</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <select
                  value={appointmentForm.status}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({ ...current, status: event.target.value }))
                  }
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <input
                placeholder="Reason for visit"
                value={appointmentForm.reasonForVisit}
                onChange={(event) =>
                  setAppointmentForm((current) => ({
                    ...current,
                    reasonForVisit: event.target.value,
                  }))
                }
              />
              <div className="form-row">
                <textarea
                  rows="3"
                  placeholder="Symptoms"
                  value={appointmentForm.symptoms}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({ ...current, symptoms: event.target.value }))
                  }
                />
                <textarea
                  rows="3"
                  placeholder="Patient notes"
                  value={appointmentForm.patientNotes}
                  onChange={(event) =>
                    setAppointmentForm((current) => ({
                      ...current,
                      patientNotes: event.target.value,
                    }))
                  }
                />
              </div>
              <button type="submit" className="primary-button" disabled={isBusy}>
                Create Appointment
              </button>
            </form>

            <section className="panel-card">
              <div className="panel-heading">
                <div>
                  <span className="section-tag">Queue</span>
                  <h2>Appointment management</h2>
                </div>
              </div>
              <div className="table-list">
                {appointments.map((appointment) => (
                  <article className="table-row" key={appointment._id}>
                    <div>
                      <strong>
                        {appointment.department} - {formatDate(appointment.appointment_date)}{" "}
                        {formatTime(appointment.appointment_time)}
                      </strong>
                      <span>
                        {appointment.patientId?.firstName} {appointment.patientId?.lastName} -{" "}
                        {appointment.status}
                      </span>
                    </div>
                    <div className="table-actions">
                      {["Pending", "Accepted"].map((status) => (
                        <button
                          type="button"
                          key={status}
                          className="secondary-button"
                          onClick={async () => {
                            try {
                              const { data } = await api.put(
                                `/admin/appointments/${appointment._id}`,
                                { status }
                              );
                              toast.success(data.message);
                              await loadAdminData();
                            } catch (error) {
                              toast.error(
                                getErrorMessage(error, "Unable to update appointment.")
                              );
                            }
                          }}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          handleDelete(
                            `/admin/appointments/${appointment._id}`,
                            "Unable to delete appointment."
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "messages" && (
          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">Inbox</span>
                <h2>Messages and status tracking</h2>
              </div>
            </div>
            <div className="table-list">
              {messages.map((message) => (
                <article className="table-row" key={message._id}>
                  <div>
                    <strong>{message.subject || "General Inquiry"}</strong>
                    <span>{message.firstName} {message.lastName} - {message.email}</span>
                    <p>{message.message}</p>
                  </div>
                  <div className="table-actions">
                    {["Reviewed", "Resolved"].map((status) => (
                      <button
                        type="button"
                        className="secondary-button"
                        key={status}
                        onClick={async () => {
                          try {
                            const { data } = await api.put(`/admin/messages/${message._id}`, {
                              status,
                            });
                            toast.success(data.message);
                            await loadAdminData();
                          } catch (error) {
                            toast.error(getErrorMessage(error, "Unable to update message."));
                          }
                        }}
                      >
                        {status}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        handleDelete(`/admin/messages/${message._id}`, "Unable to delete message.")
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "activity" && (
          <section className="panel-card">
            <div className="panel-heading">
              <div>
                <span className="section-tag">Audit Trail</span>
                <h2>Recent activity logs</h2>
              </div>
            </div>
            <div className="table-list">
              {logs.map((log) => (
                <article className="table-row" key={log._id}>
                  <div>
                    <strong>{log.description}</strong>
                    <span>{log.actorName} - {log.actorRole} - {log.action}</span>
                  </div>
                  <small>{formatDateTime(log.createdAt)}</small>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </section>
  );
};

export default AdminDashboard;
