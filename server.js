require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();

// Permite recibir JSON
app.use(express.json());

//Archivos HTML, CSS y JS 
app.use(express.static('public'));

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   ssl: process.env.DATABASE_URL? {
                        rejectUnauthorized: false
                    }: false
});


//===============================
// CONSULTAR MASCOTAS
//===============================


app.get('/api/devuelva_todo_propietario', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT * FROM PROPIETARIO'
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
});


app.get('/api/listaPublicaciones', async (req, res) => {
    try {
        const resultado = await pool.query(
           `SELECT
                pub.imagen,
                pub.descripcion as descripcion_publicidad,
                pub.recompensa,
                pub.fecha,
                prop.nombre as nombre_propietario,
                prop.telefono,
                masc.nombre as nombre_mascota,
                masc.descripcion as descripcion_mascota,
                raza.descripcion as descripcion_raza 
            FROM publicidad pub
            INNER JOIN propietario prop ON pub.id_propietario = prop.id
            INNER JOIN mascota masc ON pub.id_mascota = masc.id
            INNER JOIN raza raza ON masc.cod_raza = raza.cod;`
            );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: error.message
        });
    }
});
app.get('/api/razas', async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT cod, descripcion FROM raza'
        );
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/registro-publicidad', async (req, res) => {
    const { 
        propietarioNombre,
        propietarioTelefono, 
        mascotaNombre,
        mascotaDescripcion,
        razaCode, 
        publicidadDescripcion, 
        recompensa, 
        fecha, 
        imagen } = req.body;

    const faltanDatos = !propietarioNombre || !propietarioTelefono ||
        !mascotaNombre || !mascotaDescripcion || !razaCode ||
        !publicidadDescripcion || !fecha || !imagen;

    if (faltanDatos) {
        return res.status(400).json({ error: 'Complete todos los campos y seleccione una imagen.' });
    }

    const imagenBinaria = Buffer.from(imagen, 'base64');
    const conexion = await pool.connect();
    
    try {
        await conexion.query('BEGIN');

        const resultadoPropietario = await conexion.query(
            `INSERT INTO propietario (nombre, telefono) VALUES ($1, $2) RETURNING id`,
            [propietarioNombre, propietarioTelefono]
        );
        const resultadoMascota = await conexion.query(
            `INSERT INTO mascota (nombre, descripcion, cod_raza) VALUES ($1,$2,$3) RETURNING id`,
            [mascotaNombre, mascotaDescripcion, razaCode]
        );
        await conexion.query(
            `INSERT INTO publicidad (id_propietario, id_mascota, imagen, descripcion, recompensa, fecha)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                resultadoPropietario.rows[0].id,
                resultadoMascota.rows[0].id,
                imagenBinaria,
                publicidadDescripcion,
                recompensa || null,
                fecha
            ]
        );

        await conexion.query('COMMIT');
        res.status(201).json({ mensaje: 'Registro creado correctamente.' });
    } catch (error) {
        await conexion.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        conexion.release();
    }
});




app.listen(process.env.PORT || 3000, () => {
    console.log('servidor iniciado en http://localhost:' + (process.env.PORT || 3000));
});