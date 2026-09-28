// ESCUDO DE SEGURIDAD: Bloquea el acceso si el usuario no se ha autenticado
if (localStorage.getItem("sesionActiva") !== "true") {
    alert("⛔ Acceso denegado. Por favor, inicia sesión primero.");
    window.location.href = "login.html";
}

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
        controlarBotonImpresion(false); 
        return;
    }

    contenedor.innerHTML = "<p style='text-align:center; color:#ff6b00;'>🔍 Buscando registros en la base de datos...</p>";

    // Hacemos la consulta dinámica enviando la placa en la URL (Ruta Relativa)
    fetch(`/api/historial/${placa}`)
        .then(respuesta => respuesta.json())
        .then(registros => {
            contenedor.innerHTML = ""; // Limpiamos el mensaje de carga

            if (registros.length === 0) {
                contenedor.innerHTML = `<p style='text-align:center; color:#ff4444;'>❌ No se encontraron registros de mantenimiento para la placa <strong>${placa}</strong>.</p>`;
                controlarBotonImpresion(false); // Oculta el botón azul si la placa no existe en MySQL
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

            controlarBotonImpresion(true); // Muestra el botón azul si todo cargó con éxito
        })
        .catch(error => {
            console.error("Error al consultar el historial:", error);
            contenedor.innerHTML = "<p style='text-align:center; color:#ff4444;'>❌ Error al conectar con el servidor backend.</p>";
            controlarBotonImpresion(false); // Oculta el botón si falla la red
        });
}

// CONFIGURACIÓN DEL BOTÓN DE IMPRESIÓN
document.getElementById("btnImprimir").addEventListener("click", function() {
    window.print(); // Abre el asistente de impresión nativo de Windows/Chrome
});

// Función interna para controlar cuándo se muestra el botón
function controlarBotonImpresion(mostrar) {
    const btn = document.getElementById("btnImprimir");
    if (btn) {
        btn.style.display = mostrar ? "inline-block" : "none";
    }
}
