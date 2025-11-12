// Configuración
let bitacoraData = [];
let currentPage = 1;
const itemsPerPage = 25;
let filteredData = [];
let currentFilters = {};

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarUsuarios();
    cargarBitacora();
    configurarEventos();
});

// Configurar eventos
function configurarEventos() {
    // Búsqueda en tiempo real
    document.getElementById('busquedaGlobal').addEventListener('input', function(e) {
        aplicarFiltros();
    });
    
    // Filtros por cambio
    document.getElementById('filtroAccion').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroModulo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtroTabla').addEventListener('input', aplicarFiltros);
    document.getElementById('filtroUsuario').addEventListener('change', aplicarFiltros);
    
    // Fechas
    document.getElementById('fechaInicio').addEventListener('change', aplicarFiltros);
    document.getElementById('fechaFin').addEventListener('change', aplicarFiltros);
    
    // Enter en búsqueda
    document.getElementById('busquedaGlobal').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            aplicarFiltros();
        }
    });
}

// Cargar lista de usuarios
function cargarUsuarios() {
    fetch('php/bitacora_controller.php?action=get_usuarios')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('filtroUsuario');
                data.usuarios.forEach(usuario => {
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = usuario.nombre;
                    select.appendChild(option);
                });
            }
        })
        .catch(error => {
            console.error('Error cargando usuarios:', error);
        });
}

// Cargar bitácora
function cargarBitacora() {
    mostrarLoading(true);
    
    fetch('php/bitacora_controller.php?action=get_bitacora')
        .then(response => response.json())
        .then(data => {
            mostrarLoading(false);
            
            if (data.success) {
                bitacoraData = data.bitacora;
                aplicarFiltros();
                actualizarEstadisticas();
            } else {
                mostrarError('Error al cargar la bitácora: ' + data.message);
            }
        })
        .catch(error => {
            mostrarLoading(false);
            mostrarError('Error de conexión: ' + error.message);
        });
}

// Aplicar filtros
function aplicarFiltros() {
    const busqueda = document.getElementById('busquedaGlobal').value.toLowerCase();
    const accion = document.getElementById('filtroAccion').value;
    const modulo = document.getElementById('filtroModulo').value;
    const tabla = document.getElementById('filtroTabla').value.toLowerCase();
    const usuario = document.getElementById('filtroUsuario').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;
    
    // Guardar filtros actuales
    currentFilters = {
        busqueda,
        accion,
        modulo,
        tabla,
        usuario,
        fechaInicio,
        fechaFin
    };
    
    filteredData = bitacoraData.filter(registro => {
        // Búsqueda global
        if (busqueda && !Object.values(registro).some(val => 
            val && val.toString().toLowerCase().includes(busqueda)
        )) {
            return false;
        }
        
        // Filtro por acción
        if (accion && registro.accion !== accion) {
            return false;
        }
        
        // Filtro por módulo
        if (modulo && registro.modulo !== modulo) {
            return false;
        }
        
        // Filtro por tabla
        if (tabla && (!registro.tabla_afectada || !registro.tabla_afectada.toLowerCase().includes(tabla))) {
            return false;
        }
        
        // Filtro por usuario
        if (usuario && registro.id_usuario != usuario) {
            return false;
        }
        
        // Filtro por fecha
        if (fechaInicio || fechaFin) {
            const fechaRegistro = new Date(registro.fecha_hora);
            
            if (fechaInicio) {
                const inicio = new Date(fechaInicio);
                if (fechaRegistro < inicio) return false;
            }
            
            if (fechaFin) {
                const fin = new Date(fechaFin);
                fin.setHours(23, 59, 59, 999); // Fin del día
                if (fechaRegistro > fin) return false;
            }
        }
        
        return true;
    });
    
    currentPage = 1;
    renderizarTabla();
    actualizarPaginacion();
}

// Renderizar tabla
function renderizarTabla() {
    const tbody = document.getElementById('cuerpoTablaBitacora');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">
                    <i class="fas fa-info-circle"></i>
                    No se encontraron registros que coincidan con los filtros
                </td>
            </tr>
        `;
        return;
    }
    
    pageData.forEach(registro => {
        const tr = document.createElement('tr');
        tr.onclick = () => mostrarDetalles(registro);
        
        tr.innerHTML = `
            <td>${formatearFecha(registro.fecha_hora)}</td>
            <td>${registro.nombre_usuario || 'Sistema'}</td>
            <td><span class="badge ${registro.accion}">${registro.accion}</span></td>
            <td class="descripcion-cell">${registro.descripcion || '-'}</td>
            <td>${registro.modulo || 'Sistema'}</td>
            <td>${registro.tabla_afectada || '-'}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Actualizar paginación
function actualizarPaginacion() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const paginaActual = document.getElementById('paginaActual');
    const registrosMostrados = document.getElementById('registrosMostrados');
    const totalRegistrosFooter = document.getElementById('totalRegistrosFooter');
    
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    
    registrosMostrados.textContent = `${startIndex}-${endIndex}`;
    totalRegistrosFooter.textContent = filteredData.length;
    paginaActual.textContent = currentPage;
    
    btnAnterior.disabled = currentPage === 1;
    btnSiguiente.disabled = currentPage === totalPages || totalPages === 0;
}

