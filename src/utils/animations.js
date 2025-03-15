// Base variants for parent elements
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

// Header elements
export const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7,
      ease: "easeOut"
    }
  }
};

// Logo and nav buttons in header
export const logoVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Auth buttons
export const authButtonVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      ease: "easeOut",
      delay: 0.2 // slight delay after header
    }
  }
};

// Hero section text elements
export const textVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.7,
      ease: "easeOut",
      delay: 0.3 // comes after header
    }
  }
};

// Hero section buttons (App/Play Store)
export const buttonVariants = {
  hidden: { opacity: 0, y: -15, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
      delay: 0.5, // after text elements
      scale: { duration: 0.5 }
    }
  }
};

// Bottom nav - comes last
export const navVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    x: "-50%"
  },
  visible: {
    opacity: 1,
    y: 0,
    x: "-50%",
    transition: { 
      duration: 0.6,
      ease: "easeOut",
      delay: 0.7 // comes last
    }
  }
};
