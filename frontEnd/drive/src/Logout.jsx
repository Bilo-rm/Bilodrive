// src/components/Logout.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout({ handleLogout }) {
    const navigate = useNavigate();

    useEffect(() => {
        handleLogout();
        navigate('/login');
    }, [handleLogout, navigate]);

    return null; // This component doesn’t render anything
}

export default Logout;
