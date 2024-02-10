import React from "react";
import { NavLink } from "react-router-dom";
import "./NavBar.css";
import Button from '@mui/material/Button';

// Define styles
const linkStyle = {
  color: 'black',
  textDecoration: 'none'
};

const activeLinkStyle = {
  color: '#DB252A',
  textDecoration: 'none'
};

const hoverLinkStyle = {
  color: '#960c14',
  textDecoration: 'none'
};

function NavBar() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const userRole = localStorage.getItem('role');

  return (
    <div className="header">
      <img src={require("../assets/Logo.png")} alt="Logo" className="logo" id="logo" />
      <div className="NavBar">
        <NavLink to="/" exact activeClassName="active-link" style={linkStyle} activeStyle={activeLinkStyle} hoverStyle={hoverLinkStyle}>
          <li>Home</li>
        </NavLink>
        <NavLink to="/about" activeClassName="active-link" style={linkStyle} activeStyle={activeLinkStyle} hoverStyle={hoverLinkStyle}>
          <li>About</li>
        </NavLink>
        <NavLink to="/manualentry" activeClassName="active-link" style={linkStyle} activeStyle={activeLinkStyle} hoverStyle={hoverLinkStyle}>
          <li>Manual Entry</li>
        </NavLink>
        {userRole === 'admin' && (
          <NavLink to="/manualdashboard" activeClassName="active-link" style={linkStyle} activeStyle={activeLinkStyle} hoverStyle={hoverLinkStyle}>
            <li>Dashboard</li>
          </NavLink>
        )}
        
      </div>
      <div className="nav-right">
        <ul>
          <li><Button variant="outlined" color="error" onClick={handleLogout}>
          Logout
        </Button></li>
          
        </ul>
      </div>
    </div>
  );
}

export default NavBar;
