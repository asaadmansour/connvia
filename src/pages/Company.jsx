import PageNav from "../components/PageNav";
import Hero from "../components/Hero";
import HeaderNav from "../components/HeaderNav";
import Video from "../components/Video";
import styles from "./HomePage.module.css";
import { Link, Outlet } from "react-router-dom";

function Homepage() {
  return (
    <div className={styles.homeContainer}>
      <h3>company</h3>
      <Outlet />
      <Link to="about">link</Link>
    </div>
  );
}
export default Homepage;
