import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    show: false,
    status: "success",
    message: "",
    title: "",
    duration: 5000,
  });

  // Memoize showAlert to prevent unnecessary re-renders
  const showAlert = useCallback(
    (status, message, title = "", duration = 5000) => {
      setAlert({
        show: true,
        status,
        message,
        title,
        duration,
      });

      // Auto-hide after duration
      setTimeout(() => {
        setAlert((prev) => ({
          ...prev,
          show: false,
        }));
      }, duration);
    },
    []
  ); // Empty dependency array means this function is stable

  // Memoize hideAlert
  const hideAlert = useCallback(() => {
    setAlert((prev) => ({
      ...prev,
      show: false,
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      alert,
      showAlert,
      hideAlert,
    }),
    [alert, showAlert, hideAlert]
  ); // Only update when these values change

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
