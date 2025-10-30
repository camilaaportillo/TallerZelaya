// js/inventario.js - Versión adaptada al estilo anterior
let repuestosData = [];
let repuestoSeleccionado = null;
let filtrosActivos = {};
let ultimoPrecioCompra = null;
let precioCompraFecha = null;



// Elementos del DOM
const modalEditarPrecio = document.getElementById("modalEditarPrecio");
const formEditarPrecio = document.getElementById("formEditarPrecio");
const cuerpoTablaRepuestos = document.getElementById("cuerpoTablaRepuestos");
const inputBuscar = document.getElementById("buscarRepuesto");
const filtroMarca = document.getElementById("filtroMarca");
const filtroStock = document.getElementById("filtroStock");
const filtroPrecio = document.getElementById("filtroPrecio");

// Modal de mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function() {
    if (window.verificarSesion && !window.verificarSesion()) {
        return;
    }
    
    inicializarInventario();
    document.body.style.visibility = 'visible';
});

async function inicializarInventario() {
    try {
        mostrarMensaje('advertencia', 'Cargando', 'Cargando datos del inventario...', 2000);
        
        // Cargar datos iniciales
        await cargarDatosIniciales();
        await cargarRepuestos();
        
        configurarEventos();
        calcularEstadisticas();
        mostrarAlertas();
        
    } catch (error) {
        console.error('Error inicializando inventario:', error);
        mostrarMensaje('error', 'Error', 'No se pudo inicializar el inventario');
    }
}

async function cargarDatosIniciales() {
    try {
        const [marcasResp, medidasResp, proveedoresResp] = await Promise.all([
            fetch('php/obtenerMarcas.php'),
            fetch('php/obtenerMedidas.php'),
            fetch('php/obtenerProveedores.php')
        ]);

        const marcas = await marcasResp.json();
        const medidas = await medidasResp.json();
        const proveedores = await proveedoresResp.json();

        llenarFiltroMarcas(marcas);
        
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        throw error;
    }
}

function llenarFiltroMarcas(marcas) {
    filtroMarca.innerHTML = '<option value="">Todas las marcas</option>';
    
    marcas.forEach(marca => {
        if (marca.estado === 'Activo') {
            const option = document.createElement('option');
            option.value = marca.id_marca;
            option.textContent = marca.nombre;
            filtroMarca.appendChild(option);
        }
    });
}

function configurarEventos() {
    // Búsqueda y filtros
    inputBuscar.addEventListener("input", aplicarFiltros);
    filtroMarca.addEventListener("change", aplicarFiltros);
    filtroStock.addEventListener("change", aplicarFiltros);
    filtroPrecio.addEventListener("change", aplicarFiltros);

    // Formulario editar precio
    formEditarPrecio.addEventListener("submit", guardarPrecio);

    // Validación en tiempo real del precio
    document.getElementById('nuevo_precio_venta').addEventListener('input', validarPrecioEnTiempoReal);

    // Cerrar modal al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (modalEditarPrecio.style.display === 'flex' && 
            !e.target.closest('.modal-contenido') && 
            !e.target.classList.contains('btn-editar-precio')) {
            cerrarModalEditarPrecio();
        }
    });
}

function validarPrecioEnTiempoReal() {
    const precioInput = document.getElementById('nuevo_precio_venta');
    const alertaPrecioCero = document.getElementById('alertaPrecioCero');
    const alertaPrecioInferior = document.getElementById('alertaPrecioInferior');
    const precio = parseFloat(precioInput.value);

    // Resetear estilos
    precioInput.style.borderColor = '#0026ff';
    alertaPrecioCero.style.display = 'none';
    alertaPrecioInferior.style.display = 'none';

    if (precio === 0) {
        alertaPrecioCero.style.display = 'block';
        precioInput.style.borderColor = '#dc3545';
    } else if (ultimoPrecioCompra && precio < ultimoPrecioCompra) {
        // Mostrar advertencia si el precio es inferior al de compra
        alertaPrecioInferior.style.display = 'block';
        precioInput.style.borderColor = '#ffc107';
    }
}

