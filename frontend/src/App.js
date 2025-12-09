import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider, useAlert } from "./context/AlertContext";
import { AdminProvider } from "./context/AdminContext";
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
import NotFound from "./NotFound/NotFound";
import CreateListing from "./Listing/CreateListing";
import UserListings from "./Listing/UserListings";
import EditListing from "./Listing/EditListing";
// Admin imports
import AdminLogin from "./AdminLogin/AdminLogin";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminUsers from "./Admin/AdminUsers";
import AdminProducts from "./Admin/AdminProducts";
import AdminOrders from "./Admin/AdminOrders";
import AdminAnalytics from "./Admin/AdminAnalytics";
import AdminLayout from "./Admin/AdminLayout"; // Import the AdminLayout

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
        <AdminProvider>
          <div className="App">
            <AlertWrapper />
            <Routes>
              {/* ============================================ */}
              {/* PUBLIC ROUTES WITH NAVBAR */}
              {/* ============================================ */}
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <Routes>
                      {/* Home & Pages */}
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/terms" element={<Terms />} />

                      {/* Authentication */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/signup/:email/verification"
                        element={<EmailVerification />}
                      />
                      <Route
                        path="/forgot/:mail"
                        element={<ForgotPassword />}
                      />
                      <Route path="/reset/:token" element={<ResetPassword />} />

                      {/* User Routes */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/profile/cart/:id" element={<CartItems />} />

                      {/* Products */}
                      <Route
                        path="/product/:productId"
                        element={<ProductDetail />}
                      />
                      <Route
                        path="/listings/:id/my-listings"
                        element={<UserListings />}
                      />
                      <Route
                        path="/listings/:id/create"
                        element={<CreateListing />}
                      />
                      <Route
                        path="/edit-listing/:productId"
                        element={<EditListing />}
                      />
                      {/* Catch All */}

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </>
                }
              />

              {/* ============================================ */}
              {/* ADMIN LOGIN ROUTE WITH NAVBAR */}
              {/* ============================================ */}
              <Route
                path="/admin/login"
                element={
                  <>
                    <Navbar />
                    <AdminLogin />
                  </>
                }
              />

              {/* ============================================ */}
              {/* ALL ADMIN DASHBOARD ROUTES WITH ADMIN LAYOUT */}
              {/* ============================================ */}
              <Route
                path="/admin/*"
                element={
                  <AdminProtectedRoute>
                    {/* Use AdminLayout for all admin routes */}
                    <AdminLayout>
                      <Routes>
                        {/* Dashboard Home */}
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/dashboard" element={<AdminDashboard />} />

                        {/* Users Management */}
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/users/add" element={<AdminUsers />} />
                        <Route path="/users/:id" element={<AdminUsers />} />
                        <Route
                          path="/users/edit/:id"
                          element={<AdminUsers />}
                        />

                        {/* Products Management */}
                        <Route path="/products" element={<AdminProducts />} />
                        <Route
                          path="/products/add"
                          element={<AdminProducts />}
                        />
                        <Route
                          path="/products/:id"
                          element={<AdminProducts />}
                        />
                        <Route
                          path="/products/edit/:id"
                          element={<AdminProducts />}
                        />

                        {/* Orders Management */}
                        <Route path="/orders" element={<AdminOrders />} />
                        <Route path="/orders/:id" element={<AdminOrders />} />
                        <Route
                          path="/orders/view/:id"
                          element={<AdminOrders />}
                        />

                        {/* Analytics */}
                        <Route path="/analytics" element={<AdminAnalytics />} />

                        {/* Other Admin Pages (Placeholders for now) */}
                        <Route
                          path="/categories"
                          element={
                            <div>
                              <h1>Categories Management</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        <Route
                          path="/reports"
                          element={
                            <div>
                              <h1>Reports</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        <Route
                          path="/settings"
                          element={
                            <div>
                              <h1>Settings</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        <Route
                          path="/notifications"
                          element={
                            <div>
                              <h1>Notifications</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        <Route
                          path="/help"
                          element={
                            <div>
                              <h1>Help Center</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        <Route
                          path="/profile"
                          element={
                            <div>
                              <h1>Admin Profile</h1>
                              <p>This page is under construction.</p>
                            </div>
                          }
                        />

                        {/* Admin 404 */}
                        <Route
                          path="*"
                          element={
                            <div
                              style={{
                                padding: "40px",
                                textAlign: "center",
                                minHeight: "60vh",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <i
                                className="fa-solid fa-lock"
                                style={{
                                  fontSize: "64px",
                                  color: "#6c757d",
                                  marginBottom: "20px",
                                }}
                              ></i>
                              <h1>Admin Page Not Found</h1>
                              <p>
                                The requested admin page does not exist or you
                                don't have access.
                              </p>
                              <button
                                onClick={() =>
                                  (window.location.href = "/admin/dashboard")
                                }
                                style={{
                                  marginTop: "20px",
                                  padding: "10px 20px",
                                  background: "#007bff",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                              >
                                Go to Dashboard
                              </button>
                            </div>
                          }
                        />
                      </Routes>
                    </AdminLayout>
                  </AdminProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AdminProvider>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;
