import { useState, useEffect } from "react";
import styles from "./testimonials.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const testimonialsContent = [
  {
    text: "Connvia helped me find the perfect event location with ease!",
    author: "Youssef Rayan",
    rate: 5,
    image: "./y.jpg",
  },
  {
    text: "As a vendor, Connvia gave me great exposure to new customers!",
    author: "Habiba Yehia",
    rate: 4,
    image: "./h.jpg",
  },
  {
    text: "I love how easy it is to discover events near me. Great platform!",
    author: "Asaad Mansour",
    rate: 5,
    image: "./a.jpg",
  },
];

function Testimonials() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial(
      (current) => (current + 1) % testimonialsContent.length
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((current) =>
      current === 0 ? testimonialsContent.length - 1 : current - 1
    );
  };

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 3000);
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className={styles.testimonialsContainer}>
      <h2 className={styles.title}>Testimonials</h2>
      <div className={styles.contentContainer}>
        <button className={styles.navButton} onClick={prevTestimonial}>
          <FaChevronLeft />
        </button>

        <div className={styles.testimonial}>
          {/* Display Image */}
          {testimonialsContent[currentTestimonial].image && (
            <img
              src={testimonialsContent[currentTestimonial].image}
              alt={testimonialsContent[currentTestimonial].author}
              className={styles.image}
            />
          )}

          {/* Testimonial Text */}
          <p className={styles.text}>
            &quot;{testimonialsContent[currentTestimonial].text}&quot;
          </p>

          {/* Star Ratings */}
          <div className={styles.stars}>
            {Array(testimonialsContent[currentTestimonial].rate)
              .fill()
              .map((_, index) => (
                <span key={index} className={styles.star}>
                  ⭐
                </span>
              ))}
          </div>

          {/* Author Name */}
          <h4 className={styles.author}>
            - {testimonialsContent[currentTestimonial].author}
          </h4>
        </div>

        <button className={styles.navButton} onClick={nextTestimonial}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}

export default Testimonials;
