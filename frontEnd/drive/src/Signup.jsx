// src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';

function Signup({ onSignupSuccess, onToggleForm }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/auth/signup', { username, password });
            onSignupSuccess();
        } catch (error) {
            console.error('Signup failed:', error);
            setAuthError('Signup failed. Try again.');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-center">Sign Up</h1>
            <form onSubmit={handleSignup} className="space-y-4">
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
                    className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
                >
                    Sign Up
                </button>
                <p className="text-sm text-center mt-2">
                    Already have an account?{' '}
                    <span className="text-blue-500 cursor-pointer" onClick={onToggleForm}>
                        Login
                    </span>
                </p>
                {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            </form>
        </div>
    );
}

export default Signup;
