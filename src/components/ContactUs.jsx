import { useState } from "react";
import emailjs from "emailjs-com";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ContactUs.module.css";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    inquiry: "",
    message: "",
  });

  const [isSending, setIsSending] = useState(false);

  const inquiries = [
    { value: "partnership", label: "Partnership Opportunities" },
    { value: "support", label: "Customer Support" },
    { value: "technical", label: "Technical Issues" },
    { value: "feedback", label: "Give Feedback" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    emailjs
      .send(
        "service_529jbzg",
        "template_v9p2v0k",
        {
          name: formData.name,
          email: formData.email,
          inquiry: formData.inquiry,
          message: formData.message,
        },
        "7f_TzjTD6puMw6DfK"
      )
      .then(() => {
        toast.success("📩 Message successfully sent to Connvia!");
        setFormData({ name: "", email: "", inquiry: "", message: "" });
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        toast.error("❌ Failed to send message. Please try again.");
      })
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <section className={styles.contactContainer}>
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <h2 className={styles.sectionTitle}>Contact Connvia</h2>
      <div className={styles.contentContainer}>
        <div className={styles.contactContent}>
          <div className={styles.left}>
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3451.897396664277!2d31.377002275231984!3d30.09712471607335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14581707dc679a73%3A0x7b2ac3cc70734300!2sAAST%20Business%20Building!5e0!3m2!1sen!2seg!4v1742256822890!5m2!1sen!2seg"
                title="Google Map"
              ></iframe>
            </div>
          </div>

          <div className={styles.right}>
            <h4>Get In Touch with Connvia</h4>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className={styles.floatingInput}
                    value={formData.name}
                    placeholder=""
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="name"
                    className={`${styles.floatingLabel} ${
                      formData.name ? styles.hasContent : ""
                    }`}
                  >
                    Your Name
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>✉️</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={styles.floatingInput}
                    value={formData.email}
                    placeholder=""
                    onChange={handleChange}
                    required
                  />
                  <label
                    htmlFor="email"
                    className={`${styles.floatingLabel} ${
                      formData.email ? styles.hasContent : ""
                    }`}
                  >
                    Your Email
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div className={styles.floatingInputWrapper}>
                  <span className={styles.inputIcon}>❓</span>
                  <select
                    id="inquiry"
                    name="inquiry"
                    className={styles.floatingInput}
                    value={formData.inquiry}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled></option>
                    {inquiries.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <label
                    htmlFor="inquiry"
                    className={`${styles.floatingLabel} ${
                      formData.inquiry ? styles.hasContent : ""
                    }`}
                  >
                    Select Inquiry Type
                  </label>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <div
                  className={styles.floatingInputWrapper}
                  style={{ height: "auto", minHeight: "6rem" }}
                >
                  <span className={styles.inputIcon} style={{ top: "1.2rem" }}>
                    💬
                  </span>
                  <textarea
                    id="message"
                    name="message"
                    className={`${styles.floatingInput} ${styles.textareaInput}`}
                    rows="3"
                    value={formData.message}
                    placeholder=""
                    onChange={handleChange}
                    required
                  ></textarea>
                  <label
                    htmlFor="message"
                    className={`${styles.floatingLabel} ${
                      styles.textareaLabel
                    } ${formData.message ? styles.hasContent : ""}`}
                  >
                    Your Message
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSending}
              >
                {isSending ? "⏳ Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
