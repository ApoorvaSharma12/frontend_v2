// App.jsx

import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import UserProfile from "./components/UserProfile";
import Dashboard from "./components/Dashboard";
import NavBar from "./components/NavBar";
import EmployeeLogin from "./components/Login";
import Back from "./components/Back";
import Footer from "./components/Footer"; 
import ManualEntry from "./components/ManualEntry";
import Modal from "./components/Modal";
import ManualDashboard from "./components/ManualDashboard";

function App() {
  const [user, setUser] = useState({
    isAuthenticated: false,
    role: "", // 'admin' or 'user'
  });

  const handleLogin = (role) => {
    setUser({
      isAuthenticated: true,
      role: role,
    });
  };

  const handleLogout = () => {
    setUser({
      isAuthenticated: false,
      role: "",
    });
  };

  return (
    <Router>
      <div className="App">
        <Back />
        {user.isAuthenticated && <NavBar role={user.role} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/"
            element={<EmployeeLogin onLogin={handleLogin} />}
          />
          {!user.isAuthenticated ? (
            // Use the 'element' prop to render the desired component
            <Route
              path="*"
              element={<Navigate to="/" />}
            />
          ) : (
            <>
              {/* <Route path="/Dashboard" element={<Dashboard />} /> */}
              <Route path="/About" element={<About />} />
              <Route path="/ContactUs" element={<ContactUs />} />
              <Route path="/UserProfile" element={<UserProfile />} />
              {user.role === "admin" && (
                <>
                  <Route path="/ManualEntry" element={<ManualEntry />} />
                  <Route path="/ManualDashboard" element={<ManualDashboard />} />
                </>
              )}
              <Route path="/ManualEntry" element={<ManualEntry />} />
            </>
          )}
        </Routes>
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;
