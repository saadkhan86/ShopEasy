import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userExist, setUserExist] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [showOnlyIcon, setShowOnlyIcon] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const checkUser = () => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setUserData(user);
        setUserExist(true);
      } catch (error) {
        // console.error("Error parsing user data:", error);
        setUserExist(false);
        setUserData(null);
      }
    } else {
      setUserExist(false);
      setUserData(null);
    }
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // Check screen size
  const checkScreenSize = () => {
    const width = window.innerWidth;
    setIsMobileScreen(width < 1000);
    setShowOnlyIcon(width <= 670); // Show only icon below 670px
  };

  // Add scroll effect, check user, and screen size
  useEffect(() => {
    checkUser();
    checkScreenSize();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // Handle screen resize
    const handleResize = () => {
      checkScreenSize();
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Check user on route changes
  useEffect(() => {
    checkUser();
  }, [location.pathname]);

  // Enhanced active link logic
  const getActiveClass = (path) => {
    const currentPath = location.pathname;

    // Exact match for home
    if (path === "/" && currentPath === "/") {
      return styles.active;
    }

    // Match for home with trailing slash
    if (path === "/" && currentPath === "/") {
      return styles.active;
    }

    // Match for specific routes
    if (path !== "/" && currentPath.startsWith(path)) {
      return styles.active;
    }

    return "";
  };

  // Check if current page is home
  const isHomePage = () => {
    return location.pathname === "/" || location.pathname === "/home";
  };

  // Navigation handler for compact links
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div 
      ref={navbarRef}
      className={`${styles.container} ${isScrolled ? styles.scrolled : ""} ${
        isMobileScreen ? styles.mobileScreen : ""
      }`}
    >
      <nav className={`${styles.navBar} ${isMobileScreen ? styles.compactNav : ""}`}>
        <div className={styles.navContent}>
          {/* Brand Logo - Home Link */}
          <Link
            className={`${styles.brand} ${isHomePage() ? styles.active : ""} ${
              isMobileScreen ? styles.compactBrand : ""
            } ${showOnlyIcon ? styles.iconOnlyBrand : ""}`}
            to="/"
            title="Shop Easy" // Add tooltip for icon-only
          >
            <i className={`fa-brands fa-opencart ${styles.brandIcon} ${
              isMobileScreen ? styles.compactIcon : ""
            }`}></i>
            {!showOnlyIcon && (isMobileScreen ? "SE" : "Shop Easy")}
          </Link>

          {/* Navigation Links - Always visible, not collapsed */}
          <ul className={`${styles.navLinks} ${
            isMobileScreen ? styles.compactLinks : ""
          } ${showOnlyIcon ? styles.iconOnlyLinks : ""}`}>
            {/* Conditional rendering based on user existence */}
            {userExist ? (
              // Show Profile and Logout when user is logged in
              <>
                <li className={`${styles.navItem} ${
                  isMobileScreen ? styles.compactItem : ""
                } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}>
                  <button
                    className={`${styles.navLink} ${styles.profileButton} ${
                      getActiveClass("/profile")
                    } ${isMobileScreen ? styles.compactLink : ""} ${
                      showOnlyIcon ? styles.iconOnlyLink : ""
                    }`}
                    onClick={handleProfile}
                    title="Profile" // Add tooltip for icon-only
                  >
                    <i className={`fa-solid fa-user ${
                      isMobileScreen ? styles.compactIcon : ""
                    } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}></i>
                    {!showOnlyIcon && !isMobileScreen && (userData?.name || "Profile")}
                    {!showOnlyIcon && isMobileScreen && (userData?.name ? userData.name.substring(0, 3) : "P")}
                  </button>
                </li>
              </>
            ) : (
              // Show Signup and Login when no user is logged in
              <>
                <li className={`${styles.navItem} ${
                  isMobileScreen ? styles.compactItem : ""
                } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}>
                  <Link
                    className={`${styles.navLink} ${getActiveClass(
                      "/signup"
                    )} ${isMobileScreen ? styles.compactLink : ""} ${
                      showOnlyIcon ? styles.iconOnlyLink : ""
                    }`}
                    to="/signup"
                    onClick={(e) => {
                      if (isMobileScreen) {
                        e.preventDefault();
                        handleNavigation("/signup");
                      }
                    }}
                    title="Signup" // Add tooltip for icon-only
                  >
                    <i className={`fa-solid fa-user-plus ${
                      isMobileScreen ? styles.compactIcon : ""
                    } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}></i>
                    {!showOnlyIcon && !isMobileScreen && "Signup"}
                    {!showOnlyIcon && isMobileScreen && "Sign"}
                  </Link>
                </li>

                <li className={`${styles.navItem} ${
                  isMobileScreen ? styles.compactItem : ""
                } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}>
                  <Link
                    className={`${styles.navLink} ${getActiveClass(
                      "/login"
                    )} ${isMobileScreen ? styles.compactLink : ""} ${
                      showOnlyIcon ? styles.iconOnlyLink : ""
                    }`}
                    to="/login"
                    onClick={(e) => {
                      if (isMobileScreen) {
                        e.preventDefault();
                        handleNavigation("/login");
                      }
                    }}
                    title="Login" // Add tooltip for icon-only
                  >
                    <i className={`fa-solid fa-right-to-bracket ${
                      isMobileScreen ? styles.compactIcon : ""
                    } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}></i>
                    {!showOnlyIcon && !isMobileScreen && "Login"}
                    {!showOnlyIcon && isMobileScreen && "Log"}
                  </Link>
                </li>
              </>
            )}

            {/* About Link (always visible) */}
            <li className={`${styles.navItem} ${
              isMobileScreen ? styles.compactItem : ""
            } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}>
              <Link
                className={`${styles.navLink} ${getActiveClass(
                  "/about"
                )} ${isMobileScreen ? styles.compactLink : ""} ${
                  showOnlyIcon ? styles.iconOnlyLink : ""
                }`}
                to="/about"
                onClick={(e) => {
                  if (isMobileScreen) {
                    e.preventDefault();
                    handleNavigation("/about");
                  }
                }}
                title="About" // Add tooltip for icon-only
              >
                <i className={`fa-solid fa-info-circle ${
                  isMobileScreen ? styles.compactIcon : ""
                } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}></i>
                {!showOnlyIcon && !isMobileScreen && "About"}
                {!showOnlyIcon && isMobileScreen && "Ab"}
              </Link>
            </li>

            {/* Optional: User status indicator - only show when user is logged in and not icon-only */}
            {userExist && !isMobileScreen && !showOnlyIcon && (
              <div className={styles.userStatus}>
                <div className={`${styles.statusDot} ${styles.online}`}></div>
                <span>Online</span>
              </div>
            )}
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;