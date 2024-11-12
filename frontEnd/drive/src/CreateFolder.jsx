import React, { useState } from 'react';
import axios from 'axios';

function CreateFolder() {
    const [folderName, setFolderName] = useState('');

    const handleFolderCreation = async () => {
        try {
            const token = localStorage.getItem('authToken'); // Retrieve token
            if (!token) {
                alert('User is not authenticated. Please log in again.');
                return;
            }
            
            const response = await axios.post('http://localhost:5000/api/folders/create', 
                { folderName }, // Data payload
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            alert('Folder created successfully!');
            setFolderName(''); // Clear the input after creation
        } catch (error) {
            console.error('Error creating folder:', error);
            alert('Failed to create folder. Please try again.');
        }
    };

    return (
        <div className="mt-4">
            <input
                type="text"
                placeholder="Folder Name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="block w-full text-sm text-gray-500 border rounded-md p-2"
            />
            <button
                onClick={handleFolderCreation}
                className="w-full bg-green-500 text-white py-2 mt-2 rounded-md hover:bg-green-600 transition duration-200"
            >
                Create Folder
            </button>
        </div>
    );
}

export default CreateFolder;
