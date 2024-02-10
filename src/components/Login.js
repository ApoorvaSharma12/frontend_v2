import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./Login.css";
import LoginBack from '../assets/Login-Background.png'; // Adjust the path as needed
import logo from '../assets/Logo.png'
const EmployeeLogin = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:7789/api/roshanLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { token, role } = data;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        onLogin(role);

        if (role === "admin") {
          navigate("/ManualDashboard");
        } else if (role === "user") {
          // Show success toast
          toast.success("Successfully logged in", {
            duration: 2000,
          });

          // Redirect to the next screen after 2 seconds
          setTimeout(() => {
            navigate("/About");
          }, 2000);
        }
      } else {
        // Show error toast for incorrect login
        toast.error("Incorrect username or password. Please try again.");
        console.error("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div className="background-image" style={{  backgroundImage: `url(${LoginBack})`,display:'flex',alignItems:'center',margin:'auto'}}>
      <div className="container" style={{margin:'auto'}}>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card">
            <img src={logo} style={{height:'70%',width:'70%',margin:'auto',padding:'50px'}}/>
              <div
                className="card-header text-white"
                style={{ backgroundColor: "#E4E4E4" }}
              >
                <h4 style={{ backgroundColor: "#E4E4E4", textAlign: "center" ,color:'black'}}>
                  Employee Login
                </h4>
              </div>
              <div
                className="card-body"
                style={{ display: "flex", justifyContent: "center" }}
              >
               
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <TextField
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <TextField
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      style={{
                        backgroundColor: "#DB252A",
                        border: "#DB252A",
                        display: "flex",
                        justifyContent: "center",
                        margin: "10px",
                        width:'80%',
                      }}
                    >
                      Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Toast container */}
      <Toaster position="top-left" />
    </div>
  );
};

export default EmployeeLogin;
