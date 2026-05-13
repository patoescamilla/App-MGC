// Hola
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const reservationServices = [
    'asesoria-ecommerce',
    'asesoria-seguros-medicos',
    'asesoria-seguros-auto',
    'asesoria-seguros-vida',
    'asesoria-integral',
    'otra-reserva',
];

const reservationSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 80,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 120,
        },
        telefono: {
            type: String,
            trim: true,
            maxlength: 30,
            default: '',
        },
        servicio: {
            type: String,
            required: true,
            trim: true,
            enum: reservationServices,
        },
        fecha: {
            type: String,
            required: true,
            trim: true,
        },
        hora: {
            type: String,
            required: true,
            trim: true,
        },
        mensaje: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 1200,
        },
    },
    { timestamps: true }
);

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

app.get('/', (req, res) => {
    res.send('Millennium Global API - Backend Corriendo con Docker');
});

app.post('/api/reservas', async (req, res) => {
    try {
        const {
            nombre,
            email,
            telefono = '',
            servicio,
            fecha,
            hora,
            mensaje,
        } = req.body ?? {};

        const normalizedNombre = typeof nombre === 'string' ? nombre.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        const normalizedTelefono = typeof telefono === 'string' ? telefono.trim() : '';
        const normalizedServicio = typeof servicio === 'string' ? servicio.trim() : '';
        const normalizedFecha = typeof fecha === 'string' ? fecha.trim() : '';
        const normalizedHora = typeof hora === 'string' ? hora.trim() : '';
        const normalizedMensaje = typeof mensaje === 'string' ? mensaje.trim() : '';

        if (!normalizedNombre || !normalizedEmail || !normalizedServicio || !normalizedFecha || !normalizedHora || !normalizedMensaje) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados.' });
        }

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
        }

        if (!reservationServices.includes(normalizedServicio)) {
            return res.status(400).json({ error: 'El tipo de asesoría seleccionado no es válido.' });
        }

        if (!datePattern.test(normalizedFecha)) {
            return res.status(400).json({ error: 'La fecha de reserva no tiene un formato válido.' });
        }

        if (!timePattern.test(normalizedHora)) {
            return res.status(400).json({ error: 'La hora de reserva no tiene un formato válido.' });
        }

        const parsedDate = new Date(`${normalizedFecha}T00:00:00`);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (Number.isNaN(parsedDate.getTime()) || parsedDate < today) {
            return res.status(400).json({ error: 'La fecha de reserva debe ser hoy o una fecha futura.' });
        }

        const reservation = await Reservation.create({
            nombre: normalizedNombre,
            email: normalizedEmail,
            telefono: normalizedTelefono,
            servicio: normalizedServicio,
            fecha: normalizedFecha,
            hora: normalizedHora,
            mensaje: normalizedMensaje,
        });

        writeLog(`Reserva registrada con ID ${reservation._id}`);

        return res.status(201).json({
            message: 'Tu reserva fue enviada correctamente.',
            id: reservation._id,
        });
    } catch (error) {
        writeLog(`Error al guardar reserva: ${error.message}`, 'ERROR');
        return res.status(500).json({ error: 'No se pudo guardar la reserva. Intenta nuevamente.' });
    }
});

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const writeLog = (message, type = "INFO") => {
    const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
    const logEntry = `[${timestamp}] ${type}: ${message}\n`;
    fs.appendFileSync(path.join(logDir, 'app.log'), logEntry);
    console.log(logEntry);
};

// CONEXIÓN

app.get('/api/reservas', async (req, res) => {
    try {
        const reservas = await Reservation.find().sort({ createdAt: -1 });
        writeLog('Panel intranet consultó las reservas');
        res.json(reservas);
    } catch (error) {
        writeLog(`Error al consultar reservas: ${error.message}`, 'ERROR');
        res.status(500).json({ error: 'No se pudieron obtener las reservas.' });
    }
});

app.delete('/api/reservas/:id', async (req, res) => {
    try {
        await Reservation.findByIdAndDelete(req.params.id);

        writeLog(`Reserva eliminada: ${req.params.id}`);

        res.json({
            success: true,
            message: 'Reserva eliminada correctamente'
        });

    } catch (error) {
        writeLog(`Error eliminando reserva: ${error.message}`, 'ERROR');

        res.status(500).json({
            success: false,
            error: 'No se pudo eliminar la reserva'
        });
    }
});

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => writeLog("Conexión exitosa a MongoDB"))
    .catch(err => writeLog("Fallo en conexión: " + err.message, "ERROR"));

app.listen(process.env.PORT || 3000, () => {
    writeLog("Servidor iniciado");
});