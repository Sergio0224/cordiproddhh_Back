const Activity = require('../models/Activity');
const { uploadToCloudinary } = require('../config/cloudinary');

exports.createActivity = async (req, res) => {
    try {
        // Procesar archivos subidos
        const uploadedFiles = await Promise.all(
            req.files.map(async (file) => {
                const cloudinaryResult = await uploadToCloudinary(file);
                return {
                    url: cloudinaryResult.secure_url,
                    alt: file.originalname
                };
            })
        );

        // Crear actividad con URLs de Cloudinary
        const activityData = {
            ...req.body,
            images: uploadedFiles
        };

        const activity = await Activity.create(activityData);

        res.status(201).json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};


exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.find()
            .sort({ date: -1 }); // Ordenar por fecha descendente

        res.status(200).json({
            success: true,
            count: activities.length,
            data: activities
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Actividad no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Modificar similarmente updateActivity para manejar actualizaciones de archivos
exports.updateActivity = async (req, res) => {
    try {
        let uploadedFiles = [];

        // Si hay nuevos archivos, subirlos a Cloudinary
        if (req.files && req.files.length > 0) {
            uploadedFiles = await Promise.all(
                req.files.map(async (file) => {
                    const cloudinaryResult = await uploadToCloudinary(file);
                    return {
                        url: cloudinaryResult.secure_url,
                        alt: file.originalname
                    };
                })
            );
        }

        // Preparar datos de actualización
        const updateData = {
            ...req.body,
            images: uploadedFiles.length > 0 ? uploadedFiles : req.body.existingImages
        };

        const activity = await Activity.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Actividad no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: activity
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);

        if (!activity) {
            return res.status(404).json({
                success: false,
                error: 'Actividad no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};