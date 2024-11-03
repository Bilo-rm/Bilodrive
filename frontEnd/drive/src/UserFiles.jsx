// src/components/UserFiles.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserFiles() {
    const [userFiles, setUserFiles] = useState([]); // State to store the list of files

    // Function to fetch the list of files
    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get('http://localhost:5000/api/files', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserFiles(response.data); // Store the files in state
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    useEffect(() => {
        fetchFiles(); // Fetch files when component loads
    }, []);

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold">Your Files:</h2>
            <ul>
                {userFiles.map((file, index) => (
                    <li key={index}>
                        <a 
                            href={file.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:underline"
                        >
                            {file.file_name}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserFiles;
