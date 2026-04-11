import React from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";

const AboutUs = () => (
  <>
    <Hero
      title="A healthcare platform built for real hospital operations."
      imageUrl="/whoweare.png"
      compact
    />
    <Biography imageUrl="/about.png" />
  </>
);

export default AboutUs;
