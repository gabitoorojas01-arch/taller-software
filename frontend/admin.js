// ESCUDO DE SEGURIDAD: Si no hay una sesión activa en el navegador, lo expulsa al login
if (localStorage.getItem("sesionActiva") !== "true") {
    alert("⛔ Acceso denegado. Por favor, inicia sesión primero.");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function() {
    // Al cargar la página, configuramos el botón de salir e iniciamos la carga de datos
    configurarBotonSalir();
    cargarCitasYFuncionamiento();
    actualizarDashboardEstadisticas(); // Carga los números grandes al iniciar
});

function configurarBotonSalir() {
    const btnCerrar = document.getElementById("btnCerrarSesion");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", function() {
            localStorage.removeItem("sesionActiva");
            alert("Sesión cerrada correctamente. Volviendo al login.");
            window.location.href = "login.html";
        });
    }
}

function cargarCitasYFuncionamiento() {
    const tabla = document.getElementById("tablaCitas");

    // 1. SOLICITAMOS LA LISTA DE MECÁNICOS ACTIVOS AL BACKEND (Ruta Relativa)
    fetch('/api/mecanicos')
        .then(res => res.json())
        .then(listaMecanicos => {
            
            // 2. SOLICITAMOS LA LISTA DE CITAS DE MYSQL (Ruta Relativa)
            fetch('/api/citas')
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

                        // Manejo estético de los badges según el estado
                        let claseBadge = "badge";
                        if (cita.estado === "En Reparación") claseBadge = "badge-proceso";
                        if (cita.estado === "Finalizado") claseBadge = "badge-finalizado";

                        // Construimos las opciones del selector de mecánicos dinámicamente
                        let opcionesMecanicos = `<option value="">Sin Asignar...</option>`;
                        listaMecanicos.forEach(meco => {
                            const seleccionado = cita.mecanico_id === meco.id ? 'selected' : '';
                            opcionesMecanicos += `<option value="${meco.id}" ${seleccionado}>${meco.nombre}</option>`;
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
                                <select onchange="asignarMecanicoACita(${cita.id}, this.value)" style="padding: 5px; border-radius: 4px; background: #1e222b; color: white; border: 1px solid #4f5666; max-width: 180px;">
                                    ${opcionesMecanicos}
                                </select>
                            </td>
                            <td>
                                <!-- Selector de Cambio de Estado -->
                                <select onchange="cambiarEstadoCita(${cita.id}, this.value)" style="padding: 5px; border-radius: 4px; background: #1e222b; color: white; border: 1px solid #4f5666; margin-right: 5px;">
                                    <option value="">Cambiar...</option>
                                    <option value="Pendiente" ${cita.estado === 'Pendiente' ? 'disabled' : ''}>Pendiente</option>
                                    <option value="En Reparación" ${cita.estado === 'En Reparación' ? 'disabled' : ''}>En Reparación</option>
                                    <option value="Finalizado" ${cita.estado === 'Finalizado' ? 'disabled' : ''}>Finalizado</option>
                                </select>

                                <!-- BOTÓN DE ELIMINAR CITA -->
                                <button onclick="eliminarCitaDelTaller(${cita.id})" style="width: auto; padding: 6px 10px; background-color: #ff4444; border: none; border-radius: 4px; color: white; cursor: pointer; font-weight: bold;">🗑️</button>
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

// FUNCIÓN PARA TRAER LOS NÚMEROS DEL DASHBOARD EN TIEMPO REAL
function actualizarDashboardEstadisticas() {
    fetch('/api/citas/estadisticas')
        .then(res => res.json())
        .then(data => {
            document.getElementById("cntTotal").innerText = data.total;
            document.getElementById("cntProceso").innerText = data.proceso;
            document.getElementById("cntFinalizado").innerText = data.finalizado;
        })
        .catch(err => console.error("Error al cargar estadísticas:", err));
}

// FUNCIÓN PARA GUARDAR LA ASIGNACIÓN DE TÉCNICOS EN MYSQL
function asignarMecanicoACita(idCita, idMecanico) {
    if (!idMecanico) return;

    fetch('/api/citas/asignar-mecanico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCita: idCita, idMecanico: idMecanico })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("👨‍🔧 Técnico asignado correctamente al vehículo.");
            cargarCitasYFuncionamiento(); 
            actualizarDashboardEstadisticas(); // Refresca los contadores en vivo
        }
    })
    .catch(err => console.error("Error al asignar técnico:", err));
}

// FUNCIÓN PARA CAMBIAR EL ESTADO DE LA CITA EN MYSQL
function cambiarEstadoCita(idCita, nuevoEstado) {
    if (!nuevoEstado) return;

    fetch('/api/citas/actualizar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idCita, estado: nuevoEstado })
    })
    .then(respuesta => respuesta.json())
    .then(data => {
        if (data.success) {
            alert(`✅ Estado actualizado con éxito a: ${nuevoEstado}`);
            cargarCitasYFuncionamiento(); 
            actualizarDashboardEstadisticas(); // Refresca los contadores en vivo
        }
    })
    .catch(error => console.error("Error al actualizar el estado:", error));
}

// FUNCIÓN PARA ELIMINAR UNA CITA DE LA BASE DE DATOS
function eliminarCitaDelTaller(idCita) {
    if (!confirm("⚠️ ¿Estás seguro de que deseas cancelar y eliminar permanentemente esta cita del sistema?")) {
        return; 
    }

    fetch('/api/citas/eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idCita })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("🗑️ Cita eliminada correctamente del sistema.");
            cargarCitasYFuncionamiento(); 
            actualizarDashboardEstadisticas(); // Refresca los contadores en vivo
        }
    })
    .catch(err => {
        console.error("Error al eliminar la cita:", err);
        alert("❌ No se pudo eliminar la cita.");
    });
}
