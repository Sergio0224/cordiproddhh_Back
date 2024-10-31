const express = require('express');
const router = express.Router();
const {
    createActivity,
    getActivities,
    getActivity,
    updateActivity,
    deleteActivity
} = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Ruta pública
router.get('/', getActivities);

// Ruta protegida para crear actividades
router.post('/',
    protect,
    authorize('admin'),
    upload.array('images', 5), // Permite hasta 5 archivos
    createActivity
);

// Ruta con GET público, PUT y DELETE protegidos
router.route('/:id')
    .get(getActivity) // Ruta pública para obtener actividad
    .put(
        protect,
        authorize('admin'),
        upload.array('images', 5), // Permite hasta 5 archivos
        updateActivity
    )
    .delete(protect, authorize('admin'), deleteActivity);

module.exports = router;