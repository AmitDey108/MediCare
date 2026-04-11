import React from "react";
import { departments } from "../utils/api";

const departmentImages = {
  Pediatrics: "/departments/pedia.jpg",
  Orthopedics: "/departments/ortho.jpg",
  Cardiology: "/departments/cardio.jpg",
  Neurology: "/departments/neuro.jpg",
  Oncology: "/departments/onco.jpg",
  Radiology: "/departments/radio.jpg",
  "Physical Therapy": "/departments/therapy.jpg",
  Dermatology: "/departments/derma.jpg",
  ENT: "/departments/ent.jpg",
};

const Departments = () => (
  <section className="departments-section container">
    <div className="section-heading">
      <span className="section-tag">Departments</span>
      <h2>Care pathways across every major service line</h2>
      <p>
        Patients can browse departments, request appointments, and get assigned
        to the right doctor based on availability and specialty.
      </p>
    </div>

    <div className="department-grid">
      {departments.map((department) => (
        <article className="department-card" key={department}>
          <img src={departmentImages[department]} alt={department} />
          <div className="department-overlay" />
          <div className="department-card-copy">
            <span>{department}</span>
          </div>
        </article>
      ))}
    </div>
  </section>
);

export default Departments;
