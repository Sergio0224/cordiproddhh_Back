const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Sanitización de datos
app.use(mongoSanitize());

// Configurar headers de seguridad
app.use(helmet());

// Prevenir XSS attacks
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 100
});
app.use(limiter);

// Prevenir http param pollution
app.use(hpp());

// Habilitar CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

// Montar rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Manejo de errores no controlados
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Cerrar servidor y salir del proceso
    server.close(() => process.exit(1));
});