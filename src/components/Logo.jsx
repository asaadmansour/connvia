import PropTypes from 'prop-types';
import styles from "./Logo.module.css";
import { Link } from 'react-router-dom';

function Logo({color}) {
  return <Link to="/" className={styles.logo} style={{ color }}>
    Connvia
    </Link>; // No <Link> here
}

Logo.propTypes = {
  color: PropTypes.string
};

Logo.defaultProps = {
  color: 'white' // Default color if none is provided
};

export default Logo;
