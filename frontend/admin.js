document.addEventListener("DOMContentLoaded", function() {
    // Al cargar la página, primero traemos los mecánicos y luego las citas
    cargarCitasYFuncionamiento();
});

function cargarCitasYFuncionamiento() {
    const tabla = document.getElementById("tablaCitas");

    // 1. SOLICITAMOS LA LISTA DE MECÁNICOS ACTIVOS AL BACKEND
    fetch('http://localhost:3000/api/mecanicos')
        .then(res => res.json())
        .then(listaMecanicos => {
            
            // 2. SOLICITAMOS LA LISTA DE CITAS
            fetch('http://localhost:3000/api/citas')
                .then(res => res.json())
                .then(listaCitas => {
                    tabla.innerHTML = ""; 

                    if (listaCitas.length === 0) {
                        tabla.innerHTML = "<tr><td colspan='9' style='text-align:center;'>No hay citas agendadas en el sistema.</td></tr>";
                        return;
                    }

                    listaCitas.forEach(cita => {
                        const fechaLimpia = cita.fecha.split('T')[0];
                        const fila = document.createElement("tr");

                        let claseBadge = "badge";
                        if (cita.estado === "En Reparación") claseBadge = "badge-proceso";
                        if (cita.estado === "Finalizado") claseBadge = "badge-finalizado";

                        // Construimos las opciones del selector de mecánicos dinámicamente
                        let opcionesMecanicos = `<option value="">Sin Asignar...</option>`;
                        listaMecanicos.forEach(meco => {
                            // Si esta cita ya tiene asignado este mecánico en MySQL, lo dejamos seleccionado
                            const seleccionado = cita.mecanico_id === meco.id ? 'selected' : '';
                            opcionesMecanicos += `<option value="${meco.id}" ${seleccionado}>${meco.nombre} (${meco.especialidad})</option>`;
                        });

                        fila.innerHTML = `
                            <td>${cita.id}</td>
                            <td><strong>${cita.cliente}</strong></td>
                            <td>${cita.placa}</td>
                            <td>${cita.tipo}</td>
                            <td>${fechaLimpia}</td>
                            <td>${cita.motivo}</td>
                            <td><span class="${claseBadge}">${cita.estado}</span></td>
                            <td>
                                <!-- Selector dinámico de Mecánicos -->
                                <select onchange="asignarMecanicoACita(${cita.id}, this.value)" style="padding: 5px; border-radius: 4px; background: #1e222b; color: white; border: 1px solid #4f5666; max-width: 180px;">
                                    ${opcionesMecanicos}
                                </select>
                            </td>
                            <td>
                                <!-- Selector de Cambio de Estado -->
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
                });
        })
        .catch(error => {
            console.error("Error en el sistema de administración:", error);
            tabla.innerHTML = "<tr><td colspan='9' style='text-align:center; color:#ff4444;'>❌ Error al conectar con el servidor backend.</td></tr>";
        });
}

// FUNCIÓN PARA GUARDAR LA ASIGNACIÓN EN MYSQL
function asignarMecanicoACita(idCita, idMecanico) {
    if (!idMecanico) return;

    fetch('http://localhost:3000/api/citas/asignar-mecanico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCita: idCita, idMecanico: idMecanico })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("👨‍🔧 Técnico asignado correctamente al vehículo.");
            cargarCitasYFuncionamiento(); // Recargamos para refrescar el estado
        }
    })
    .catch(err => console.error("Error al asignar técnico:", err));
}

// FUNCIÓN PARA CAMBIAR EL ESTADO DE LA CITA
function cambiarEstadoCita(idCita, nuevoEstado) {
    if (!nuevoEstado) return;

    fetch('http://localhost:3000/api/citas/actualizar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idCita, estado: nuevoEstado })
    })
    .then(respuesta => respuesta.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Estado actualizado con éxito a: ${nuevoEstado}`);
            cargarCitasYFuncionamiento(); 
        }
    })
    .catch(error => console.error("Error al actualizar el estado:", error));
}
