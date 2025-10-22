document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let articulosVenta = [];
    let clienteSeleccionado = null;
    let fechaVenta = '';
    let tipoArticuloActual = 'producto'; // 'producto' o 'reparacion'
    let editandoIndex = -1;

    // Elementos del DOM
    const selectProducto = document.getElementById('selectProducto');
    const inputProductoReparacion = document.getElementById('inputProductoReparacion');
    const inputCantidad = document.getElementById('inputCantidad');
    const inputPrecio = document.getElementById('inputPrecio');
    const selectCliente = document.getElementById('selectCliente');
    const inputFecha = document.getElementById('inputFecha');
    const btnAgregar = document.getElementById('btnAgregar');
    const btnActualizar = document.getElementById('btnActualizar');
    const btnCancelar = document.getElementById('btnCancelar');
    const btnRegistrarVenta = document.getElementById('btnRegistrarVenta');
    const tbodyVentas = document.getElementById('tbodyVentas');
    const totalVenta = document.getElementById('totalVenta');
    const botonesTipo = document.querySelectorAll('.tipo-articulo-btn');
    const camposProducto = document.getElementById('campos-producto');
    const camposReparacion = document.getElementById('campos-reparacion');

    // Inicialización
    inicializarVenta();

    // Event Listeners
    botonesTipo.forEach(btn => {
        btn.addEventListener('click', cambiarTipoArticulo);
    });
    
    selectProducto.addEventListener('change', cargarPrecioProducto);
    btnAgregar.addEventListener('click', agregarArticulo);
    btnActualizar.addEventListener('click', actualizarArticulo);
    btnCancelar.addEventListener('click', cancelarEdicion);
    btnRegistrarVenta.addEventListener('click', registrarVenta);
    selectCliente.addEventListener('change', actualizarCliente);

    // Funciones de inicialización
    function inicializarVenta() {
        cargarFechaHora();
        cargarClientes();
        cargarRepuestos();
        inicializarValidaciones();
    }

    function cargarFechaHora() {
        const ahora = new Date();
        fechaVenta = ahora.toISOString().split('T')[0];
        inputFecha.value = fechaVenta;
    }

    function cargarClientes() {
        fetch('php/obtenerClientesVenta.php')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                console.log('Clientes cargados:', data);
                if (data.success && data.clientes) {
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.id_cliente;
                        option.textContent = cliente.nombre;
                        if (cliente.telefono) {
                            option.textContent += ` - ${cliente.telefono}`;
                        }
                        selectCliente.appendChild(option);
                    });
                } else {
                    mostrarMensaje('Error', data.message || 'No se pudieron cargar los clientes', 'error');
                }
            })
            .catch(error => {
                console.error('Error cargando clientes:', error);
                mostrarMensaje('Error', 'Error al cargar clientes: ' + error.message, 'error');
            });
    }

    function cargarRepuestos() {
        fetch('php/obtenerRepuestosVenta.php')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta del servidor');
                return response.json();
            })
            .then(data => {
                console.log('Repuestos cargados:', data);
                if (data.success && data.repuestos) {
                    data.repuestos.forEach(repuesto => {
                        const option = document.createElement('option');
                        option.value = repuesto.id_repuesto;
                        option.textContent = `${repuesto.nombre} - ${repuesto.codigo}`;
                        
                        if (repuesto.stock_actual !== null) {
                            option.textContent += ` (Stock: ${repuesto.stock_actual})`;
                        }
                        
                        option.dataset.precio = repuesto.precio || '0.00';
                        selectProducto.appendChild(option);
                    });
                } else {
                    mostrarMensaje('Error', data.message || 'No se pudieron cargar los productos', 'error');
                }
            })
            .catch(error => {
                console.error('Error cargando repuestos:', error);
                mostrarMensaje('Error', 'Error al cargar productos: ' + error.message, 'error');
            });
    }

    function cambiarTipoArticulo(event) {
        const tipo = event.target.dataset.tipo;
        
        // Actualizar botones activos
        botonesTipo.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Mostrar/ocultar campos según el tipo
        if (tipo === 'producto') {
            camposProducto.classList.remove('campo-oculto');
            camposReparacion.classList.add('campo-oculto');
            tipoArticuloActual = 'producto';
        } else {
            camposProducto.classList.add('campo-oculto');
            camposReparacion.classList.remove('campo-oculto');
            tipoArticuloActual = 'reparacion';
        }
        
        // Limpiar campos al cambiar tipo
        limpiarCamposArticulo();
    }

    function cargarPrecioProducto() {
        if (selectProducto.value && tipoArticuloActual === 'producto') {
            const selectedOption = selectProducto.options[selectProducto.selectedIndex];
            inputPrecio.value = selectedOption.dataset.precio || '0.00';
        }
    }

    function actualizarCliente() {
        clienteSeleccionado = selectCliente.value;
        
        // Bloquear cliente si ya hay artículos agregados
        if (articulosVenta.length > 0) {
            selectCliente.disabled = true;
        }
    }

    // Validaciones
    function inicializarValidaciones() {
        inputCantidad.addEventListener('input', validarCantidad);
        inputPrecio.addEventListener('input', validarPrecio);
        inputProductoReparacion.addEventListener('input', validarProductoReparacion);
    }

    function validarCantidad() {
        const valor = parseInt(inputCantidad.value);
        if (valor <= 0 || isNaN(valor)) {
            mostrarError(inputCantidad, 'La cantidad debe ser un número entero positivo');
            return false;
        } else {
            limpiarError(inputCantidad);
            return true;
        }
    }

    function validarPrecio() {
        const valor = parseFloat(inputPrecio.value);
        if (valor < 0 || isNaN(valor)) {
            mostrarError(inputPrecio, 'El precio debe ser un número positivo');
            return false;
        } else {
            limpiarError(inputPrecio);
            return true;
        }
    }

    function validarProductoReparacion() {
        if (tipoArticuloActual === 'reparacion' && !inputProductoReparacion.value.trim()) {
            mostrarError(inputProductoReparacion, 'Debe ingresar un producto/servicio');
            return false;
        } else {
            limpiarError(inputProductoReparacion);
            return true;
        }
    }

    function validarFormulario() {
        let valido = true;

        if (tipoArticuloActual === 'producto' && !selectProducto.value) {
            mostrarError(selectProducto, 'Debe seleccionar un producto');
            valido = false;
        }

        if (!validarProductoReparacion()) {
            valido = false;
        }

        if (!validarCantidad()) {
            valido = false;
        }

        if (!validarPrecio()) {
            valido = false;
        }

        return valido;
    }

    function mostrarError(elemento, mensaje) {
        const small = elemento.nextElementSibling;
        if (small && small.classList.contains('error-msg')) {
            small.textContent = mensaje;
            elemento.style.borderColor = 'red';
        }
    }

    function limpiarError(elemento) {
        const small = elemento.nextElementSibling;
        if (small && small.classList.contains('error-msg')) {
            small.textContent = '';
            elemento.style.borderColor = '';
        }
    }

    // Gestión de artículos en la venta
    function agregarArticulo() {
        if (!validarFormulario()) return;

        const articulo = {
            tipo: tipoArticuloActual,
            cantidad: parseInt(inputCantidad.value),
            precio: parseFloat(inputPrecio.value),
            subtotal: parseInt(inputCantidad.value) * parseFloat(inputPrecio.value)
        };

        // Agregar información específica según el tipo
        if (tipoArticuloActual === 'producto') {
            const selectedOption = selectProducto.options[selectProducto.selectedIndex];
            const texto = selectedOption.textContent;
            articulo.id_repuesto = parseInt(selectProducto.value);
            articulo.nombre = texto.split(' - ')[0];
            articulo.codigo = texto.split(' - ')[1]?.split(' ')[0] || '';
        } else {
            articulo.nombre = inputProductoReparacion.value.trim();
            articulo.id_repuesto = 9; // Para reparaciones
        }

        // Verificar si ya existe el artículo en la venta
        const indexExistente = articulosVenta.findIndex(item => 
            item.tipo === articulo.tipo && 
            (item.tipo === 'producto' ? item.id_repuesto === articulo.id_repuesto : item.nombre === articulo.nombre)
        );

        if (indexExistente !== -1) {
            // Sumar a la cantidad existente
            articulosVenta[indexExistente].cantidad += articulo.cantidad;
            articulosVenta[indexExistente].subtotal = articulosVenta[indexExistente].cantidad * articulosVenta[indexExistente].precio;
        } else {
            articulosVenta.push(articulo);
        }

        // Bloquear cliente después del primer artículo
        if (articulosVenta.length === 1) {
            selectCliente.disabled = true;
            clienteSeleccionado = selectCliente.value || '';
        }

        actualizarTabla();
        limpiarCamposArticulo();
        calcularTotal();
    }

    function actualizarArticulo() {
        if (!validarFormulario() || editandoIndex === -1) return;

        const articuloActualizado = {
            ...articulosVenta[editandoIndex],
            cantidad: parseInt(inputCantidad.value),
            precio: parseFloat(inputPrecio.value),
            subtotal: parseInt(inputCantidad.value) * parseFloat(inputPrecio.value)
        };

        // Actualizar nombre si es reparación
        if (tipoArticuloActual === 'reparacion') {
            articuloActualizado.nombre = inputProductoReparacion.value.trim();
        }

        articulosVenta[editandoIndex] = articuloActualizado;
        actualizarTabla();
        calcularTotal();
        cancelarEdicion();
    }

    function cancelarEdicion() {
        editandoIndex = -1;
        btnAgregar.style.display = 'block';
        btnActualizar.style.display = 'none';
        btnCancelar.style.display = 'none';
        limpiarCamposArticulo();
        
        // Restaurar tipo por defecto
        botonesTipo.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-tipo="producto"]').classList.add('active');
        cambiarTipoArticulo({ target: document.querySelector('[data-tipo="producto"]') });
    }

    function eliminarArticulo(index) {
        articulosVenta.splice(index, 1);
        actualizarTabla();
        calcularTotal();

        // Si no hay más artículos, desbloquear cliente
        if (articulosVenta.length === 0) {
            selectCliente.disabled = false;
            clienteSeleccionado = null;
        }
    }

    function editarArticulo(index) {
        const articulo = articulosVenta[index];
        editandoIndex = index;

        // Configurar tipo y campos según el artículo
        const tipoBtn = document.querySelector(`[data-tipo="${articulo.tipo}"]`);
        cambiarTipoArticulo({ target: tipoBtn });

        // Llenar campos con datos del artículo
        inputCantidad.value = articulo.cantidad;
        inputPrecio.value = articulo.precio;

        if (articulo.tipo === 'producto') {
            selectProducto.value = articulo.id_repuesto;
        } else {
            inputProductoReparacion.value = articulo.nombre;
        }

        btnAgregar.style.display = 'none';
        btnActualizar.style.display = 'block';
        btnCancelar.style.display = 'block';
    }

    function actualizarTabla() {
        tbodyVentas.innerHTML = '';

        articulosVenta.forEach((articulo, index) => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${index + 1}</td>
                <td>${articulo.tipo === 'producto' ? 'Producto' : 'Servicio'}</td>
                <td>${articulo.nombre}</td>
                <td>${articulo.cantidad}</td>
                <td>$${articulo.precio.toFixed(2)}</td>
                <td>$${articulo.subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn-editar" onclick="editarArticulo(${index})">✏️</button>
                    <button class="btn-eliminar" onclick="mostrarConfirmacionEliminar(${index})">🗑️</button>
                </td>
            `;
            tbodyVentas.appendChild(fila);
        });
    }

    function calcularTotal() {
        const total = articulosVenta.reduce((sum, articulo) => sum + articulo.subtotal, 0);
        totalVenta.textContent = `$${total.toFixed(2)}`;
    }

    function limpiarCamposArticulo() {
        selectProducto.value = '';
        inputProductoReparacion.value = '';
        inputCantidad.value = '';
        inputPrecio.value = '0.00';
        limpiarError(selectProducto);
        limpiarError(inputProductoReparacion);
        limpiarError(inputCantidad);
        limpiarError(inputPrecio);
    }

    // Registro de venta
    function registrarVenta() {
        if (articulosVenta.length === 0) {
            mostrarMensaje('Error', 'Debe agregar al menos un artículo a la venta', 'error');
            return;
        }

        const ventaData = {
            fecha: fechaVenta,
            total: articulosVenta.reduce((sum, articulo) => sum + articulo.subtotal, 0),
            id_usuario: obtenerIdUsuario(),
            id_cliente: clienteSeleccionado || null,
            productos: articulosVenta.filter(articulo => articulo.tipo === 'producto'),
            reparaciones: articulosVenta.filter(articulo => articulo.tipo === 'reparacion')
        };

        fetch('php/registrarVenta.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ventaData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje('Éxito', 'Venta registrada correctamente', 'success');
                generarTicket(data.id_venta);
                reiniciarVenta();
            } else {
                mostrarMensaje('Error', data.message || 'Error al registrar la venta', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error', 'Error al registrar la venta', 'error');
        });
    }

    function obtenerIdUsuario() {
        // Esta función debería obtener el ID del usuario desde la sesión
        // Por ahora retornamos un valor por defecto
        return 1;
    }

    function generarTicket(idVenta) {
        const ventanaTicket = window.open('', '_blank');
        const total = articulosVenta.reduce((sum, articulo) => sum + articulo.subtotal, 0);
        const iva = total * 0.13;
        const subtotal = total - iva;
        const ahora = new Date();

        ventanaTicket.document.write(`
            <html>
                <head>
                    <title>Ticket de Venta #${idVenta}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .ticket { max-width: 300px; margin: 0 auto; }
                        .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; }
                        .item { display: flex; justify-content: space-between; margin: 5px 0; }
                        .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 10px; }
                        .mensaje { text-align: center; margin-top: 20px; font-style: italic; }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">
                            <h2>Taller de bicicletas Zelaya</h2>
                            <p>Primera Avenida Sur, Barrio El Centro</p>
                            <p>San Martín #11, San Salvador</p>
                            <p>${ahora.toLocaleString()}</p>
                            <p>Venta #${idVenta}</p>
                        </div>
                        
                        <div class="cliente">
                            <p><strong>Cliente:</strong> ${clienteSeleccionado ? selectCliente.options[selectCliente.selectedIndex].textContent : 'Consumidor Final'}</p>
                        </div>
                        
                        <div class="items">
                            ${articulosVenta.map(articulo => `
                                <div class="item">
                                    <span>${articulo.nombre} x${articulo.cantidad}</span>
                                    <span>$${articulo.subtotal.toFixed(2)}</span>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="total">
                            <div class="item"><strong>Subtotal:</strong> <strong>$${subtotal.toFixed(2)}</strong></div>
                            <div class="item"><strong>IVA (13%):</strong> <strong>$${iva.toFixed(2)}</strong></div>
                            <div class="item"><strong>TOTAL:</strong> <strong>$${total.toFixed(2)}</strong></div>
                        </div>
                        
                        <div class="mensaje">
                            <p>¡Gracias por su compra!</p>
                            <p>Vuelva pronto</p>
                        </div>
                    </div>
                </body>
            </html>
        `);

        ventanaTicket.document.close();
        ventanaTicket.print();
    }

    function reiniciarVenta() {
        articulosVenta = [];
        clienteSeleccionado = null;
        selectCliente.disabled = false;
        selectCliente.value = '';
        actualizarTabla();
        calcularTotal();
        limpiarCamposArticulo();
        cancelarEdicion();
    }

    // Función para mostrar mensajes
    function mostrarMensaje(titulo, texto, tipo) {
        // Implementar según tu modal existente
        alert(`${titulo}: ${texto}`);
    }

    // Funciones globales para los botones
    window.editarArticulo = editarArticulo;
    window.mostrarConfirmacionEliminar = function(index) {
        if (confirm('¿Está seguro de eliminar este artículo de la venta?')) {
            eliminarArticulo(index);
        }
    };
});