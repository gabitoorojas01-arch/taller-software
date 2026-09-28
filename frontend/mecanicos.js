// ESCUDO DE SEGURIDAD
if (localStorage.getItem("sesionActiva") !== "true") {
    alert("⛔ Acceso denegado. Por favor, inicia sesión primero.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function() {
    listarMecanicosEnTabla();

    // Escuchador del formulario
    document.getElementById("formRegistrarMecanico").addEventListener("submit", function(e) {
        e.preventDefault();
        registrarNuevoMecanico();
    });
});

function listarMecanicosEnTabla() {
    const cuerpoTabla = document.getElementById("tablaMecanicosCuerpo");
    
    fetch('/api/mecanicos')
        .then(res => res.json())
        .then(mecanicos => {
            cuerpoTabla.innerHTML = "";
            if(mecanicos.length === 0) {
                cuerpoTabla.innerHTML = "<tr><td colspan='4' style='text-align:center;'>No hay técnicos registrados.</td></tr>";
                return;
            }

            mecanicos.forEach(meco => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${meco.id}</td>
                    <td><strong>${meco.nombre}</strong></td>
                    <td>${meco.especialidad}</td>
                    <td><span class="badge" style="background-color: #10b981 !important;">${meco.estado}</span></td>
                `;
                cuerpoTabla.appendChild(fila);
            });
        })
        .catch(err => console.error("Error al listar mecánicos:", err));
}

function registrarNuevoMecanico() {
    const nombre = document.getElementById("nombreMeco").value.trim();
    const especialidad = document.getElementById("especialidadMeco").value.trim();

    fetch('/api/mecanicos/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombre, especialidad: especialidad })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("✅ Técnico registrado exitosamente en la base de datos.");
            document.getElementById("formRegistrarMecanico").reset(); // Limpia el formulario
            listarMecanicosEnTabla(); // Refresca la tabla al instante
        }
    })
    .catch(err => {
        console.error("Error al registrar mecánico:", err);
        alert("❌ Error al guardar el técnico.");
    });
}
