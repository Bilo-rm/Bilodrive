import React, { useState } from 'react';
import axios from 'axios';

function Folder({ folder, onFolderClick, onRefresh }) {
    const [showOptions, setShowOptions] = useState(false);

    const toggleOptions = (event) => {
        event.stopPropagation(); // Prevent click event from propagating
        setShowOptions(!showOptions);
    };

    const handleDeleteFolder = async (event) => {
        event.stopPropagation(); // Prevent click event from propagating
        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`http://localhost:5000/api/folders/${folder.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            onRefresh(); // Refresh folder list after deletion
        } catch (error) {
            console.error('Error deleting folder:', error);
        }
    };

    return (
        <div 
            onClick={() => onFolderClick(folder.id)}
            className="folder bg-gray-200 p-4 rounded-lg flex justify-between items-center cursor-pointer"
        >
            <span>{folder.name}</span>
            <div className="relative">
                <button onClick={toggleOptions} className="text-gray-600">⋮</button>
                {showOptions && (
                    <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-300 rounded-md shadow-lg">
                        <button 
                            onClick={handleDeleteFolder} 
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Folder;
