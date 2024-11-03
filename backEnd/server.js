// server.js
const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

app.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    console.log('Bucket Name:', process.env.S3_BUCKET_NAME);

    const params = {
        Bucket: process.env.S3_BUCKET_NAME, // Use the correct variable
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read',
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${req.file.originalname}`;

        // Store file metadata in the database with user ID
        const userId = req.user.id; // `req.user.id` set by `verifyToken` middleware
        await pool.query(
            'INSERT INTO files (user_id, file_name, file_url) VALUES ($1, $2, $3)',
            [userId, req.file.originalname, fileUrl]
        );

        res.status(200).send({ url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
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
