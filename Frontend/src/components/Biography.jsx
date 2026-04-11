import React from "react";

const Biography = ({ imageUrl }) => (
  <section className="info-section container">
    <div className="info-visual">
      <img src={imageUrl} alt="ZeeCare team" />
    </div>
    <div className="info-copy">
      <span className="section-tag">Who We Are</span>
      <h2>Healthcare that feels coordinated, not chaotic.</h2>
      <p>
        ZeeCare helps patients move from inquiry to treatment with less friction.
        The platform gives patients a clear booking flow, while admins manage
        users, doctors, appointments, and incoming messages from one dashboard.
      </p>
      <p>
        The result is a cleaner hospital operation: fewer missed details, better
        visibility for the care team, and a more confident experience for people
        trying to get medical help quickly.
      </p>
    </div>
  </section>
);

export default Biography;
