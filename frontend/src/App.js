import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider, useAlert } from "./context/AlertContext";
import Home from "./Home/Home";
import About from "./About/About";
import Login from "./Login/Login";
import Signup from "./Signup/Signup";
import Navbar from "./Navbar/Navbar";
import Profile from "./Profile/Profile";
import ProductDetail from "./ProductDetail/ProductDetail";
import Alert from "./Alert/Alert";
import Terms from "./Terms/Terms";
import EmailVerification from "./EmailVerification/EmailVerification";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ResetPassword from "./ResetPassword/ResetPassword";
import CartItems from "./CartItems/CartItems";
import NotFound from "./NotFound/NotFound"; // Import your NotFound component
import "./App.css";

// Component that uses the alert context
const AlertWrapper = () => {
  const { alert, hideAlert } = useAlert();

  return (
    <Alert
      status={alert.status}
      message={alert.message}
      title={alert.title}
      duration={alert.duration}
      show={alert.show}
      onClose={hideAlert}
    />
  );
};

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <div className="App">
          <Navbar />
          <AlertWrapper />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot/:id" element={<ForgotPassword />} />
            <Route path="/reset/:token" element={<ResetPassword />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/signup/:email/verification"
              element={<EmailVerification />}
            />
            <Route path="/about" element={<About />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<CartItems />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            {/* Add the 404 route at the end */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
