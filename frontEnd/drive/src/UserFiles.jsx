import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserFiles({ folderId = null }) {
    const [userFiles, setUserFiles] = useState([]);

    // Function to fetch the list of files
    const fetchFiles = async () => {
        try {
            const token = localStorage.getItem('authToken');
            let url = 'http://localhost:5000/api/files';
            if (folderId) {
                url = `http://localhost:5000/api/folders/${folderId}/files`; // Fetch files from a specific folder
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUserFiles(response.data); // Store the files in state
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    // Fetch files when component loads or folderId changes
    useEffect(() => {
        fetchFiles();
    }, [folderId]);

    // Handle file download
    const handleDownload = async (fileName) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`http://localhost:5000/api/files/download/${fileName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: Set response type to 'blob'
            });

            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName); // Set the filename for download

            document.body.appendChild(link);
            link.click(); // Trigger the download

            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download the file.');
        }
    };

    // Handle file deletion
    const handleDelete = async (fileName) => {
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/files/${fileName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            fetchFiles(); // Refresh the file list after deletion
        } catch (error) {
            console.error('Error deleting file:', error);
            alert('Failed to delete the file.');
        }
    };

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold">Your Files:</h2>
            <ul>
                {userFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center mt-2">
                        <span>{file.file_name}</span>
                        <div>
                            <button
                                onClick={() => handleDownload(file.file_name)}
                                className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-200 ml-4"
                            >
                                Download
                            </button>
                            <button
                                onClick={() => handleDelete(file.file_name)}
                                className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-200 ml-4"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserFiles;
