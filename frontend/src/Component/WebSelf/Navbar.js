import React, { useState, useEffect, useRef } from "react";
import styles from "./Navbar.module.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [userExist, setUserExist] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [showOnlyIcon, setShowOnlyIcon] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isUserActuallyAdmin, setIsUserActuallyAdmin] = useState(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const { showAlert } = useAlert();

  const API_BASE_URL = "http://localhost:5000/api";
  // Function to verify admin status from server
  const verifyAdminStatus = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsUserActuallyAdmin(false);
      return false;
    }

    setCheckingAdminStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/check-status`, {
        headers: {
          metho:"GET",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success && data.isAdmin) {
        setIsUserActuallyAdmin(true);

        // Update localStorage with correct admin status
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          user.isAdmin = true;
          localStorage.setItem("user", JSON.stringify(user));
          setUserData(user); // Update state
        }
        return true;
      } else {
        setIsUserActuallyAdmin(false);
        return false;
      }
    } catch (error) {
      console.error("Admin verification failed:", error);
      setIsUserActuallyAdmin(false);
      return false;
    } finally {
      setCheckingAdminStatus(false);
    }
  };

  // Function to check user from localStorage and verify admin status
  const checkUser = async () => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        setUserData(user);
        setUserExist(true);

        // Only verify admin if localStorage says user is admin
        if (user.isAdmin) {
          await verifyAdminStatus();
        } else {
          setIsUserActuallyAdmin(false);
        }
      } catch (error) {
        setUserExist(false);
        setUserData(null);
        setIsUserActuallyAdmin(false);
      }
    } else {
      setUserExist(false);
      setUserData(null);
      setIsUserActuallyAdmin(false);
    }
  };

  // Check if current page is an admin page
  const checkAdminPage = () => {
    const adminPaths = [
      "/admin",
      "/admin/",
      "/admin/login",
      "/admin/dashboard",
      "/admin/users",
      "/admin/products",
      "/admin/orders",
      "/admin/settings",
    ];

    const currentPath = location.pathname;
    const isAdminRoute = adminPaths.some((path) =>
      currentPath.startsWith(path)
    );
    setIsAdminPage(isAdminRoute);
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleAdminPanel = async () => {
    // First check if we've already verified admin status
    if (isUserActuallyAdmin) {
      navigate("/admin/login");
      return;
    }

    // If not verified yet, check now
    const isAdmin = await verifyAdminStatus();

    if (isAdmin) {
      navigate("/admin/login");
    } else {
      showAlert("warning", "You don't have admin privileges", "Access Denied");
      // Remove incorrect admin flag from localStorage
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.isAdmin) {
          user.isAdmin = false;
          localStorage.setItem("user", JSON.stringify(user));
          setUserData(user);
        }
      }
    }
  };

  const handleExitAdmin = () => {
    // Exit admin panel and go back to main site
    navigate("/");
  };

  // Check screen size
  const checkScreenSize = () => {
    const width = window.innerWidth;
    setIsMobileScreen(width < 1000);
    setShowOnlyIcon(width <= 670);
  };

  // Add scroll effect, check user, and screen size
  useEffect(() => {
    checkUser();
    checkScreenSize();
    checkAdminPage();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

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

  // Check user and admin page on route changes
  useEffect(() => {
    checkUser();
    checkAdminPage();
  }, [location.pathname]);

  // Enhanced active link logic
  const getActiveClass = (path) => {
    const currentPath = location.pathname;

    if (path === "/" && currentPath === "/") {
      return styles.active;
    }

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

  // If on admin page, show minimal navbar with only exit button
  if (isAdminPage) {
    return (
      <div
        ref={navbarRef}
        className={`${styles.container} ${styles.adminNavbarContainer} ${
          isScrolled ? styles.scrolled : ""
        }`}
      >
        <nav className={`${styles.navBar} ${styles.adminNavbar}`}>
          <div className={styles.navContent}>
            {/* Brand Logo - Home Link (Exit Admin) */}
            <button
              className={`${styles.brand} ${styles.exitAdminButton}`}
              onClick={handleExitAdmin}
              title="Exit Admin Panel"
            >
              <i className={`fa-solid fa-left-long ${styles.exitIcon}`}></i>
              {!showOnlyIcon && (isMobileScreen ? "Exit" : "Exit Admin Panel")}
            </button>

            {/* Admin Mode Indicator */}
            <div className={styles.adminModeIndicator}>
              <i className={`fa-solid fa-crown ${styles.adminCrown}`}></i>
              <span className={styles.adminText}>
                {!showOnlyIcon && "Admin Mode"}
              </span>
            </div>
          </div>
        </nav>
      </div>
    );
  }

  // Regular navbar (normal site)
  return (
    <div
      ref={navbarRef}
      className={`${styles.container} ${isScrolled ? styles.scrolled : ""} ${
        isMobileScreen ? styles.mobileScreen : ""
      }`}
    >
      <nav
        className={`${styles.navBar} ${
          isMobileScreen ? styles.compactNav : ""
        }`}
      >
        <div className={styles.navContent}>
          {/* Brand Logo - Home Link */}
          <Link
            className={`${styles.brand} ${isHomePage() ? styles.active : ""} ${
              isMobileScreen ? styles.compactBrand : ""
            } ${showOnlyIcon ? styles.iconOnlyBrand : ""}`}
            to="/"
            title="Shop Easy"
          >
            <i
              className={`fa-brands fa-opencart ${styles.brandIcon} ${
                isMobileScreen ? styles.compactIcon : ""
              }`}
            ></i>
            {!showOnlyIcon && (isMobileScreen ? "SE" : "Shop Easy")}
          </Link>

          {/* Navigation Links */}
          <ul
            className={`${styles.navLinks} ${
              isMobileScreen ? styles.compactLinks : ""
            } ${showOnlyIcon ? styles.iconOnlyLinks : ""}`}
          >
            {/* Conditional rendering based on user existence */}
            {userExist ? (
              // Show Profile, Admin Panel (if admin), and Logout when user is logged in
              <>
                {/* Admin Panel Button (only if user is verified admin) */}
                {
                (userData?.isAdmin || isUserActuallyAdmin) && (
                  <li
                    className={`${styles.navItem} ${
                      isMobileScreen ? styles.compactItem : ""
                    } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
                  >
                    <button
                      className={`${styles.navLink} ${
                        styles.adminButton
                      } ${getActiveClass("/admin")} ${
                        isMobileScreen ? styles.compactLink : ""
                      } ${showOnlyIcon ? styles.iconOnlyLink : ""}`}
                      onClick={handleAdminPanel}
                      title="Admin Panel"
                      disabled={checkingAdminStatus}
                    >
                      {checkingAdminStatus ? (
                        <i
                          className={`fa-solid fa-spinner fa-spin ${
                            isMobileScreen ? styles.compactIcon : ""
                          } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                        ></i>
                      ) : (
                        <>
                          <i
                            className={`fa-solid fa-crown ${
                              isMobileScreen ? styles.compactIcon : ""
                            } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                          ></i>
                          {!showOnlyIcon && !isMobileScreen && "Admin"}
                          {!showOnlyIcon && isMobileScreen && "Adm"}
                        </>
                      )}
                    </button>
                  </li>
                )}

                {/* Profile Button */}
                <li
                  className={`${styles.navItem} ${
                    isMobileScreen ? styles.compactItem : ""
                  } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
                >
                  <button
                    className={`${styles.navLink} ${
                      styles.profileButton
                    } ${getActiveClass("/profile")} ${
                      isMobileScreen ? styles.compactLink : ""
                    } ${showOnlyIcon ? styles.iconOnlyLink : ""}`}
                    onClick={handleProfile}
                    title="Profile"
                  >
                    <i
                      className={`fa-solid fa-user ${
                        isMobileScreen ? styles.compactIcon : ""
                      } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                    ></i>
                    {!showOnlyIcon &&
                      !isMobileScreen &&
                      (userData?.name || "Profile")}
                    {!showOnlyIcon &&
                      isMobileScreen &&
                      (userData?.name ? userData.name.substring(0, 3) : "P")}
                  </button>
                </li>

                {/* Logout Button */}
                {/* <li
                  className={`${styles.navItem} ${
                    isMobileScreen ? styles.compactItem : ""
                  } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
                >
                  <button
                    className={`${styles.navLink} ${styles.logoutButton} ${
                      isMobileScreen ? styles.compactLink : ""
                    } ${showOnlyIcon ? styles.iconOnlyLink : ""}`}
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <i
                      className={`fa-solid fa-right-from-bracket ${
                        isMobileScreen ? styles.compactIcon : ""
                      } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                    ></i>
                    {!showOnlyIcon && !isMobileScreen && "Logout"}
                    {!showOnlyIcon && isMobileScreen && "Out"}
                  </button>
                </li> */}
              </>
            ) : (
              // Show Signup and Login when no user is logged in
              <>
                <li
                  className={`${styles.navItem} ${
                    isMobileScreen ? styles.compactItem : ""
                  } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
                >
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
                    title="Signup"
                  >
                    <i
                      className={`fa-solid fa-user-plus ${
                        isMobileScreen ? styles.compactIcon : ""
                      } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                    ></i>
                    {!showOnlyIcon && !isMobileScreen && "Signup"}
                    {!showOnlyIcon && isMobileScreen && "Sign"}
                  </Link>
                </li>

                <li
                  className={`${styles.navItem} ${
                    isMobileScreen ? styles.compactItem : ""
                  } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
                >
                  <Link
                    className={`${styles.navLink} ${getActiveClass("/login")} ${
                      isMobileScreen ? styles.compactLink : ""
                    } ${showOnlyIcon ? styles.iconOnlyLink : ""}`}
                    to="/login"
                    onClick={(e) => {
                      if (isMobileScreen) {
                        e.preventDefault();
                        handleNavigation("/login");
                      }
                    }}
                    title="Login"
                  >
                    <i
                      className={`fa-solid fa-right-to-bracket ${
                        isMobileScreen ? styles.compactIcon : ""
                      } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                    ></i>
                    {!showOnlyIcon && !isMobileScreen && "Login"}
                    {!showOnlyIcon && isMobileScreen && "Log"}
                  </Link>
                </li>
              </>
            )}

            {/* About Link (always visible) */}
            <li
              className={`${styles.navItem} ${
                isMobileScreen ? styles.compactItem : ""
              } ${showOnlyIcon ? styles.iconOnlyItem : ""}`}
            >
              <Link
                className={`${styles.navLink} ${getActiveClass("/about")} ${
                  isMobileScreen ? styles.compactLink : ""
                } ${showOnlyIcon ? styles.iconOnlyLink : ""}`}
                to="/about"
                onClick={(e) => {
                  if (isMobileScreen) {
                    e.preventDefault();
                    handleNavigation("/about");
                  }
                }}
                title="About"
              >
                <i
                  className={`fa-solid fa-info-circle ${
                    isMobileScreen ? styles.compactIcon : ""
                  } ${showOnlyIcon ? styles.iconOnlyIcon : ""}`}
                ></i>
                {!showOnlyIcon && !isMobileScreen && "About"}
                {!showOnlyIcon && isMobileScreen && "Ab"}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
