import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            setUploadStatus('Please select a file to upload.');
            return;
        }

        try {
            // Get the signed URL from the server
            const response = await axios.get('http://localhost:5000/s3Url', {
                params: {
                    filename: selectedFile.name,
                },
            });

            const { url } = response.data;

            // Now upload the file directly to S3 using the signed URL
            await axios.put(url, selectedFile, {
                headers: {
                    'Content-Type': selectedFile.type, // Set the correct content type
                },
            });

            setUploadStatus('File uploaded successfully!');
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Failed to upload file.');
        }
    };

    return (
        <div>
            <h1>Upload File to S3</h1>
            <form onSubmit={handleFileUpload}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Upload</button>
            </form>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
};

export default FileUpload;
