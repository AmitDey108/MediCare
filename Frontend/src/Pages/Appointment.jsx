import React from "react";
import Hero from "../components/Hero";
import AppointmentForm from "../components/AppointmentForm";

const Appointment = () => (
  <>
    <Hero
      title="Choose a department, pick a doctor, and lock in your visit."
      imageUrl="/signin.png"
      compact
    />
    <AppointmentForm />
  </>
);

export default Appointment;
