import React from 'react';
import axios from 'axios';

function DownloadFile({ userFiles }) {
    const handleDownload = async (fileName) => {
        try {
            const token = localStorage.getItem('authToken');
            // Fetch the file as a blob
            const response = await axios.get(`http://localhost:5000/api/files/download/${fileName}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob' // Important: Set response type to 'blob'
            });

            // Create a URL for the file
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

            // Create a temporary link element
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileName); // Set the filename for download

            // Append the link to the body
            document.body.appendChild(link);
            link.click(); // Trigger the download

            // Clean up and remove the link
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert('Failed to download the file.');
        }
    };

    return (
        <div className="mt-4">
            <h2 className="text-lg font-semibold">Download Your Files:</h2>
            <ul>
                {userFiles.map((file, index) => (
                    <li key={index} className="flex justify-between items-center mt-2">
                        <span>{file.file_name}</span>
                        <button
                            onClick={() => handleDownload(file.file_name)}
                            className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition duration-200 ml-4"
                        >
                            Download
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DownloadFile;
