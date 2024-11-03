// src/Login.js
import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess, onToggleForm }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/auth/login', { username, password });
            const token = response.data.token; // Assume the token is in response.data.token

            // Store the token in localStorage
            localStorage.setItem('authToken', token);

            onLoginSuccess();
        } catch (error) {
            console.error('Login failed:', error);
            setAuthError('Invalid username or password');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
            <form onSubmit={handleLogin} className="space-y-4">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full p-2 border rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Login
                </button>
                <p className="text-sm text-center mt-2">
                    Don't have an account?{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={onToggleForm}>
                        Sign Up
                    </span>
                </p>
                {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            </form>
        </div>
    );
}

export default Login;
