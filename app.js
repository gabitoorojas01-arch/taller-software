// Interceptamos el formulario usando su ID
const formulario = document.getElementById('formCita');

formulario.addEventListener('submit', function(event) {
    // Evitamos que la página se recargue sola
    event.preventDefault();

    // Capturamos la información digitada por el usuario
    const nombreCliente = document.getElementById('nombre').value.trim();
    const placaVehiculo = document.getElementById('placa').value.trim().toUpperCase();
    const tipoVehiculo  = document.getElementById('tipoVehiculo').value;
    const fechaCita     = document.getElementById('fecha').value;
    const motivoCita    = document.getElementById('motivo').value.trim();

    // Creamos el objeto con la estructura que espera la Base de Datos
    const nuevaCita = {
        id: Date.now(), // Genera un identificador único numérico
        cliente: nombreCliente,
        placa: placaVehiculo,
        tipo: tipoVehiculo,
        fecha: fechaCita,
        motivo: motivoCita,
        estado: "Pendiente"
    };

    console.log("Enviando los siguientes datos al servidor...", nuevaCita);

    // ==========================================================================
    // ENVIAR DATOS AL SERVIDOR BACKEND (MÉTODO FETCH)
    // ==========================================================================
    fetch('http://localhost:3000/api/citas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaCita) // Convertimos el objeto en texto seguro
    })
    .then(respuesta => respuesta.json())
    .then(resultadoBackend => {
        console.log("Respuesta recibida del backend:", resultadoBackend);
        alert("¡Éxito! Tu turno ha sido guardado permanentemente en el sistema.");
        formulario.reset(); // Limpiamos el formulario para una nueva cita
    })
    .catch(errorConexion => {
        console.error("Error conectando con el backend:", errorConexion);
        alert("❌ Error: No se pudo conectar con el servidor backend. Revisa que la terminal esté encendida.");
    });
});
