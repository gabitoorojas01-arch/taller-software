// ESCUDO DE SEGURIDAD: Si no hay una sesión activa en el navegador, lo expulsa al login
if (localStorage.getItem("sesionActiva") !== "true") {
    alert("⛔ Acceso denegado. Por favor, inicia sesión primero.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function() {
    cargarCitasDelTaller();
});

function cargarCitasDelTaller() {
    const tabla = document.getElementById("tablaCitas");

    fetch('http://localhost:3000/api/citas')
        .then(respuesta => respuesta.json())
        .then(listaCitas => {
            tabla.innerHTML = ""; 

            if (listaCitas.length === 0) {
                tabla.innerHTML = "<tr><td colspan='8' style='text-align:center;'>No hay citas agendadas en el sistema.</td></tr>";
                return;
            }

            listaCitas.forEach(cita => {
                const fechaLimpia = cita.fecha.split('T');
                const fila = document.createElement("tr");

                let claseBadge = "badge";
                if (cita.estado === "En Reparación") claseBadge = "badge-proceso";
                if (cita.estado === "Finalizado") claseBadge = "badge-finalizado";

                fila.innerHTML = `
                    <td>${cita.id}</td>
                    <td><strong>${cita.cliente}</strong></td>
                    <td>${cita.placa}</td>
                    <td>${cita.tipo}</td>
                    <td>${fechaLimpia}</td>
                    <td>${cita.motivo}</td>
                    <td><span class="${claseBadge}">${cita.estado}</span></td>
                    <td>
                        <select onchange="cambiarEstadoCita(${cita.id}, this.value)" style="padding: 5px; border-radius: 4px; background: #1e222b; color: white; border: 1px solid #4f5666;">
                            <option value="">Cambiar...</option>
                            <option value="Pendiente" ${cita.estado === 'Pendiente' ? 'disabled' : ''}>Pendiente</option>
                            <option value="En Reparación" ${cita.estado === 'En Reparación' ? 'disabled' : ''}>En Reparación</option>
                            <option value="Finalizado" ${cita.estado === 'Finalizado' ? 'disabled' : ''}>Finalizado</option>
                        </select>
                    </td>
                `;
                tabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error("Error al obtener las citas:", error);
            tabla.innerHTML = "<tr><td colspan='8' style='text-align:center; color:#ff4444;'>❌ Error al conectar con el servidor backend.</td></tr>";
        });
}

function cambiarEstadoCita(idCita, nuevoEstado) {
    if (!nuevoEstado) return;

    fetch('http://localhost:3000/api/citas/actualizar-estado', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: idCita, estado: nuevoEstado })
    })
    .then(respuesta => respuesta.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Estado actualizado con éxito a: ${nuevoEstado}`);
            cargarCitasDelTaller(); 
        }
    })
    .catch(error => {
        console.error("Error al actualizar el estado:", error);
        alert("❌ No se pudo actualizar el estado en el servidor.");
    });
}
// ESCUCHADOR PARA EL BOTÓN DE CERRAR SESIÓN
document.getElementById("btnCerrarSesion").addEventListener("click", function() {
    // Borramos el permiso de la memoria del navegador
    localStorage.removeItem("sesionActiva");
    
    alert("Sesión cerrada correctamente. Volviendo al login.");
    
    // Redireccionamos al inicio
    window.location.href = "login.html";
});
