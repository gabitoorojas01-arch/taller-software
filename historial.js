document.getElementById("btnBuscar").addEventListener("click", function() {
    buscarHistorialPorPlaca();
});

// También permite buscar si el usuario presiona la tecla Enter
document.getElementById("inputPlaca").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        buscarHistorialPorPlaca();
    }
});

function buscarHistorialPorPlaca() {
    const placa = document.getElementById("inputPlaca").value.trim().toUpperCase();
    const contenedor = document.getElementById("resultadosHistorial");

    if (placa.length === 0) {
        alert("⚠️ Por favor, ingresa una placa para realizar la consulta.");
        return;
    }

    contenedor.innerHTML = "<p style='text-align:center; color:#ff6b00;'>🔍 Buscando registros en la base de datos...</p>";

    // Hacemos la consulta dinámica enviando la placa en la URL
    fetch(`http://localhost:3000/api/historial/${placa}`)
        .then(respuesta => respuesta.json())
        .then(registros => {
            contenedor.innerHTML = ""; // Limpiamos el mensaje de carga

            if (registros.length === 0) {
                contenedor.innerHTML = `<p style='text-align:center; color:#ff4444;'>❌ No se encontraron registros de mantenimiento para la placa <strong>${placa}</strong>.</p>`;
                return;
            }

            // Pintamos cada mantenimiento en una tarjeta detallada
            registros.forEach(registro => {
                const fechaLimpia = registro.fecha.split('T')[0];
                
                const tarjeta = document.createElement("div");
                tarjeta.className = "tarjeta-registro";
                tarjeta.innerHTML = `
                    <h4>
                        <span>👤 Cliente: ${registro.cliente}</span>
                        <span class="badge-estado">${registro.estado}</span>
                    </h4>
                    <p style="margin: 5px 0;"><span class="fecha-registro">📅 Fecha del servicio: ${fechaLimpia}</span> | 🚗 Tipo: ${registro.tipo}</p>
                    <p style="background: #282c34; padding: 10px; border-radius: 4px; margin-top: 8px; font-size: 14px; color: #e2e4e9;">
                        <strong>Diagnosis / Reporte técnico:</strong><br>${registro.motivo}
                    </p>
                `;
                contenedor.appendChild(tarjeta);
            });
        })
        .catch(error => {
            console.error("Error al consultar el historial:", error);
            contenedor.innerHTML = "<p style='text-align:center; color:#ff4444;'>❌ Error al conectar con el servidor backend.</p>";
        });
}