async function cargarRepuestos() {
    try {
        console.log('Cargando repuestos con filtros:', filtrosActivos);
        
        const respuesta = await fetch('php/obtenerRepuestos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filtrosActivos)
        });
        
        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }
        
        const datos = await respuesta.json();
        
        if (datos.error) {
            throw new Error(datos.error);
        }
        
        if (!Array.isArray(datos)) {
            throw new Error('La respuesta no es un array válido');
        }
        
        // Convertir IDs a números
        repuestosData = datos.map(repuesto => ({
            ...repuesto,
            id_repuesto: parseInt(repuesto.id_repuesto)
        }));
        
        mostrarRepuestosEnTabla();
        
        if (Object.keys(filtrosActivos).length === 0) {
            mostrarMensaje('exito', 'Inventario Cargado', `Se cargaron ${datos.length} repuestos correctamente`, 3000);
        }
        
    } catch (error) {
        console.error('Error cargando repuestos:', error);
        mostrarMensaje('error', 'Error', `No se pudieron cargar los repuestos: ${error.message}`);
    }
}

function mostrarRepuestosEnTabla() {
    cuerpoTablaRepuestos.innerHTML = "";
    
    if (repuestosData.length === 0) {
        cuerpoTablaRepuestos.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #666;">
                    <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
                    No se encontraron repuestos con los filtros aplicados
                </td>
            </tr>
        `;
        return;
    }
    
    repuestosData.forEach(repuesto => {
        const fila = document.createElement("tr");
        
        // NUEVA LÓGICA: Determinar clase de stock
        let stockClass = '';
        let badgeClass = 'badge-secondary';
        
        if (repuesto.stock_actual === 0) {
            // Stock crítico: solo cuando es 0
            stockClass = 'stock-cero';
            badgeClass = 'badge-danger';
        } else if (repuesto.stock_actual <= repuesto.stock_minimo) {
            // Stock bajo: cuando es igual o menor al mínimo
            stockClass = 'stock-bajo';
            badgeClass = 'badge-warning';
        } else {
            // Stock normal: cuando es mayor al mínimo
            badgeClass = 'badge-success';
        }

        // Determinar clase de precio
        const precio = parseFloat(repuesto.precio);
        const tienePrecioValido = precio > 0;
        const precioClass = tienePrecioValido ? 'precio-normal' : 'precio-problema';
        const precioDisplay = tienePrecioValido ? `$${precio.toFixed(2)}` : '<span style="color: #dc3545;">$0.00</span>';
        
        fila.className = `${stockClass} ${!tienePrecioValido ? 'precio-cero' : ''}`;
        
        fila.innerHTML = `
            <td><strong>${repuesto.codigo}</strong></td>
            <td style="text-align: left;">${repuesto.nombre}</td>
            <td>${repuesto.marca}</td>
            <td>${repuesto.medida}</td>
            <td>
                <span class="badge ${badgeClass}">
                    ${repuesto.stock_actual}
                </span>
            </td>
            <td>${repuesto.stock_minimo}</td>
            <td class="${precioClass}">
                <span class="precio-valor">${precioDisplay}</span>
            </td>
            <td class="acciones">
                <button class="btn-editar-precio" data-id="${repuesto.id_repuesto}" title="Editar Precio de Venta">
                    💰
                </button>
            </td>
        `;

        // Agregar event listener al botón de editar
        const btnEditar = fila.querySelector('.btn-editar-precio');
        btnEditar.addEventListener('click', () => {
            abrirModalEditarPrecio(repuesto.id_repuesto);
        });

        cuerpoTablaRepuestos.appendChild(fila);
    });
}

async function abrirModalEditarPrecio(idRepuesto) {
    console.log('✏️ Editando precio para repuesto ID:', idRepuesto);
    
    const repuesto = repuestosData.find(r => r.id_repuesto === parseInt(idRepuesto));
    
    if (!repuesto) {
        console.error('❌ Repuesto no encontrado en la lista local.');
        mostrarMensaje('error', 'Error', `Repuesto con ID ${idRepuesto} no encontrado`);
        return;
    }

    console.log('✅ Repuesto encontrado:', repuesto);
    repuestoSeleccionado = repuesto;

    // Llenar modal con datos del repuesto
    document.getElementById('precio_id_repuesto').value = repuesto.id_repuesto;
    document.getElementById('precio_nombre_repuesto').textContent = repuesto.nombre;
    document.getElementById('precio_codigo_repuesto').textContent = repuesto.codigo;
    
    const precioActual = parseFloat(repuesto.precio) || 0;
    document.getElementById('precio_actual_repuesto').textContent = 
        precioActual > 0 ? `$${precioActual.toFixed(2)}` : '$0.00 (Sin precio)';
    
    document.getElementById('nuevo_precio_venta').value = precioActual > 0 ? precioActual : '';
    document.getElementById('alertaPrecioCero').style.display = 'none';
    document.getElementById('alertaPrecioInferior').style.display = 'none';

    // OBTENER ÚLTIMO PRECIO DE COMPRA - CON MÁS ROBUSTEZ
    try {
        console.log('📡 Solicitando último precio de compra...');
        
        const respuesta = await fetch(`php/obtenerUltimoPrecioCompra.php?id_repuesto=${idRepuesto}`);
        
        console.log('📥 Estado de respuesta:', respuesta.status);
        
        if (!respuesta.ok) {
            throw new Error(`Error del servidor: ${respuesta.status} ${respuesta.statusText}`);
        }
        
        const datos = await respuesta.json();
        console.log('📊 Datos recibidos:', datos);
        
        if (datos.success && datos.ultimo_precio_compra !== null) {
            ultimoPrecioCompra = parseFloat(datos.ultimo_precio_compra);
            precioCompraFecha = datos.fecha_compra || 'Fecha no disponible';
            
            document.getElementById('precio_ultima_compra').textContent = 
                `$${ultimoPrecioCompra.toFixed(2)} (${precioCompraFecha})`;
            
            console.log('✅ Último precio de compra cargado:', ultimoPrecioCompra);
        } else if (datos.success && datos.ultimo_precio_compra === null) {
            ultimoPrecioCompra = null;
            precioCompraFecha = null;
            document.getElementById('precio_ultima_compra').textContent = 
                datos.message || 'No hay compras registradas';
            console.log('ℹ️ No hay compras registradas para este repuesto');
        } else {
            throw new Error(datos.error || 'Error desconocido al obtener precio de compra');
        }
    } catch (error) {
        console.error('💥 Error al obtener último precio de compra:', error);
        ultimoPrecioCompra = null;
        precioCompraFecha = null;
        document.getElementById('precio_ultima_compra').textContent = 'Error al cargar';
        
        // Mostrar mensaje de error más específico
        mostrarMensaje('error', 'Error', 
            `No se pudo cargar el último precio de compra: ${error.message}`);
    }

    // Mostrar modal
    modalEditarPrecio.style.display = 'flex';
    
    // Enfocar el campo de precio
    setTimeout(() => {
        document.getElementById('nuevo_precio_venta').focus();
    }, 300);
}

function cerrarModalEditarPrecio() {
    modalEditarPrecio.style.display = 'none';
    repuestoSeleccionado = null;
    ultimoPrecioCompra = null;
    precioCompraFecha = null;
}

async function guardarPrecio(e) {
    e.preventDefault();
    
    const idRepuesto = document.getElementById('precio_id_repuesto').value;
    const nuevoPrecio = parseFloat(document.getElementById('nuevo_precio_venta').value);

    console.log('🔄 Intentando guardar precio:', { 
        idRepuesto: idRepuesto, 
        nuevoPrecio: nuevoPrecio,
        ultimoPrecioCompra: ultimoPrecioCompra
    });

    // Validaciones básicas
    if (!idRepuesto || idRepuesto === '') {
        mostrarMensaje('error', 'Error', 'ID de repuesto no válido');
        return;
    }

    if (!nuevoPrecio || isNaN(nuevoPrecio)) {
        mostrarMensaje('error', 'Error', 'Por favor ingrese un precio válido');
        document.getElementById('nuevo_precio_venta').focus();
        return;
    }

    if (nuevoPrecio <= 0) {
        mostrarMensaje('error', 'Error', 'El precio debe ser mayor a $0.00');
        document.getElementById('nuevo_precio_venta').focus();
        return;
    }

    if (nuevoPrecio < 0.01) {
        mostrarMensaje('error', 'Error', 'El precio mínimo es $0.01');
        return;
    }

    // ✅ ADVERTENCIA: Si el precio es inferior al de compra, pedir confirmación
    if (ultimoPrecioCompra && nuevoPrecio < ultimoPrecioCompra) {
        const confirmar = confirm(`⚠️ ADVERTENCIA:\n\nEl precio de venta ($${nuevoPrecio.toFixed(2)}) es inferior al último precio de compra ($${ultimoPrecioCompra.toFixed(2)}).\n\n¿Estás seguro de que deseas continuar?`);
        
        if (!confirmar) {
            return; // El usuario canceló
        }
    }

    // Proceder con el guardado...
    try {
        const datos = {
            id_repuesto: parseInt(idRepuesto),
            nuevo_precio: nuevoPrecio
        };

        console.log('📤 Enviando datos al servidor:', datos);

        const respuesta = await fetch('php/actualizarPrecioRepuesto.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        console.log('📥 Respuesta del servidor - Estado:', respuesta.status);

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status} ${respuesta.statusText}`);
        }
        
        const resultado = await respuesta.json();
        console.log('📥 Respuesta del servidor - Datos:', resultado);
        
        if (resultado.status === 'success') {
            mostrarMensaje('exito', 'Precio Actualizado', resultado.mensaje, 3000);
            cerrarModalEditarPrecio();
            await cargarRepuestos(); // Recargar para reflejar cambios
        } else {
            mostrarMensaje('error', 'Error', resultado.mensaje || 'Error desconocido');
        }
    } catch (error) {
        console.error('❌ Error actualizando precio:', error);
        mostrarMensaje('error', 'Error', `Error al actualizar el precio: ${error.message}`);
    }
}

