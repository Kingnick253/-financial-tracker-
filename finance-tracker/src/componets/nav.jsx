import React from 'react'
import  '../index.css';
const nav = () => {

    return (
        <nav className="navbar">
          {/* Logo */}
          <div className="logo">Fiance Tracker</div>
    
          {/* Navigation Links */}
          <ul className="nav-links">
            <li><a href="#home">Place</a></li>
            <li><a href="#about">Holder</a></li>
            <li><a href="#services">Idk</a></li>
            <li><a href="#contact">Yet</a></li>
          </ul>
    
          {/* Auth Buttons */}
          <div className="auth-buttons">
            <button className="button" onClick={() => alert("Login clicked")}>Login</button>
            <button className="button" onClick={() => alert("Sign Up clicked")}>Sign Up</button>
          </div>
        </nav>
      );
    };


export default nav