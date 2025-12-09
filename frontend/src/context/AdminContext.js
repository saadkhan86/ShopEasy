import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false); // Prevent multiple initial checks

  // Memoized checkAdminStatus to prevent recreating on every render
  const checkAdminStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const savedAdmin = localStorage.getItem("adminUser");

      // If no token or admin data, immediately set to not authenticated
      if (!token || !savedAdmin) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      // Verify token with backend
      const response = await fetch(
        "http://localhost:5000/api/admin/check-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.isAdmin) {
        setAdmin(JSON.parse(savedAdmin));
      } else {
        // Invalid or expired token
        logout();
      }
    } catch (error) {
      console.error("Admin status check failed:", error);
      logout(); // Clear invalid data on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check - runs only once on mount
  useEffect(() => {
    if (!initialCheckDone.current) {
      initialCheckDone.current = true;
      checkAdminStatus();
    }
  }, [checkAdminStatus]);

  const login = useCallback((adminData, token) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(adminData));
    setAdmin(adminData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    setAdmin(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    return admin !== null;
  }, [admin]);

  const isAdmin = useCallback(() => {
    return admin && admin.isAdmin === true;
  }, [admin]);

  const value = {
    admin,
    loading,
    login,
    logout,
    isAuthenticated,
    isAdmin,
    checkAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};
