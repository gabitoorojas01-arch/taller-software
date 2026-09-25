const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "taller_db",
  port: 3306,
});

db.connect(function (error) {
  if (error) {
    console.log("Error de conexion a la base de datos");
  } else {
    console.log("Conectado exitosamente a MySQL");
  }
});

app.post("/api/citas", function (req, res) {
  const datos = req.body;

  const query =
    "INSERT INTO citas (id, cliente, placa, tipo, fecha, motivo, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";

  const valores = [
    datos.id,
    datos.cliente,
    datos.placa,
    datos.tipo,
    datos.fecha,
    datos.motivo,
    datos.estado,
  ];

  db.query(query, valores, function (err, result) {
    if (err) {
      console.log("Error al insertar los datos");
      res.status(500).json({ success: false });
    } else {
      console.log("Datos guardados en MySQL con exito");
      res.status(201).json({ success: true, mensaje: "Guardado" });
    }
  });
});
// 3. ENDPOINT (GET) PARA OBTENER TODAS LAS CITAS (Para el Administrador)
app.get('/api/citas', function(req, res) {
    const query = "SELECT * FROM citas ORDER BY fecha ASC";

    db.query(query, function(error, resultados) {
        if (error) {
            console.log("Error al consultar MySQL para el administrador:", error);
            return res.status(500).json({ success: false, mensaje: "Error en la base de datos" });
        }
        
        // Devolvemos el arreglo completo de registros al panel del administrador
        res.status(200).json(resultados);
    });
});
// 4. ENDPOINT (PUT): ACTUALIZAR EL ESTADO DE UNA CITA EN LA BASE DE DATOS
app.post('/api/citas/actualizar-estado', function(req, res) { // Usamos POST para evitar problemas de compatibilidad locales
    const datos = req.body;
    
    // Comando SQL real para actualizar una columna específica basándose en el ID
    const query = "UPDATE citas SET estado = ? WHERE id = ?";
    
    db.query(query, [datos.estado, datos.id], function(error, resultado) {
        if (error) {
            console.log("Error al actualizar el estado en MySQL:", error);
            return res.status(500).json({ success: false, mensaje: "Error en la base de datos" });
        }
        
        console.log(`💾 Estado de la cita ${datos.id} actualizado a [${datos.estado}] en MySQL`);
        res.status(200).json({ success: true, mensaje: "Estado actualizado" });
    });
});
// 5. ENDPOINT (GET) FILTRADO: OBTENER HISTORIAL CLÍNICO POR PLACA ESPECÍFICA
app.get('/api/historial/:placa', function(req, res) {
    const placaBusqueda = req.params.placa.toUpperCase(); // Captura la placa de la URL
    
    // Consulta SQL con filtro WHERE para traer solo la hoja de vida de esa placa
    const query = "SELECT * FROM citas WHERE placa = ? ORDER BY fecha DESC";

    db.query(query, [placaBusqueda], function(error, resultados) {
        if (error) {
            console.log(`Error al consultar historial para la placa ${placaBusqueda}:`, error);
            return res.status(500).json({ success: false, mensaje: "Error en la base de datos" });
        }
        
        // Devolvemos el filtro de registros al buscador del frontend
        res.status(200).json(resultados);
    });
});

app.listen(3000, function () {
  console.log("Servidor activo en el puerto 3000");
});
