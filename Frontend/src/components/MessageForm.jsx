import React, { useState } from "react";
import { toast } from "react-toastify";
import { api, getErrorMessage } from "../utils/api";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const MessageForm = () => {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await api.post("/message/send", form);
      toast.success(data.message);
      setForm(initialForm);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send your message."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="message-section container">
      <div className="section-heading">
        <span className="section-tag">Contact</span>
        <h2>Send a message to the care coordination desk</h2>
        <p>
          Every message lands directly in the admin inbox, where the team can
          review, resolve, and track communication.
        </p>
      </div>

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
        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
        />
        <textarea
          rows="6"
          name="message"
          placeholder="Tell us how we can help"
          value={form.message}
          onChange={handleChange}
        />
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </section>
  );
};

export default MessageForm;
