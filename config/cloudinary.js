const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración de Multer para manejar la carga de archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // Aumentar a 50MB por ejemplo
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/mpeg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
});

// Función para subir archivo a Cloudinary
const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'activities', // Carpeta donde se guardarán los archivos
                resource_type: file.mimetype.startsWith('video') ? 'video' : 'image'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        // Convertir buffer a stream para Cloudinary
        const bufferStream = require('stream').Readable.from(file.buffer);
        bufferStream.pipe(uploadStream);
    });
};

module.exports = {
    cloudinary,
    upload,
    uploadToCloudinary
};