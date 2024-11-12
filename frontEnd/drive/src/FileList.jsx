// FileList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FileList({ selectedFolder }) {
    const [files, setFiles] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchFiles();
    }, [selectedFolder]);

    const fetchFiles = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get(`http://localhost:5000/api/folders/${selectedFolder}/files`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFiles(response.data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/folders/${selectedFolder}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchFiles(); // Refresh files after upload
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Files in Folder</h2>

            <form onSubmit={handleFileUpload} className="mb-4">
                <input type="file" onChange={handleFileChange} className="block w-full mb-2" />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Upload File
                </button>
            </form>

            <div className="space-y-2">
                {files.map((file) => (
                    <div key={file.id} className="bg-gray-100 p-2 rounded-md flex justify-between items-center">
                        <span>{file.name}</span>
                        <button className="text-red-600">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FileList;
