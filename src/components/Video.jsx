import PropTypes from 'prop-types';
import styles from "./Video.module.css";

function Video({ overlay = 0.75 }) {
  return (
    <div className={styles.videoWrapper}>
      <video
        className={styles.backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="/2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div
        className={styles.overlay}
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlay})` }}
      ></div>
    </div>
  );
}

Video.propTypes = {
  overlay: PropTypes.number
};

Video.defaultProps = {
  overlay: 0.75
};

export default Video;
