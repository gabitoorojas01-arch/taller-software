document.getElementById("formLogin").addEventListener("submit", function(event) {
    // Evitamos que la página se refresque sola
    event.preventDefault();

    const usuarioIngresado = document.getElementById("usuario").value.trim();
    const contrasenaIngresada = document.getElementById("contrasena").value.trim();
    const alertaError = document.getElementById("mensajeError");

    // REGLA DE SEGURIDAD INICIAL (Credenciales de acceso para el taller)
    const usuarioValido = "adminTaller";
    const contrasenaValida = "SenaADSO2026";

    if (usuarioIngresado === usuarioValido && contrasenaIngresada === contrasenaValida) {
        alertaError.style.display = "none";
        
        // Guardamos una marca temporal en la memoria del navegador para saber que ya inició sesión
        localStorage.setItem("sesionActiva", "true");
        
        alert("🔑 Acceso autorizado. Bienvenido al panel de control.");
        
        // Redireccionamos automáticamente al Panel del Administrador
        window.location.href = "admin.html";
    } else {
        // Si los datos están mal, mostramos el recuadro rojo de alerta
        alertaError.style.display = "block";
        document.getElementById("contrasena").value = ""; // Limpiamos la clave por seguridad
    }
});
