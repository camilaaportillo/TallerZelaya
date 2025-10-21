// jsVenta.js
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let carrito = [];
    let modoEdicion = false;
    let itemEditando = null;
    let ventaActual = {
        cliente: '',
        fecha: '',
        tipo: 'producto'
    };
    let clienteBloqueado = false;

    // Elementos del DOM - CORREGIDOS para coincidir con el HTML
    const elementos = {
        // Formularios
        formularioProducto: document.querySelector('.formulario'),
        formularioReparacion: document.querySelector('.formulario2'),
        
        // Botones de cambio de formulario
        btnCambiarReparacion: document.getElementById('btnCambiarReparacion'),
        btnCambiarProductos: document.getElementById('btnCambiarProductos'),
        
        // Botones de acción - FORMULARIO PRODUCTOS
        btnAgregarProducto: document.querySelector('.formulario .btn-registrar'),
        btnActualizarProducto: document.querySelector('.formulario .btn-actualizar'),
        btnCancelarEdicionProducto: document.querySelector('.formulario .btn-cancelar-edicion'),
        
        // Botones de acción - FORMULARIO REPARACIONES
        btnAgregarReparacion: document.querySelector('.formulario2 .btn-registrar'),
        btnActualizarReparacion: document.querySelector('.formulario2 .btn-actualizar'),
        btnCancelarEdicionReparacion: document.querySelector('.formulario2 .btn-cancelar-edicion'),
        
        // Botones generales
        btnRegistrarVenta: document.getElementById('btn-registro'),
        btnListarVentas: document.getElementById('listar_ventas'),
        
        // Campos del formulario producto
        selectProducto: document.getElementById('selectProducto'),
        inputCantidadProducto: document.getElementById('inputCantidadProducto'),
        inputPrecioProducto: document.getElementById('inputPrecioProducto'),
        
        // Campos del formulario reparación
        inputProductoReparacion: document.getElementById('inputProductoReparacion'),
        inputCantidadReparacion: document.getElementById('inputCantidadReparacion'),
        inputPrecioReparacion: document.getElementById('inputPrecioReparacion'),
        
        // Campos comunes (mismos IDs en ambos formularios)
        selectCliente: document.getElementById('selectCliente'),
        inputFecha: document.getElementById('inputFecha'),
        
        // Tabla y total
        tablaBody: document.querySelector('tbody'),
        totalVenta: document.getElementById('totalVenta'),
        
        // Modales
        modalAcciones: document.getElementById('modalAcciones'),
        modalMensaje: document.getElementById('modalMensaje'),
        modalConfirmar: document.getElementById('modalConfirmar'),
        btnEditarModal: document.getElementById('btnEditarModal'),
        btnEliminarModal: document.getElementById('btnEliminarModal'),
        cerrarModal: document.getElementById('cerrarModal'),
        cerrarMensaje: document.getElementById('cerrarMensaje'),
        btnConfirmarEliminar: document.getElementById('btnConfirmarEliminar'),
        btnCancelarEliminar: document.getElementById('btnCancelarEliminar'),
        btnCerrarConfirmar: document.getElementById('btnCerrarConfirmar')
    };

    // Inicialización
    function inicializar() {
        console.log('Inicializando módulo de ventas...');
        
        // Verificar elementos críticos
        if (!elementos.formularioProducto || !elementos.formularioReparacion) {
            console.error('No se encontraron los formularios');
            return;
        }
        
        configurarEventListeners();
        establecerFechaActual();
        cargarClientes();
        cargarProductos();
    }

    // Configurar event listeners
    function configurarEventListeners() {
        console.log('Configurando event listeners...');
        
        // Cambio entre formularios
        if (elementos.btnCambiarReparacion) {
            elementos.btnCambiarReparacion.addEventListener('click', cambiarAReparacion);
        }
        if (elementos.btnCambiarProductos) {
            elementos.btnCambiarProductos.addEventListener('click', cambiarAProductos);
        }
        
        // Botones de formulario - PRODUCTOS
        if (elementos.btnAgregarProducto) {
            elementos.btnAgregarProducto.addEventListener('click', agregarItem);
        }
        if (elementos.btnActualizarProducto) {
            elementos.btnActualizarProducto.addEventListener('click', actualizarItem);
        }
        if (elementos.btnCancelarEdicionProducto) {
            elementos.btnCancelarEdicionProducto.addEventListener('click', cancelarEdicion);
        }
        
        // Botones de formulario - REPARACIONES
        if (elementos.btnAgregarReparacion) {
            elementos.btnAgregarReparacion.addEventListener('click', agregarItem);
        }
        if (elementos.btnActualizarReparacion) {
            elementos.btnActualizarReparacion.addEventListener('click', actualizarItem);
        }
        if (elementos.btnCancelarEdicionReparacion) {
            elementos.btnCancelarEdicionReparacion.addEventListener('click', cancelarEdicion);
        }
        
        // Botones generales
        if (elementos.btnRegistrarVenta) {
            elementos.btnRegistrarVenta.addEventListener('click', registrarVenta);
        }
        if (elementos.btnListarVentas) {
            elementos.btnListarVentas.addEventListener('click', listarVentas);
        }
        
        // Auto-calcular precio cuando se selecciona producto
        if (elementos.selectProducto) {
            elementos.selectProducto.addEventListener('change', function() {
                if (this.value) {
                    const producto = obtenerProductoPorId(this.value);
                    if (producto) {
                        elementos.inputPrecioProducto.value = producto.precio;
                    }
                }
            });
        }
        
        // Modales
        if (elementos.cerrarModal) {
            elementos.cerrarModal.addEventListener('click', () => cerrarModal(elementos.modalAcciones));
        }
        if (elementos.cerrarMensaje) {
            elementos.cerrarMensaje.addEventListener('click', () => cerrarModal(elementos.modalMensaje));
        }
        if (elementos.btnCerrarConfirmar) {
            elementos.btnCerrarConfirmar.addEventListener('click', cerrarModalConfirmar);
        }
        if (elementos.btnCancelarEliminar) {
            elementos.btnCancelarEliminar.addEventListener('click', cerrarModalConfirmar);
        }
        if (elementos.btnConfirmarEliminar) {
            elementos.btnConfirmarEliminar.addEventListener('click', confirmarEliminacion);
        }
        
        // Cerrar modales al hacer click fuera
        window.addEventListener('click', function(event) {
            if (elementos.modalAcciones && event.target === elementos.modalAcciones) {
                cerrarModal(elementos.modalAcciones);
            }
            if (elementos.modalMensaje && event.target === elementos.modalMensaje) {
                cerrarModal(elementos.modalMensaje);
            }
            if (elementos.modalConfirmar && event.target === elementos.modalConfirmar) {
                cerrarModalConfirmar();
            }
        });
    }

    // Cambiar a formulario de reparación
    function cambiarAReparacion() {
        elementos.formularioProducto.style.display = 'none';
        elementos.formularioReparacion.style.display = 'block';
        ventaActual.tipo = 'reparacion';
        limpiarFormulario();
    }

    // Cambiar a formulario de productos
    function cambiarAProductos() {
        elementos.formularioReparacion.style.display = 'none';
        elementos.formularioProducto.style.display = 'block';
        ventaActual.tipo = 'producto';
        limpiarFormulario();
    }

    // Establecer fecha actual
    function establecerFechaActual() {
        const ahora = new Date();
        const fecha = ahora.toISOString().split('T')[0];
        if (elementos.inputFecha) {
            elementos.inputFecha.value = fecha;
            ventaActual.fecha = fecha;
        }
    }

    // Cargar clientes desde la base de datos
    async function cargarClientes() {
        try {
            const response = await fetch('php/obtenerClientes.php');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const clientes = await response.json();
            
            if (elementos.selectCliente) {
                elementos.selectCliente.innerHTML = '';
                
                // Opción por defecto
                const optionDefault = document.createElement('option');
                optionDefault.value = "";
                optionDefault.textContent = "Consumidor Final";
                optionDefault.selected = true;
                elementos.selectCliente.appendChild(optionDefault);
                
                // Cargar clientes desde la base de datos
                clientes.forEach(cliente => {
                    const option = document.createElement('option');
                    option.value = cliente.id;
                    option.textContent = cliente.nombre;
                    elementos.selectCliente.appendChild(option);
                });
            }
            
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            mostrarMensaje('Error', 'No se pudieron cargar los clientes', 'error');
        }
    }

    // Cargar productos desde la base de datos
    async function cargarProductos() {
        try {
            const response = await fetch('php/obtenerRepuestosVenta.php');
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const productos = await response.json();
            
            if (elementos.selectProducto) {
                elementos.selectProducto.innerHTML = '<option value="" disabled selected>Seleccionar Producto</option>';
                
                productos.forEach(producto => {
                    const option = document.createElement('option');
                    option.value = producto.id_repuesto;
                    option.textContent = `${producto.nombre} - $${producto.precio} (Stock: ${producto.stock_actual})`;
                    option.dataset.precio = producto.precio;
                    option.dataset.stock = producto.stock_actual;
                    elementos.selectProducto.appendChild(option);
                });
            }
            
        } catch (error) {
            console.error('Error al cargar productos:', error);
            mostrarMensaje('Error', 'No se pudieron cargar los productos', 'error');
        }
    }

    // Obtener producto por ID desde los options
    function obtenerProductoPorId(id) {
        if (!elementos.selectProducto) return null;
        
        const option = elementos.selectProducto.querySelector(`option[value="${id}"]`);
        if (option) {
            return {
                id: option.value,
                nombre: option.textContent.split(' - $')[0],
                precio: parseFloat(option.dataset.precio),
                stock: parseInt(option.dataset.stock)
            };
        }
        return null;
    }

    // ... (las demás funciones se mantienen igual que en la versión anterior)

    // Agregar item al carrito
    function agregarItem() {
        if (!validarFormulario()) {
            mostrarMensaje('Error', 'Por favor complete todos los campos correctamente', 'error');
            return;
        }

        // Validar que se haya seleccionado un cliente
        if (elementos.selectCliente && !elementos.selectCliente.value && !clienteBloqueado) {
            mostrarMensaje('Error', 'Debe seleccionar un cliente antes de agregar productos', 'error');
            return;
        }

        let nuevoItem;
        
        if (ventaActual.tipo === 'producto') {
            const producto = obtenerProductoPorId(elementos.selectProducto.value);
            if (!producto) return;
            
            nuevoItem = {
                id: `prod_${Date.now()}`,
                tipo: 'producto',
                productoId: elementos.selectProducto.value,
                nombre: producto.nombre,
                cantidad: parseInt(elementos.inputCantidadProducto.value),
                precio: parseFloat(elementos.inputPrecioProducto.value),
                subtotal: parseInt(elementos.inputCantidadProducto.value) * parseFloat(elementos.inputPrecioProducto.value)
            };
        } else {
            nuevoItem = {
                id: `rep_${Date.now()}`,
                tipo: 'reparacion',
                nombre: elementos.inputProductoReparacion.value.trim(),
                cantidad: parseInt(elementos.inputCantidadReparacion.value),
                precio: parseFloat(elementos.inputPrecioReparacion.value),
                subtotal: parseInt(elementos.inputCantidadReparacion.value) * parseFloat(elementos.inputPrecioReparacion.value)
            };
        }

        // Verificar si ya existe el producto en el carrito
        const itemExistente = carrito.find(item => 
            item.tipo === nuevoItem.tipo && 
            (item.tipo === 'producto' ? item.productoId === nuevoItem.productoId : item.nombre === nuevoItem.nombre)
        );

        if (itemExistente && ventaActual.tipo === 'producto') {
            // Sumar a la cantidad existente
            itemExistente.cantidad += nuevoItem.cantidad;
            itemEditando.subtotal = itemExistente.cantidad * itemExistente.precio;
        } else {
            // Agregar nuevo item
            carrito.push(nuevoItem);
        }

        actualizarTabla();
        limpiarFormulario();
        mostrarMensaje('Éxito', 'Producto agregado al carrito', 'success');
        
        // Bloquear cliente después de agregar el primer producto
        actualizarEstadoCliente();
    }

    // Bloquear/desbloquear cliente
    function actualizarEstadoCliente() {
        if (!elementos.selectCliente) return;
        
        if (carrito.length > 0 && !clienteBloqueado) {
            elementos.selectCliente.disabled = true;
            elementos.selectCliente.style.backgroundColor = '#f0f0f0';
            elementos.selectCliente.style.cursor = 'not-allowed';
            clienteBloqueado = true;
            ventaActual.cliente = elementos.selectCliente.value;
        } else if (carrito.length === 0 && clienteBloqueado) {
            elementos.selectCliente.disabled = false;
            elementos.selectCliente.style.backgroundColor = '';
            elementos.selectCliente.style.cursor = '';
            clienteBloqueado = false;
        }
    }

    // Validaciones (simplificadas para este ejemplo)
    function validarFormulario() {
        if (ventaActual.tipo === 'producto') {
            return elementos.selectProducto.value && 
                   elementos.inputCantidadProducto.value > 0 && 
                   elementos.inputPrecioProducto.value > 0;
        } else {
            return elementos.inputProductoReparacion.value.trim() !== '' && 
                   elementos.inputCantidadReparacion.value > 0 && 
                   elementos.inputPrecioReparacion.value > 0;
        }
    }

    // Limpiar formulario
    function limpiarFormulario() {
        if (ventaActual.tipo === 'producto') {
            elementos.selectProducto.value = '';
            elementos.inputCantidadProducto.value = '';
            elementos.inputPrecioProducto.value = '';
        } else {
            elementos.inputProductoReparacion.value = '';
            elementos.inputCantidadReparacion.value = '';
            elementos.inputPrecioReparacion.value = '';
        }
    }

    // Actualizar tabla
    function actualizarTabla() {
        if (!elementos.tablaBody) return;
        
        elementos.tablaBody.innerHTML = '';
        
        carrito.forEach((item, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.nombre} ${item.tipo === 'reparacion' ? '(Servicio)' : ''}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio.toFixed(2)}</td>
                <td>$${item.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-accion" onclick="mostrarModalAcciones(${index})">
                        <img src="imgs/acciones.png" alt="Acciones">
                    </button>
                </td>
            `;
            elementos.tablaBody.appendChild(fila);
        });

        calcularTotal();
        actualizarEstadoCliente();
    }

    // Calcular total
    function calcularTotal() {
        if (!elementos.totalVenta) return;
        
        const total = carrito.reduce((sum, item) => sum + item.subtotal, 0);
        elementos.totalVenta.textContent = `$${total.toFixed(2)}`;
    }

    // Mostrar modal de acciones (global)
    window.mostrarModalAcciones = function(index) {
        itemEditando = carrito[index];
        if (elementos.modalAcciones) {
            elementos.modalAcciones.style.display = 'block';
        }
    }

    // Cerrar modales
    function cerrarModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    function cerrarModalConfirmar() {
        if (elementos.modalConfirmar) {
            elementos.modalConfirmar.style.display = 'none';
        }
        itemEditando = null;
    }

    // Mostrar mensajes
    function mostrarMensaje(titulo, texto, tipo) {
        const icono = document.getElementById('modalIcono');
        const modalTitulo = document.getElementById('modalTitulo');
        const modalTexto = document.getElementById('modalTexto');
        
        if (modalTitulo) modalTitulo.textContent = titulo;
        if (modalTexto) modalTexto.textContent = texto;
        
        if (icono) {
            if (tipo === 'success') {
                icono.innerHTML = '✓';
                icono.style.backgroundColor = '#4CAF50';
            } else {
                icono.innerHTML = '!';
                icono.style.backgroundColor = '#ff4444';
            }
        }
        
        if (elementos.modalMensaje) {
            elementos.modalMensaje.style.display = 'block';
        }
    }

    // Registrar venta
    function registrarVenta() {
        if (carrito.length === 0) {
            mostrarMensaje('Error', 'El carrito está vacío', 'error');
            return;
        }

        // Preparar datos de la venta
        const venta = {
            cliente: elementos.selectCliente ? elementos.selectCliente.value : '',
            fecha: elementos.inputFecha ? elementos.inputFecha.value : '',
            items: carrito,
            total: carrito.reduce((sum, item) => sum + item.subtotal, 0),
            usuario: document.getElementById('nombreUsuario') ? document.getElementById('nombreUsuario').textContent : 'Usuario'
        };

        console.log('Registrando venta:', venta);
        
        // Simular guardado exitoso
        setTimeout(() => {
            generarTicket(venta);
            carrito = [];
            actualizarTabla();
            limpiarFormulario();
            mostrarMensaje('Éxito', 'Venta registrada correctamente', 'success');
            actualizarEstadoCliente();
        }, 1000);
    }

    // Generar ticket
    function generarTicket(venta) {
        const ventanaTicket = window.open('', '_blank');
        const ahora = new Date();
        const fechaHora = ahora.toLocaleString('es-ES');
        
        const contenidoTicket = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket de Venta - Taller Zelaya</title>
                <style>
                    body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; font-size: 12px; }
                    .ticket { width: 300px; margin: 0 auto; }
                    .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                    .info { margin: 10px 0; }
                    .items { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    .items th, .items td { padding: 5px; text-align: left; border-bottom: 1px dashed #ccc; }
                    .total { text-align: right; font-weight: bold; margin-top: 10px; border-top: 2px solid #000; padding-top: 10px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <h2>Taller Zelaya</h2>
                        <p>Primera Avenida Sur, Barrio El Centro</p>
                        <p>San Martín #11</p>
                    </div>
                    <div class="info">
                        <p><strong>Fecha:</strong> ${fechaHora}</p>
                        <p><strong>Cliente:</strong> ${elementos.selectCliente ? elementos.selectCliente.options[elementos.selectCliente.selectedIndex].text : 'Consumidor Final'}</p>
                        <p><strong>Vendedor:</strong> ${venta.usuario}</p>
                    </div>
                    <table class="items">
                        <thead>
                            <tr><th>Descripción</th><th>Cant</th><th>P.Unit</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${venta.items.map(item => `
                                <tr>
                                    <td>${item.nombre} ${item.tipo === 'reparacion' ? '(Servicio)' : ''}</td>
                                    <td>${item.cantidad}</td>
                                    <td>$${item.precio.toFixed(2)}</td>
                                    <td>$${item.subtotal.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        <p>TOTAL: $${venta.total.toFixed(2)}</p>
                        <p><small>(IVA incluido)</small></p>
                    </div>
                    <div class="footer">
                        <p>¡Gracias por su compra!</p>
                        <p>Esperamos verle pronto nuevamente</p>
                        <p>Taller Zelaya - Su confianza es nuestra garantía</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        ventanaTicket.document.write(contenidoTicket);
        ventanaTicket.document.close();
        
        ventanaTicket.onload = function() {
            ventanaTicket.print();
        };
    }

    // Listar ventas
    function listarVentas() {
        window.location.href = 'listado_ventas.html';
    }

    // Funciones pendientes de implementar
    function actualizarItem() {
        console.log('Actualizar item - Pendiente de implementar');
    }

    function cancelarEdicion() {
        console.log('Cancelar edición - Pendiente de implementar');
    }

    function confirmarEliminacion() {
        console.log('Confirmar eliminación - Pendiente de implementar');
    }

    // Inicializar la aplicación
    inicializar();
});