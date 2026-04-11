import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Hero from "../components/Hero";
import { api, departments, getErrorMessage } from "../utils/api";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data } = await api.get("/user/doctors?includeUnavailable=true");
        setDoctors(data.doctors || []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to load doctors right now."));
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const groupedDoctors = useMemo(() => {
    const groups = departments.map((department) => ({
      department,
      doctors: doctors
        .filter((doctor) => doctor.doctorDepartment === department)
        .sort((left, right) =>
          `${left.firstName} ${left.lastName}`.localeCompare(
            `${right.firstName} ${right.lastName}`
          )
        ),
    }));

    const uncategorized = doctors.filter(
      (doctor) => !departments.includes(doctor.doctorDepartment)
    );

    if (uncategorized.length) {
      groups.push({
        department: "Other",
        doctors: uncategorized,
      });
    }

    return groups.filter((group) => group.doctors.length);
  }, [doctors]);

  return (
    <>
      <Hero
        title="Meet our doctors by department and availability."
        imageUrl="/about.png"
        compact
      />

      <section className="doctor-page container">
        <div className="section-heading">
          <span className="section-tag">Doctor List</span>
          <h2>Browse every doctor in the system</h2>
          <p>
            Doctors are grouped by department. Available doctors can be booked
            directly from the appointment page, while unavailable doctors stay
            visible here for reference.
          </p>
        </div>

        {isLoading ? (
          <div className="panel-card">
            <p className="muted-copy">Loading doctors...</p>
          </div>
        ) : groupedDoctors.length ? (
          <div className="doctor-department-stack">
            {groupedDoctors.map((group) => (
              <section className="panel-card" key={group.department}>
                <div className="panel-heading">
                  <div>
                    <span className="section-tag">{group.department}</span>
                    <h3>{group.department} Specialists</h3>
                  </div>
                  <span className="muted-copy">{group.doctors.length} doctors</span>
                </div>

                <div className="doctor-page-grid">
                  {group.doctors.map((doctor) => (
                    <article className="doctor-profile-card" key={doctor._id}>
                      <img
                        src={doctor.docAvatar?.url || "/hero.png"}
                        alt={`${doctor.firstName} ${doctor.lastName}`}
                      />
                      <div className="doctor-profile-copy">
                        <strong>
                          Dr. {doctor.firstName} {doctor.lastName}
                        </strong>
                        <span>{doctor.specialization || doctor.doctorDepartment}</span>
                        <small>{doctor.yearsOfExperience || 0} years experience</small>
                        <small>
                          Status: {doctor.availabilityStatus}
                          {doctor.availableForAppointments ? " - Bookable" : " - Not bookable"}
                        </small>
                        <small>{doctor.doctorSchedule || "Schedule not added yet"}</small>
                        {doctor.biography ? <p>{doctor.biography}</p> : null}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="panel-card">
            <p className="muted-copy">
              No doctors have been added yet. Create doctors from the admin panel first.
            </p>
            <Link to="/login" className="secondary-button">
              Go to Login
            </Link>
          </div>
        )}
      </section>
    </>
  );
};

export default Doctors;
