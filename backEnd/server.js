const express = require('express');
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const cors = require('cors');
require('dotenv').config();
console.log('Environment Variables:', process.env);


const app = express();
app.use(cors());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