function aplicarFiltros() {
    filtrosActivos = {
        busqueda: inputBuscar.value,
        marca: filtroMarca.value,
        stock: filtroStock.value,
        precio: filtroPrecio.value
    };
    
    cargarRepuestos();
}

function calcularEstadisticas() {
    const totalRepuestos = repuestosData.length;
    
    // NUEVA LÓGICA: Stock bajo cuando es igual o menor al mínimo (pero mayor que 0)
    const stockBajo = repuestosData.filter(r => 
        r.stock_actual > 0 && r.stock_actual <= r.stock_minimo
    ).length;
    
    const sinPrecio = repuestosData.filter(r => {
        const precio = parseFloat(r.precio) || 0;
        return precio <= 0;
    }).length;
    
    const valorInventario = repuestosData.reduce((total, repuesto) => {
        const precio = parseFloat(repuesto.precio) || 0;
        return total + (repuesto.stock_actual * precio);
    }, 0);

    // Actualizar UI
    document.getElementById('totalRepuestos').textContent = totalRepuestos;
    document.getElementById('stockBajo').textContent = stockBajo;
    document.getElementById('sinPrecio').textContent = sinPrecio;
    document.getElementById('valorInventario').textContent = `$${valorInventario.toFixed(2)}`;
}

function mostrarAlertas() {
    // NUEVA LÓGICA:
    const repuestosCriticos = repuestosData.filter(r => r.stock_actual === 0);
    const repuestosBajos = repuestosData.filter(r => 
        r.stock_actual > 0 && r.stock_actual <= r.stock_minimo
    );
    const repuestosSinPrecio = repuestosData.filter(r => {
        const precio = parseFloat(r.precio) || 0;
        return precio <= 0;
    });
    
    const alertasContainer = document.getElementById('alertasContainer');
    
    let alertasHTML = '';

    if (repuestosCriticos.length > 0) {
        alertasHTML += `
            <div class="alerta alerta-peligro">
                🚨 <strong>${repuestosCriticos.length} repuestos sin stock (stock = 0)</strong>
                <button onclick="filtrarStockCritico()">Ver todos</button>
            </div>
        `;
    }

    if (repuestosBajos.length > 0) {
        alertasHTML += `
            <div class="alerta alerta-peligro">
                ⚠️ <strong>${repuestosBajos.length} repuestos con stock bajo </strong>
                <button onclick="filtrarStockBajo()">Ver todos</button>
            </div>
        `;
    }

    if (repuestosSinPrecio.length > 0) {
        alertasHTML += `
            <div class="alerta alerta-precio">
                💰 <strong>${repuestosSinPrecio.length} repuestos sin precio de venta o precio en $0.00</strong>
                <button onclick="filtrarSinPrecio()">Ver todos</button>
            </div>
        `;
    }

    if (!alertasHTML) {
        alertasHTML = `
            <div class="alerta alerta-exito">
                ✅ Todo en orden - Stock y precios adecuados
            </div>
        `;
    }

    alertasContainer.innerHTML = alertasHTML;
}

