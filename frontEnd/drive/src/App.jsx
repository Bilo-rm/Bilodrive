import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFileUrl(response.data.url);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-green-200">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4 text-center">File Storage</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-gray-200 file:text-gray-700
                                   hover:file:bg-gray-300"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                    >
                        Upload
                    </button>
                </form>
                {fileUrl && (
                    <div className="mt-4">
                        <h2 className="text-lg font-semibold">Uploaded File:</h2>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                        >
                            {fileUrl}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
