import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Signup from './Signup';
import Home from './Home'; 
import Logout from './Logout';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));
    const [isSignup, setIsSignup] = useState(false); // New state for toggling between Login and Signup

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setIsSignup(false); // Reset signup state on login
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsLoggedIn(false);
    };

    const toggleForm = () => {
        setIsSignup(!isSignup); // Toggle between login and signup
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : (isSignup ? <Signup onSignupSuccess={handleLoginSuccess} onToggleForm={toggleForm} /> : <Login onLoginSuccess={handleLoginSuccess} onToggleForm={toggleForm} />)} />
                <Route path="/signup" element={isLoggedIn ? <Navigate to="/" /> : (isSignup ? <Signup onSignupSuccess={handleLoginSuccess} onToggleForm={toggleForm} /> : <Login onLoginSuccess={handleLoginSuccess} onToggleForm={toggleForm} />)} />
                <Route path="/" element={isLoggedIn ? <Home onLogout={handleLogout} /> : <Navigate to="/login" />} />
                <Route path="/logout" element={<Logout handleLogout={handleLogout} />} />
            </Routes>
        </Router>
    );
}

export default App;