function filtrarStockCritico() {
    filtroStock.value = 'critico';
    aplicarFiltros();
}

function filtrarStockBajo() {
    filtroStock.value = 'bajo';
    aplicarFiltros();
}

function filtrarSinPrecio() {
    filtroPrecio.value = 'sin_precio';
    aplicarFiltros();
}

// Funciones de exportación
function exportarPDF() {
    mostrarMensaje('advertencia', 'Exportar PDF', 'Función de exportación PDF en desarrollo', 3000);
}

function exportarExcel() {
    mostrarMensaje('advertencia', 'Exportar Excel', 'Función de exportación Excel en desarrollo', 3000);
}

// Modal de mensajes
function mostrarMensaje(tipo, titulo, texto, tiempoAutoCerrar = 4000) {
    modalIcono.className = "modal-mensaje-icono";
    
    if (tipo === "error") {
        modalIcono.classList.add("icono-error");
        modalIcono.innerHTML = "✖";
    } else if (tipo === "advertencia") {
        modalIcono.classList.add("icono-advertencia");
        modalIcono.innerHTML = "⚠";
    } else if (tipo === "exito") {
        modalIcono.classList.add("icono-exito");
        modalIcono.innerHTML = "✔";
    }
    
    modalTitulo.innerText = titulo;
    modalTexto.innerText = texto;
    modalMensaje.style.display = "flex";

    // Cerrar automáticamente después del tiempo especificado
    setTimeout(() => {
        modalMensaje.style.display = "none";
    }, tiempoAutoCerrar);
}

// Event listener para cerrar mensaje
cerrarMensaje.addEventListener("click", () => {
    modalMensaje.style.display = "none";
});

// Funciones globales (mantener las mismas)
function toggleMenu() {
    const menu = document.getElementById("menuUsuario");
    menu.classList.toggle("mostrar");
}

function irInicio() {
    window.location.href = "index.html";
}

function cerrarSesion() {
    if (window.cerrarSesion) {
        window.cerrarSesion();
    }
}

// Hacer funciones disponibles globalmente
window.inventario = {
    exportarPDF,
    exportarExcel,
    editarPrecio: abrirModalEditarPrecio
};