import React from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import Departments from "../components/Departments";
import MessageForm from "../components/MessageForm";

const Home = () => (
  <>
    <Hero
      title="Book care faster, manage hospital operations smarter."
      imageUrl="/hero.png"
    />
    <section className="stats-strip container">
      <article>
        <strong>9+</strong>
        <span>Clinical departments</span>
      </article>
      <article>
        <strong>24/7</strong>
        <span>Message monitoring workflow</span>
      </article>
      <article>
        <strong>1</strong>
        <span>Unified admin command center</span>
      </article>
    </section>
    <Biography imageUrl="/about.png" />
    <Departments />
    <MessageForm />
  </>
);

export default Home;
