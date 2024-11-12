// CreateFolder.js

import React, { useState } from 'react';
import axios from 'axios';

function CreateFolder() {
    const [folderName, setFolderName] = useState('');

    const handleFolderNameChange = (e) => {
        setFolderName(e.target.value);
    };

    const handleCreateFolder = async () => {
        if (!folderName) {
            alert("Please enter a folder name.");
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('http://localhost:5000/api/folders/create', 
                { folderName },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Folder created successfully!");
            console.log(response.data);
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Folder creation failed.");
        }
    };

    return (
        <div className="mt-4">
            <input
                type="text"
                placeholder="New Folder Name"
                value={folderName}
                onChange={handleFolderNameChange}
                className="block w-full text-sm text-gray-500 mb-2"
            />
            <button
                onClick={handleCreateFolder}
                className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition duration-200"
            >
                Create Folder
            </button>
        </div>
    );
}

export default CreateFolder;
