const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida']
    },
    date: {
        type: Date,
        required: [true, 'La fecha es requerida']
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: 'Imagen de actividad'
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Activity', activitySchema);