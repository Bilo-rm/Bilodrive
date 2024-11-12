import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserFiles from './UserFiles';
import CreateFolder from './CreateFolder';
import Folder from './Folder';

function Home({ onLogout }) {
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState('');
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [folderFiles, setFolderFiles] = useState([]);
    const [allFiles, setAllFiles] = useState([]);
    const [view, setView] = useState('allFolders');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileCategory, setFileCategory] = useState(''); // For category filter

    useEffect(() => {
        fetchFolders();
    }, []);

    // Fetch all folders from the backend
    const fetchFolders = async () => {
        const token = localStorage.getItem('authToken');
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/folders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolders(response.data);
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching folders:', error);
            setErrorMessage('Failed to load folders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all files with category filter
    const fetchAllFiles = async () => {
        const token = localStorage.getItem('authToken');
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/files', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { category: fileCategory }, // Sending category as a query param
            });
            setAllFiles(response.data);
            setErrorMessage('');
            setView('allFiles');
        } catch (error) {
            console.error('Error fetching all files:', error);
            setErrorMessage('Failed to load files. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch files within a specific folder
    const fetchFilesInFolder = async (folderId) => {
        const token = localStorage.getItem('authToken');
        console.log("Fetching files for folder ID:", folderId);
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/folders/${folderId}/files`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFolderFiles(response.data);
            setView('folderContents');
            setErrorMessage('');
        } catch (error) {
            console.error('Error fetching files in folder:', error);
            setErrorMessage('Failed to fetch files. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle file selection for upload
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle file upload
    const handleFileUpload = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('file', file);

        if (selectedFolder) {
            formData.append('folderName', selectedFolder.name);
            formData.append('folderId', selectedFolder.id);
        } else {
            formData.append('folderId', 'root');
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setFileUrl(response.data.url);
            setErrorMessage('');

            // Refresh view after upload
            if (selectedFolder) {
                fetchFilesInFolder(selectedFolder.id);
            } else {
                fetchFolders();
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setErrorMessage('Failed to upload the file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Render file upload form
    const renderUploadForm = () => (
        <form onSubmit={handleFileUpload} className="space-y-4">
            <select
                value={selectedFolder ? selectedFolder.name : ''}
                onChange={(e) => {
                    const folder = folders.find(f => f.name === e.target.value);
                    setSelectedFolder(folder);
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
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        </form>
    );

    // Render create folder form
    const renderCreateFolderForm = () => (
        <CreateFolder onFolderCreated={fetchFolders} />
    );

    // Render list of folders
    const renderFoldersList = () => (
        <div className="folders-list space-y-4 mt-4">
            {folders.map((folder) => (
                <div key={folder.id} className="folder-item">
                    <Folder 
                        folder={folder} 
                        onFolderClick={() => {
                            setSelectedFolder(folder);
                            fetchFilesInFolder(folder.id);
                        }}
                        onRefresh={fetchFolders}
                    />
                </div>
            ))}
        </div>
    );

    // Render folder contents
    const renderFolderContents = () => (
        <div>
            <h2 className="text-xl font-bold mb-4">Files in {selectedFolder?.name}</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <UserFiles files={folderFiles} />
            <button
                onClick={() => setView('allFolders')}
                className="text-blue-500 underline mt-4"
            >
                Back to All Folders
            </button>
        </div>
    );

    // Render all files view with category filter
    const renderAllFilesView = () => (
        <div>
            <div className="mb-4">
                <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value)}
                    className="block w-full text-sm text-gray-500"
                >
                    <option value="">All Categories</option>
                    <option value="pdf">PDF</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="txt">TXT</option>
                    <option value="docx">DOCX</option>
                </select>
                <button
                    onClick={fetchAllFiles}
                    className="mt-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
                >
                    Filter Files
                </button>
            </div>

            <h2 className="text-xl font-bold mb-4">All Files</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <UserFiles files={allFiles} />
        </div>
    );

    console.log("Rendering contents for folder:", selectedFolder);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-4 text-center">File Storage</h1>

                <div className="flex justify-around mb-4">
                    <button onClick={() => setView('upload')} className="text-blue-500 underline">Upload File</button>
                    <button onClick={() => setView('createFolder')} className="text-blue-500 underline">Create Folder</button>
                    <button onClick={() => setView('allFolders')} className="text-blue-500 underline">All Folders</button>
                    <button onClick={fetchAllFiles} className="text-blue-500 underline">All Files</button>
                </div>

                <div className="mt-4">
                    {loading && <p>Loading...</p>}
                    {view === 'upload' && renderUploadForm()}
                    {view === 'createFolder' && renderCreateFolderForm()}
                    {view === 'allFolders' && renderFoldersList()}
                    {view === 'folderContents' && renderFolderContents()}
                    {view === 'allFiles' && renderAllFilesView()}
                </div>

                <button
                    onClick={onLogout}
                    className="w-full mt-4 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Home;