// Cambiar página
function cambiarPagina(direction) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderizarTabla();
        actualizarPaginacion();
    }
}

// Mostrar detalles del registro
function mostrarDetalles(registro) {
    document.getElementById('detalleFecha').textContent = formatearFecha(registro.fecha_hora, true);
    document.getElementById('detalleUsuario').textContent = registro.nombre_usuario || 'Sistema';
    document.getElementById('detalleAccion').textContent = registro.accion;
    document.getElementById('detalleAccion').className = `badge ${registro.accion}`;
    document.getElementById('detalleModulo').textContent = registro.modulo || 'Sistema';
    document.getElementById('detalleTabla').textContent = registro.tabla_afectada || '-';
    document.getElementById('detalleIdRegistro').textContent = registro.id_registro_afectado || '-';
    document.getElementById('detalleIp').textContent = registro.ip_address || '-';
    document.getElementById('detalleDescripcion').textContent = registro.descripcion || '-';
    document.getElementById('detalleUserAgent').textContent = registro.user_agent || '-';
    
    // Datos anteriores y nuevos (formatear JSON si es posible)
    try {
        const datosAnteriores = registro.datos_anteriores ? JSON.parse(registro.datos_anteriores) : null;
        const datosNuevos = registro.datos_nuevos ? JSON.parse(registro.datos_nuevos) : null;
        
        document.getElementById('detalleDatosAnteriores').textContent = 
            datosAnteriores ? JSON.stringify(datosAnteriores, null, 2) : '-';
        document.getElementById('detalleDatosNuevos').textContent = 
            datosNuevos ? JSON.stringify(datosNuevos, null, 2) : '-';
    } catch (e) {
        document.getElementById('detalleDatosAnteriores').textContent = registro.datos_anteriores || '-';
        document.getElementById('detalleDatosNuevos').textContent = registro.datos_nuevos || '-';
    }
    
    document.getElementById('modalDetalles').style.display = 'block';
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modalDetalles').style.display = 'none';
}

// Actualizar estadísticas
function actualizarEstadisticas() {
    const totalRegistros = document.getElementById('totalRegistros');
    const totalEliminaciones = document.getElementById('totalEliminaciones');
    const totalUsuariosActivos = document.getElementById('totalUsuariosActivos');
    const totalBackups = document.getElementById('totalBackups');
    
    totalRegistros.textContent = bitacoraData.length;
    
    // Contar eliminaciones
    const eliminaciones = bitacoraData.filter(r => r.accion === 'ELIMINAR').length;
    totalEliminaciones.textContent = eliminaciones;
    
    // Contar usuarios únicos activos (últimos 30 días)
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
    
    const usuariosActivos = new Set(
        bitacoraData
            .filter(r => new Date(r.fecha_hora) >= treintaDiasAtras && r.id_usuario)
            .map(r => r.id_usuario)
    ).size;
    
    totalUsuariosActivos.textContent = usuariosActivos;
    
    // Contar backups
    const backups = bitacoraData.filter(r => 
        r.accion.includes('BACKUP') || r.descripcion.includes('backup')
    ).length;
    totalBackups.textContent = backups;
}

// Exportar bitácora
function exportarBitacora() {
    const datosExportar = filteredData.length > 0 ? filteredData : bitacoraData;
    
    if (datosExportar.length === 0) {
        mostrarError('No hay datos para exportar');
        return;
    }
    
    // Crear CSV
    let csv = 'Fecha,Hora,Usuario,Accion,Descripcion,Modulo,Tabla,ID Registro,IP\n';
    
    datosExportar.forEach(registro => {
        const fecha = new Date(registro.fecha_hora);
        const fechaStr = fecha.toLocaleDateString();
        const horaStr = fecha.toLocaleTimeString();
        
        csv += `"${fechaStr}","${horaStr}","${registro.nombre_usuario || 'Sistema'}","${registro.accion}","${registro.descripcion || ''}","${registro.modulo || 'Sistema'}","${registro.tabla_afectada || ''}","${registro.id_registro_afectado || ''}","${registro.ip_address || ''}"\n`;
    });
    
    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bitacora_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Resetear filtros
function resetFilters() {
    document.getElementById('busquedaGlobal').value = '';
    document.getElementById('filtroAccion').value = '';
    document.getElementById('filtroModulo').value = '';
    document.getElementById('filtroTabla').value = '';
    document.getElementById('filtroUsuario').value = '';
    document.getElementById('fechaInicio').value = '';
    document.getElementById('fechaFin').value = '';
    
    aplicarFiltros();
}

// Recargar bitácora
function recargarBitacora() {
    cargarBitacora();
}

// Utilidades
function formatearFecha(fechaString, completo = false) {
    const fecha = new Date(fechaString);
    
    if (completo) {
        return fecha.toLocaleString('es-SV');
    }
    
    return fecha.toLocaleDateString('es-SV');
}

function mostrarLoading(mostrar) {
    document.getElementById('loadingOverlay').style.display = mostrar ? 'flex' : 'none';
}

function mostrarError(mensaje) {
    alert('Error: ' + mensaje);
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    const modal = document.getElementById('modalDetalles');
    if (event.target === modal) {
        cerrarModal();
    }
}

function irInicio() {
    window.location.href = "index.html";
}