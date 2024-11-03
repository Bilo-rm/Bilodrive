// src/components/Home.js
import React, { useState } from 'react';
import axios from 'axios';

function Home({ onLogout }) {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFileUrl(response.data.url);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-center">File Storage</h1>
            <form onSubmit={handleFileUpload} className="space-y-4">
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500" />
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200">
                    Upload
                </button>
            </form>
            {fileUrl && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold">Uploaded File:</h2>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {fileUrl}
                    </a>
                </div>
            )}
            <button onClick={onLogout} className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200 mt-4">
                Logout
            </button>
        </div>
    );
}

export default Home;
