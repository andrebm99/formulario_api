require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2/promise');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger_output.json');

app.use(cors());
app.use(express.json());

app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerFile));

const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
});

app.get('/alumnos', async (req, res) => {
    try {
        const [rows] = await mysqlPool.query('SELECT id, nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion FROM alumnos ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({
            error: '¡Error al listar alumno!'
        });
    }
});

app.get('/alumnos/:id', async (req, res) => {
    try {
        const [rows] = await mysqlPool.query('SELECT id, nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion FROM alumnos WHERE id = ?', [req.params.id]);

        if (!rows.length) {
            return res.status(404).json({
                error: 'El usuario no existe existe!'
            });
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener usuario por ID'
        });
    }
});

app.post('/alumnos', async (req, res) => {
    try {
        const { nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion } = req.body;

        if (!nombres || !apellidos || !dni || !correo || !fecha_nacimiento) {
            return res.status(400).json({
                error: 'Debes llenar todos los campos requeridos!.'
            });
        }

        const [result] = await mysqlPool.query('INSERT INTO alumnos (nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion) VALUES (?, ?, ?, ?, ?, ?, ?)', [nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion]);

        const [rows] = await mysqlPool.query('SELECT id, nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion FROM alumnos WHERE id = ?', [result.insertId]);

        res.status(201).json(rows[0]);


    } catch (error) {
        res.status(500).json({
            error: 'Error al crear Usuario verefica los campos requeridos!'
        });
    }
});

app.put('/alumnos/:id', async (req, res) => {
    try {
        const { nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion } = req.body;

        const [result] = await mysqlPool.query('UPDATE alumnos SET nombres = COALESCE(?, nombres), apellidos = COALESCE(?, apellidos), dni = COALESCE(?, dni), correo = COALESCE(?, correo), telefono = COALESCE(?, telefono), fecha_nacimiento = COALESCE(?, fecha_nacimiento), direccion = COALESCE(?, direccion) WHERE id = ?', [nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion, req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'El alumno no existe!'
            });
        }
        const [rows] = await mysqlPool.query('SELECT nombres, apellidos, dni, correo, telefono, fecha_nacimiento, direccion FROM alumnos WHERE id = ?', [req.params.id]);

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar alumno. Vuelva a intentarlo.'
        });
    }
});


app.delete('/alumnos/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const [result] = await mysqlPool.query('DELETE FROM alumnos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'No existe'
            });
        }

        res.status(200).json({
            message: `Alumno con id "${id} eliminado exitosamente."`
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar alumno.'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`La API está escuchando en la url: http://localhost:${PORT}`));