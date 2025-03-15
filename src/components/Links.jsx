import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "./Links.module.css";

// Navigation data structure
const navItems = [
  {
    path: "/",
    label: "Home",
    icon: (
      <svg
        className={styles.homeIcon}
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
      >
        <path d="M10.55 2.533a2.25 2.25 0 0 1 2.9 0l6.75 5.695c.508.427.8 1.056.8 1.72v9.802a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75v5a1.75 1.75 0 0 1-1.75 1.75h-3A1.75 1.75 0 0 1 3 19.75V9.947c0-.663.292-1.292.8-1.72l6.75-5.694Z" />
      </svg>
    ),
    showLabel: false,
  },
  {
    path: "/personal",
    label: "Personal",
    dropdown: [
      { path: "/personal/profile", label: "Profile" },
      { path: "/personal/settings", label: "Settings" },
    ],
  },
  {
    path: "/business",
    label: "Business",
    dropdown: [
      { path: "/business/accounts", label: "Accounts" },
      { path: "/business/services", label: "Services" },
    ],
  },
  {
    path: "/company",
    label: "Company",
    dropdown: [
      { path: "/company/about", label: "About Us" },
      { path: "/company/careers", label: "Careers" },
      { path: "/company/contact", label: "Contact" },
    ],
  },
];

function Links() {
  const [openDropdown, setOpenDropdown] = useState(null);

  function handleMouseEnter(dropdownName) {
    setOpenDropdown(dropdownName);
  }

  function handleMouseLeave(e) {
    // Prevent closing dropdown when moving from nav item to dropdown menu
    const relatedTarget = e.relatedTarget;
    if (
      relatedTarget &&
      (relatedTarget.classList.contains(styles.dropdownMenu) ||
        relatedTarget.closest(`.${styles.dropdownMenu}`))
    ) {
      return;
    }
    setOpenDropdown(null);
  }

  function handleOverlayClick() {
    setOpenDropdown(null);
  }

  // Reusable arrow icon component
  const ArrowIcon = ({ isOpen }) => (
    <svg
      className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : ""}`}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

  // Render a single navigation item (with or without dropdown)
  const renderNavItem = (item) => {
    const hasDropdown = item.dropdown && item.dropdown.length > 0;
    const dropdownName = item.label.toLowerCase();
    const isOpen = openDropdown === dropdownName;

    return (
      <li
        key={item.path}
        className={hasDropdown ? styles.dropdownContainer : ""}
        onMouseEnter={
          hasDropdown ? () => handleMouseEnter(dropdownName) : undefined
        }
        onMouseLeave={hasDropdown ? handleMouseLeave : undefined}
      >
        <NavLink
          to={item.path}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          {item.icon ||
            (item.showLabel === false ? null : <span>{item.label}</span>)}
          {item.icon && item.showLabel !== false && <span>{item.label}</span>}
          {hasDropdown && <ArrowIcon isOpen={isOpen} />}
        </NavLink>

        {hasDropdown && isOpen && (
          <div
            className={styles.dropdownWrapper}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <ul className={styles.dropdownMenu}>
              {item.dropdown.map((dropdownItem) => (
                <li key={dropdownItem.path}>
                  <NavLink
                    to={dropdownItem.path}
                    className={styles.dropdownItem}
                  >
                    {dropdownItem.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  };

  return (
    <>
      {openDropdown && (
        <div className={styles.overlay} onClick={handleOverlayClick} />
      )}

      <ul className={styles.list}>{navItems.map(renderNavItem)}</ul>
    </>
  );
}

export default Links;
