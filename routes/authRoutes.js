const express = require('express');
const router = express.Router();
const {
    login,
    getMe,
    logout,
    registerAdmin,
    listAdmins,
    deleteAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);

// Rutas de administración de administradores
router.post('/register-admin', protect, registerAdmin);
router.get('/admins', protect, listAdmins);
router.delete('/admins/:id', protect, deleteAdmin);

module.exports = router;