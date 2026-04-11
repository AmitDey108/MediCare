import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../context/appContext";
import { api, departments, getErrorMessage } from "../utils/api";

const createInitialForm = (user) => ({
  firstName: user?.firstName || "",
  lastName: user?.lastName || "",
  email: user?.email || "",
  phone: user?.phone || "",
  nic: user?.nic || "",
  dob: user?.dob ? new Date(user.dob).toISOString().split("T")[0] : "",
  gender: user?.gender || "",
  appointment_date: "",
  appointment_time: "",
  department: user?.preferredDepartment || "",
  doctorId: "",
  address: user?.address || "",
  reasonForVisit: "",
  symptoms: "",
  patientNotes: "",
  hasVisited: false,
});

const validateAppointmentForm = (form) => {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "nic",
    "dob",
    "gender",
    "appointment_date",
    "appointment_time",
    "department",
    "address",
    "reasonForVisit",
  ];

  const missingFields = requiredFields.filter((field) =>
    !String(form[field] || "").trim()
  );

  if (missingFields.length) {
    return `Please complete: ${missingFields.join(", ")}.`;
  }

  if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    return "Please enter a valid email address.";
  }

  const appointmentDateTime = new Date(
    `${form.appointment_date}T${form.appointment_time}:00`
  );

  if (
    Number.isNaN(appointmentDateTime.getTime()) ||
    appointmentDateTime < new Date()
  ) {
    return "Please select a future appointment date and time.";
  }

  return "";
};

const AppointmentForm = () => {
  const navigate = useNavigate();
  const { patient, setPatient } = useContext(Context);
  const [form, setForm] = useState(createInitialForm(patient.user));
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  useEffect(() => {
    setForm(createInitialForm(patient.user));
  }, [patient.user]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await api.get("/user/doctors");
        setDoctors(data.doctors || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load doctors."));
      } finally {
        setIsLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (patient.isAuthenticated || patient.user) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/patient/me");
        setPatient({
          isAuthenticated: true,
          user: data.user,
        });
      } catch {
        // keep unauthenticated state
      }
    };

    fetchProfile();
  }, [patient.isAuthenticated, patient.user, setPatient]);

  const doctorsForDepartment = useMemo(
    () =>
      doctors.filter((doctor) => doctor.doctorDepartment === form.department),
    [doctors, form.department]
  );

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "department" ? { doctorId: "" } : {}),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!patient.isAuthenticated) {
      toast.error("Please log in to book an appointment.");
      navigate("/login");
      return;
    }

    const validationMessage = validateAppointmentForm(form);
    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await api.post("/appointment/post", form);
      toast.success(data.message);
      setForm(createInitialForm(patient.user));
      navigate("/profile");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to book the appointment."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="appointment-section container">
      <div className="section-heading">
        <span className="section-tag">Appointments</span>
        <h2>Patient booking that stays in sync with the admin panel</h2>
        <p>
          Bookings immediately appear in the admin dashboard, where the care team
          can approve, assign, or reschedule them.
        </p>
      </div>

      <div className="two-column-layout">
        <form className="form-card" onSubmit={handleSubmit}>
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
            <select
              name="department"
              value={form.department}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              name="appointment_date"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={form.appointment_date}
              onChange={handleChange}
            />
            <input
              name="appointment_time"
              type="time"
              value={form.appointment_time}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <select
              name="doctorId"
              value={form.doctorId}
              onChange={handleChange}
              disabled={!form.department || isLoadingDoctors}
            >
              <option value="">Any available doctor</option>
              {doctorsForDepartment.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))}
            </select>
            <input
              name="reasonForVisit"
              placeholder="Reason for visit"
              value={form.reasonForVisit}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <textarea
              rows="4"
              name="symptoms"
              placeholder="Symptoms"
              value={form.symptoms}
              onChange={handleChange}
            />
            <textarea
              rows="4"
              name="patientNotes"
              placeholder="Additional notes"
              value={form.patientNotes}
              onChange={handleChange}
            />
          </div>
          <textarea
            rows="4"
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
          />
          <label className="checkbox-row">
            <input
              type="checkbox"
              name="hasVisited"
              checked={form.hasVisited}
              onChange={handleChange}
            />
            <span>I have visited ZeeCare before</span>
          </label>
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>

        <aside className="side-card">
          <span className="section-tag">Doctor Directory</span>
          <h3>{form.department || "Choose a department"}</h3>
          <p>
            Select a department to see available doctors, or leave the doctor
            field blank to let the admin team assign the best match.
          </p>
          <div className="side-card-list">
            {form.department && doctorsForDepartment.length ? (
              doctorsForDepartment.map((doctor) => (
                <article className="directory-card" key={doctor._id}>
                  <img
                    src={doctor.docAvatar?.url || "/hero.png"}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                  />
                  <div>
                    <strong>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </strong>
                    <span>{doctor.specialization || doctor.doctorDepartment}</span>
                    <small>
                      {doctor.availabilityStatus} -{" "}
                      {doctor.doctorSchedule || "Schedule on request"}
                    </small>
                  </div>
                </article>
              ))
            ) : (
              <div>
                <p className="muted-copy">
                  {isLoadingDoctors
                    ? "Loading doctors..."
                    : form.department
                      ? "No currently available doctors in this department."
                      : "Choose a department to view available doctors."}
                </p>
                {!isLoadingDoctors && (
                  <Link to="/doctors" className="secondary-button">
                    View Full Doctor List
                  </Link>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default AppointmentForm;
