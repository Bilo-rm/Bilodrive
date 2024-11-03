const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();
console.log('Environment Variables:', process.env);


const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON data

const upload = multer({ storage: multer.memoryStorage() });

// Initialize S3 client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Bucket Name:', process.env.AWS_BUCKET_NAME); 

    const params = {
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        //ACL: 'public-read',
    };
    

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${req.file.originalname}`;
        res.status(200).send({ url: fileUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
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
