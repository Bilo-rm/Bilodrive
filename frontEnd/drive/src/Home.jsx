import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserFiles from './UserFiles'; // Component to show files in a specific folder
import CreateFolder from './CreateFolder'; // Component to create folders
import Folder from './Folder'; // Component to list each folder

function Home({ onLogout }) {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null); // Tracks the currently selected folder
    const [folderFiles, setFolderFiles] = useState([]); // Files in the selected folder
    const [view, setView] = useState('allFolders'); // Controls the main view: "upload", "createFolder", "allFolders", "allFiles", "folderContents"

    useEffect(() => {
        fetchFolders();
    }, []);

    // Fetch all folders from the backend
    const fetchFolders = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get('http://localhost:5000/api/folders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolders(response.data);
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

    // Fetch files in the selected folder
    const fetchFilesInFolder = async (folderId) => {
        const token = localStorage.getItem('authToken');
        try {
            const response = await axios.get(`http://localhost:5000/api/folders/${folderId}/files`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolderFiles(response.data); // Store files of the selected folder
            setView('folderContents'); // Switch to folder contents view
        } catch (error) {
            console.error('Error fetching files in folder:', error);
        }
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        if (selectedFolder) {
            formData.append('folderName', selectedFolder.name);  // Send folder name
            formData.append('folderId', selectedFolder.id);      // Send folder ID
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFileUrl(response.data.url);
            fetchFolders(); // Refresh folders after upload
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    // Render file upload form
    const renderUploadForm = () => (
        <form onSubmit={handleFileUpload} className="space-y-4">
            <select
                value={selectedFolder ? selectedFolder.name : ''}
                onChange={(e) => {
                    const folder = folders.find(f => f.name === e.target.value);
                    setSelectedFolder(folder);  // Store the entire folder object
                }}
                className="block w-full text-sm text-gray-500 mb-2"
            >
                <option value="" disabled>Select Folder</option>
                {folders.map((folder) => (
                    <option key={folder.id} value={folder.name}>{folder.name}</option>
                ))}
            </select>
            <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500"
            />
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
            >
                Upload
            </button>
        </form>
    );

    // Render create folder form
    const renderCreateFolderForm = () => (
        <CreateFolder onFolderCreated={fetchFolders} />
    );

    // Render the list of folders
    const renderFoldersList = () => (
        <div className="folders-list space-y-4 mt-4">
            {folders.map((folder) => (
                <div key={folder.id} className="folder-item">
                    <Folder 
                        folder={folder} 
                        onFolderClick={() => {
                            setSelectedFolder(folder); // Update selected folder
                            fetchFilesInFolder(folder.id); // Fetch the folder's files
                        }}
                        onRefresh={fetchFolders} // Refresh folders list after deletion
                    />
                </div>
            ))}
        </div>
    );

    // Render the contents of a folder
    const renderFolderContents = () => (
        <div>
            <h2 className="text-xl font-bold mb-4">Files in {selectedFolder?.name}</h2>
            <UserFiles files={folderFiles} /> {/* Pass the files to UserFiles component */}
            <button
                onClick={() => setView('allFolders')}
                className="text-blue-500 underline mt-4"
            >
                Back to All Folders
            </button>
        </div>
    );

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">File Storage</h1>

                <div className="flex justify-around mb-4">
                    <button onClick={() => setView('upload')} className="text-blue-500 underline">Upload File</button>
                    <button onClick={() => setView('createFolder')} className="text-blue-500 underline">Create Folder</button>
                    <button onClick={() => setView('allFolders')} className="text-blue-500 underline">All Folders</button>
                    <button onClick={() => setView('allFiles')} className="text-blue-500 underline">All Files</button>
                </div>

                <div className="mt-4">
                    {view === 'upload' && renderUploadForm()}
                    {view === 'createFolder' && renderCreateFolderForm()}
                    {view === 'allFolders' && renderFoldersList()}
                    {view === 'folderContents' && renderFolderContents()}
                    {view === 'allFiles' && <UserFiles />} {/* All files view */}
                </div>

                <button
                    onClick={onLogout}
                    className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200 mt-4"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;
