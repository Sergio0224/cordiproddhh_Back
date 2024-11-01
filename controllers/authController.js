const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Registrar administrador
// @route   POST /api/auth/register-admin
// @access  Private (only for existing admins)
exports.registerAdmin = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Verificar si el usuario actual es admin
        if (req.user.role !== 'admin') {
            return next(new ErrorResponse('No autorizado para registrar administradores', 403));
        }

        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorResponse('El email ya está registrado', 400));
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'admin'
        });

        // No enviar token en respuesta de registro de admin
        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Listar administradores
// @route   GET /api/auth/admins
// @access  Private (only for existing admins)
exports.listAdmins = async (req, res, next) => {
    try {
        // Verificar si el usuario actual es admin
        if (req.user.role !== 'admin') {
            return next(new ErrorResponse('No autorizado para ver administradores', 403));
        }

        const admins = await User.find({ role: 'admin' }).select('name email createdAt');

        res.status(200).json({
            success: true,
            data: admins
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Eliminar administrador
// @route   DELETE /api/auth/admins/:id
// @access  Private (only for existing admins)
exports.deleteAdmin = async (req, res, next) => {
    try {
        // Verificar si el usuario actual es admin
        if (req.user.role !== 'admin') {
            return next(new ErrorResponse('No autorizado para eliminar administradores', 403));
        }

        // Prevenir que se elimine a sí mismo
        if (req.params.id === req.user._id.toString()) {
            return next(new ErrorResponse('No puede eliminarse a sí mismo', 400));
        }

        const admin = await User.findOneAndDelete({
            _id: req.params.id,
            role: 'admin'
        });

        if (!admin) {
            return next(new ErrorResponse('Administrador no encontrado', 404));
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};


// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorResponse('Por favor proporcione email y contraseña', 400));
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return next(new ErrorResponse('Credenciales inválidas', 401));
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return next(new ErrorResponse('Credenciales inválidas', 401));
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Cerrar sesión / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};

// Función helper para enviar token
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        });
};
