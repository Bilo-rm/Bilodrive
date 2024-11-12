// server.js
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand   } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { verifyToken } = require('./controllers/authController'); // Import verifyToken
require('dotenv').config();

const { Pool } = require('pg'); // Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// server.js

app.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    const { folderName } = req.body; // Optional folder name from request body
    const { folderId } = req.body;
    const fileName = req.file.originalname; // Original file name
    const userId = req.user.id; // ID from authenticated user
 
    // Define S3 Key, adding folder structure if provided
    const fileKey = folderName ? `${folderName}/${fileName}` : fileName;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    try {
        // Upload file to S3
        const command = new PutObjectCommand(params);
        await s3.send(command);
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

        // Save file details in the database
        await pool.query(
            'INSERT INTO files (user_id, file_name, file_url, folder_name, folder_id) VALUES ($1, $2, $3, $4, $5)',
            [userId, fileName, fileUrl, folderName, folderId || null] // folderName set to null if empty
        );

        // Respond with success and file URL
        res.status(200).json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).json({ message: 'File upload failed' });
    }
    console.log("Received folderId:", folderId);

});


// Route to fetch user-specific files
app.get('/api/files', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT file_name, file_url FROM files WHERE user_id = $1',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching user files:', error);
        res.sendStatus(500);
    }
});

// Route to generate download URL
app.get('/api/files/download/:fileName', verifyToken, async (req, res) => {
    const fileName = req.params.fileName;

    // Create the parameters for the getObject command
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName
    };

    try {
        // Generate a signed URL for the file
        const command = new GetObjectCommand(params);
        const downloadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour
        res.json({ downloadUrl });
    } catch (error) {
        console.error('Error generating download URL:', error);
        res.status(500).send('Error generating download URL');
    }
});


// Route to delete a file by its name
app.delete('/api/files/:fileName', verifyToken, async (req, res) => {
    const fileName = req.params.fileName; // Get the file name from the request params

    try {
        // Create parameters for the deleteObject command
        const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
        };

        // Delete the file from S3
        const deleteCommand = new DeleteObjectCommand(deleteParams);
        await s3.send(deleteCommand);

        // Remove the file entry from the PostgreSQL database
        const userId = req.user.id; // Get the user ID from the request
        await pool.query(
            'DELETE FROM files WHERE file_name = $1 AND user_id = $2',
            [fileName, userId]
        );

        res.status(200).send('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Error deleting file');
    }
});


// server.js

app.post('/api/folders/create', verifyToken, async (req, res) => {
    const { folderName } = req.body;

    if (!folderName) {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO folders (name, created_by) VALUES ($1, $2) RETURNING *',
            [folderName, req.user.id] // Use authenticated user's ID
        );

        res.status(201).json({ message: 'Folder created successfully', folder: result.rows[0] });
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Failed to create folder' });
    }
});


app.get('/api/folders', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM folders WHERE created_by = $1',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.sendStatus(500);
    }
});

app.delete('/api/folders/:id', verifyToken, async (req, res) => {
    const folderId = req.params.id;
    const userId = req.user.id;
    
    try {
        // Delete folder from database
        await pool.query(
            'DELETE FROM folders WHERE id = $1 AND created_by = $2',
            [folderId, userId]
        );
        res.status(200).send('Folder deleted successfully');
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).send('Error deleting folder');
    }
});

app.get('/api/folders/:folderId/files', verifyToken, async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user.id;

    console.log(`Fetching files for folderId: ${folderId} and userId: ${userId}`);

    try {
        const result = await pool.query(
            'SELECT file_name, file_url FROM files WHERE folder_id = $1 AND user_id = $2',
            [folderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(200).json([]);  // Return an empty array for empty folders
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching files for folder:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});



// Authentication routes
app.use('/auth', authRoutes);
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.status(200).send('Logged out successfully.');
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
