// Variables para control de mensajes
let timeoutMensaje = null;

// Recuperar usuario de sessionStorage
const usuarioData = JSON.parse(sessionStorage.getItem("usuario") || "{}");
const ID_USUARIO = usuarioData.id || null;

// Función mejorada para mostrar mensajes
function mostrarMensaje(titulo, texto, tipo = 'info', autoCerrar = true) {
    const modal = document.getElementById('modalMensaje');
    const contenido = modal.querySelector('.modal-mensaje-contenido');
    const icono = document.getElementById('modalIcono');
    const tituloElement = document.getElementById('modalTitulo');
    const textoElement = document.getElementById('modalTexto');

    console.log('Mostrando mensaje:', titulo, texto, tipo);

    // Limpiar timeout anterior si existe
    if (timeoutMensaje) {
        clearTimeout(timeoutMensaje);
        timeoutMensaje = null;
    }

    // Configurar según el tipo
    let iconoHTML = '';
    switch (tipo) {
        case 'success':
        case 'exito':
            iconoHTML = '✅';
            contenido.className = 'modal-mensaje-contenido exito';
            break;
        case 'error':
            iconoHTML = '❌';
            contenido.className = 'modal-mensaje-contenido error';
            break;
        case 'warning':
        case 'advertencia':
            iconoHTML = '⚠️';
            contenido.className = 'modal-mensaje-contenido advertencia';
            break;
        case 'info':
        default:
            iconoHTML = 'ℹ️';
            contenido.className = 'modal-mensaje-contenido info';
            break;
    }

    // Configurar contenido
    icono.innerHTML = iconoHTML;
    tituloElement.textContent = titulo;
    textoElement.textContent = texto;

    // Mostrar modal centrado
    modal.style.display = 'flex';
    contenido.classList.remove('saliendo');

    // Forzar reflow para la animación
    void contenido.offsetWidth;

    contenido.classList.add('mostrando');

    // Configurar auto-cierre
    if (autoCerrar) {
        timeoutMensaje = setTimeout(() => {
            cerrarMensaje();
        }, 2000);
    }
}

function cerrarMensaje() {
    const modal = document.getElementById('modalMensaje');
    const contenido = modal.querySelector('.modal-mensaje-contenido');

    if (timeoutMensaje) {
        clearTimeout(timeoutMensaje);
        timeoutMensaje = null;
    }

    contenido.classList.remove('mostrando');
    contenido.classList.add('saliendo');

    setTimeout(() => {
        modal.style.display = 'none';
        contenido.classList.remove('saliendo');
    }, 300);
}

// Función para mostrar confirmación personalizada
function mostrarConfirmacion(titulo, texto, callbackConfirmar, callbackCancelar = null) {
    const modal = document.getElementById('modalConfirmar');
    const contenido = modal.querySelector('.modal-mensaje-contenido');
    const tituloElement = document.getElementById('confirmarTitulo');
    const textoElement = document.getElementById('confirmarTexto');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    const btnCancelar = document.getElementById('btnCancelarEliminar');
    const btnCerrar = document.getElementById('btnCerrarConfirmar');

    console.log('Mostrando confirmación:', titulo, texto);

    // Configurar contenido
    tituloElement.textContent = titulo;
    textoElement.textContent = texto;

    // Mostrar modal con animación
    modal.style.display = 'flex';
    contenido.classList.remove('saliendo');

    // Forzar reflow para la animación
    void contenido.offsetWidth;

    contenido.classList.add('mostrando');

    // Función para cerrar el modal
    const cerrarModal = function () {
        contenido.classList.remove('mostrando');
        contenido.classList.add('saliendo');

        setTimeout(() => {
            modal.style.display = 'none';
            contenido.classList.remove('saliendo');
        }, 300);
    };

    // Remover event listeners anteriores
    const nuevoBtnConfirmar = btnConfirmar.cloneNode(true);
    const nuevoBtnCancelar = btnCancelar.cloneNode(true);
    const nuevoBtnCerrar = btnCerrar.cloneNode(true);

    btnConfirmar.parentNode.replaceChild(nuevoBtnConfirmar, btnConfirmar);
    btnCancelar.parentNode.replaceChild(nuevoBtnCancelar, btnCancelar);
    btnCerrar.parentNode.replaceChild(nuevoBtnCerrar, btnCerrar);

    // Configurar nuevos event listeners
    nuevoBtnConfirmar.addEventListener('click', function () {
        cerrarModal();
        if (callbackConfirmar) {
            setTimeout(callbackConfirmar, 300); // Esperar a que termine la animación
        }
    });

    nuevoBtnCancelar.addEventListener('click', function () {
        cerrarModal();
        if (callbackCancelar) {
            setTimeout(callbackCancelar, 300);
        }
    });

    nuevoBtnCerrar.addEventListener('click', function () {
        cerrarModal();
        if (callbackCancelar) {
            setTimeout(callbackCancelar, 300);
        }
    });

    // Cerrar haciendo click fuera del modal
    const cerrarClickExterno = function (event) {
        if (event.target === modal) {
            cerrarModal();
            if (callbackCancelar) {
                setTimeout(callbackCancelar, 300);
            }
        }
    };

    modal.addEventListener('click', cerrarClickExterno);

    // Cerrar con tecla ESC
    const cerrarConESC = function (event) {
        if (event.key === 'Escape') {
            cerrarModal();
            if (callbackCancelar) {
                setTimeout(callbackCancelar, 300);
            }
            document.removeEventListener('keydown', cerrarConESC);
        }
    };

    document.addEventListener('keydown', cerrarConESC);

    // Limpiar event listeners cuando se cierre el modal
    const limpiarEventListeners = function () {
        modal.removeEventListener('click', cerrarClickExterno);
        document.removeEventListener('keydown', cerrarConESC);
    };

    // Agregar listener para cuando se cierre el modal
    modal.addEventListener('transitionend', function handler(event) {
        if (event.target === contenido && modal.style.display === 'none') {
            limpiarEventListeners();
            modal.removeEventListener('transitionend', handler);
        }
    });
}

// Inicializar event listeners para el modal de mensajes
function inicializarModalMensajes() {
    const modal = document.getElementById('modalMensaje');
    const btnCerrar = document.getElementById('cerrarMensaje');

    // Cerrar con botón
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarMensaje);
    }

    // Cerrar haciendo click fuera del modal
    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            cerrarMensaje();
        }
    });

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            const modalMensaje = document.getElementById('modalMensaje');
            const modalConfirmar = document.getElementById('modalConfirmar');

            if (modalMensaje.style.display === 'flex') {
                cerrarMensaje();
            }
            if (modalConfirmar.style.display === 'flex') {
                modalConfirmar.style.display = 'none';
            }
        }
    });
}

// Variables globales para listar ventas
let ventasCargadas = [];
let ventaSeleccionada = null;
let choicesProducto = null;
let choicesCliente = null;

document.addEventListener('DOMContentLoaded', function () {
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
    const tablaContenedor = document.querySelector('.tabla-contenedor');

    // Inicializar sistema de mensajes
    inicializarModalMensajes();

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

    // Event Listeners para listar ventas
    document.getElementById('listar_ventas').addEventListener('click', mostrarModalVentas);
    document.getElementById('cerrarListarVentas').addEventListener('click', cerrarModalVentas);
    document.getElementById('btnFiltrar').addEventListener('click', cargarVentas);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('cerrarDetalleVenta').addEventListener('click', cerrarModalDetalle);
    document.getElementById('btnImprimirTicket').addEventListener('click', reimprimirTicket);

    // Funciones de inicialización
    function inicializarVenta() {
        cargarFechaHora();
        cargarClientes();
        cargarRepuestos();
        inicializarValidaciones();
    }

    function cargarFechaHora() {
        const ahora = new Date();

        // Formatear a dd/mm/aaaa
        const dia = String(ahora.getDate()).padStart(2, '0');
        const mes = String(ahora.getMonth() + 1).padStart(2, '0');
        const anio = ahora.getFullYear();

        fechaVenta = `${anio}-${mes}-${dia}`; // Para el backend (formato ISO)
        inputFecha.value = fechaVenta;

        // Mostrar en formato dd/mm/aaaa en la interfaz (opcional)
        const fechaFormateada = `${dia}/${mes}/${anio}`;
        console.log('Fecha de venta:', fechaFormateada);
    }

    // Función para formatear fechas a dd/mm/aaaa
    function formatearFecha(fechaISO) {
        if (!fechaISO) return '';

        const fecha = new Date(fechaISO);
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();

        return `${dia}/${mes}/${anio}`;
    }

    // Función para convertir dd/mm/aaaa a ISO (para el backend)
    function fechaToISO(fechaDDMMAAAA) {
        if (!fechaDDMMAAAA) return '';

        const partes = fechaDDMMAAAA.split('/');
        if (partes.length === 3) {
            return `${partes[2]}-${partes[1]}-${partes[0]}`;
        }
        return fechaDDMMAAAA;
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
                    // Limpiar select
                    selectCliente.innerHTML = '<option value="" disabled selected>Consumidor Final</option>';

                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.id_cliente;
                        option.textContent = cliente.nombre;
                        if (cliente.telefono) {
                            option.textContent += ` - ${cliente.telefono}`;
                        }
                        selectCliente.appendChild(option);
                    });

                    // Inicializar Choices.js para cliente
                    if (window.Choices) {
                        choicesCliente = new Choices(selectCliente, {
                            searchEnabled: true,
                            searchPlaceholderValue: 'Buscar cliente...',
                            itemSelectText: 'Seleccionar',
                            placeholder: true,
                            placeholderValue: 'Consumidor Final',
                            searchResultLimit: 10,
                            shouldSort: false,
                            allowHTML: true
                        });
                    }
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
                    // Limpiar select
                    selectProducto.innerHTML = '<option value="" disabled selected>Seleccionar Producto</option>';

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

                    // Inicializar Choices.js para producto
                    if (window.Choices) {
                        choicesProducto = new Choices(selectProducto, {
                            searchEnabled: true,
                            searchPlaceholderValue: 'Buscar producto...',
                            itemSelectText: 'Seleccionar',
                            placeholder: true,
                            placeholderValue: 'Seleccionar Producto',
                            searchResultLimit: 10,
                            shouldSort: false,
                            allowHTML: true
                        });
                    }
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
            inputPrecio.value = selectedOption.dataset.precio || '';
        }
    }

    function actualizarCliente() {
        clienteSeleccionado = selectCliente.value;

        // Bloquear cliente si ya hay artículos agregados
        if (articulosVenta.length > 0) {
            if (choicesCliente) {
                choicesCliente.disable();
            } else {
                selectCliente.disabled = true;
                selectCliente.classList.add('bloqueado');
            }
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
        if (articulosVenta.length === 1 && clienteSeleccionado) {
            if (choicesCliente) {
                choicesCliente.disable();
            } else {
                selectCliente.disabled = true;
                selectCliente.classList.add('bloqueado');
            }
        }

        actualizarTabla();
        calcularTotal();

        // Resetear combobox de producto correctamente
        limpiarCamposArticulo();

        if (choicesProducto) {
            choicesProducto.clearInput();
            choicesProducto.setValue([]);
        } else {
            selectProducto.value = '';
        }

        // Limpiar el precio también
        inputPrecio.value = '';

        //mostrarMensaje('Éxito', 'Artículo agregado correctamente', 'success');
    }

    function resetearComboboxProducto() {
        if (choicesProducto) {
            // Método CORRECTO para resetear Choices.js sin perder los datos
            setTimeout(() => {
                choicesProducto.clearStore();
                choicesProducto.setChoices([{
                    value: '',
                    label: 'Seleccionar Producto',
                    selected: true,
                    disabled: true
                }], 'value', 'label', true);

                // Recargar las opciones originales
                setTimeout(() => {
                    cargarOpcionesChoices();
                }, 100);
            }, 0);
        } else {
            selectProducto.value = '';
        }
    }

    // Función auxiliar para recargar opciones en Choices.js
    function cargarOpcionesChoices() {
        if (!choicesProducto) return;

        fetch('php/obtenerRepuestosVenta.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.repuestos) {
                    const opciones = data.repuestos.map(repuesto => ({
                        value: repuesto.id_repuesto.toString(),
                        label: `${repuesto.nombre} - ${repuesto.codigo} ${repuesto.stock_actual !== null ? `(Stock: ${repuesto.stock_actual})` : ''}`,
                        customProperties: {
                            precio: repuesto.precio || '0.00',
                            stock: repuesto.stock_actual || '0'
                        }
                    }));

                    choicesProducto.setChoices(opciones, 'value', 'label', true);
                }
            })
            .catch(error => {
                console.error('Error recargando opciones:', error);
            });
    }

    function actualizarArticulo() {
        console.log('Actualizando artículo, índice:', editandoIndex);
        if (!validarFormulario()) {
            console.log('Validación falló');
            return;
        }
        if (editandoIndex === -1) {
            console.log('No hay artículo en edición');
            return;
        }

        const articuloActualizado = {
            ...articulosVenta[editandoIndex],
            cantidad: parseInt(inputCantidad.value),
            precio: parseFloat(inputPrecio.value),
            subtotal: parseInt(inputCantidad.value) * parseFloat(inputPrecio.value)
        };

        // Actualizar nombre si es reparación
        if (tipoArticuloActual === 'reparacion') {
            articuloActualizado.nombre = inputProductoReparacion.value.trim();
        } else if (tipoArticuloActual === 'producto') {
            // Actualizar información del producto si es producto
            const selectedOption = selectProducto.options[selectProducto.selectedIndex];
            if (selectedOption) {
                const texto = selectedOption.textContent;
                articuloActualizado.nombre = texto.split(' - ')[0];
                articuloActualizado.codigo = texto.split(' - ')[1]?.split(' ')[0] || '';
            }
        }

        console.log('Artículo actualizado:', articuloActualizado);
        articulosVenta[editandoIndex] = articuloActualizado;
        actualizarTabla();
        calcularTotal();
        cancelarEdicion();

        mostrarMensaje('Éxito', 'Artículo actualizado correctamente', 'success');
    }

    function cancelarEdicion() {
        editandoIndex = -1;
        btnAgregar.style.display = 'block';
        btnActualizar.style.display = 'none';
        btnCancelar.style.display = 'none';
        limpiarCamposArticulo();

        // Habilitar interacción con la tabla
        if (tablaContenedor) {
            tablaContenedor.classList.remove('bloqueada');
        }

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
            if (choicesCliente) {
                choicesCliente.enable();
            } else {
                selectCliente.disabled = false;
                selectCliente.classList.remove('bloqueado');
            }
            clienteSeleccionado = null;
        }

        mostrarMensaje('Éxito', 'Artículo eliminado correctamente', 'success');
    }

    function editarArticulo(index) {
        const articulo = articulosVenta[index];
        editandoIndex = index;

        console.log('Editando artículo:', articulo);

        // Configurar tipo y campos según el artículo
        const tipoBtn = document.querySelector(`[data-tipo="${articulo.tipo}"]`);
        if (tipoBtn) {
            botonesTipo.forEach(btn => btn.classList.remove('active'));
            tipoBtn.classList.add('active');
            cambiarTipoArticulo({ target: tipoBtn });
        }

        // Llenar campos con datos del artículo
        inputCantidad.value = articulo.cantidad;
        inputPrecio.value = articulo.precio;

        if (articulo.tipo === 'producto') {
            if (choicesProducto) {
                // Buscar y seleccionar el producto en el combobox
                setTimeout(() => {
                    choicesProducto.setChoiceByValue(articulo.id_repuesto.toString());
                }, 100);
            } else {
                selectProducto.value = articulo.id_repuesto;
            }
        } else {
            inputProductoReparacion.value = articulo.nombre;
        }

        btnAgregar.style.display = 'none';
        btnActualizar.style.display = 'block';
        btnCancelar.style.display = 'block';

        // Bloquear interacción con la tabla mientras se edita
        if (tablaContenedor) {
            tablaContenedor.classList.add('bloqueada');
        }
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
                    <button class="btn-editar" onclick="editarArticuloDesdeTabla(${index})">✏️</button>
                    <button class="btn-eliminar" onclick="mostrarConfirmacionEliminarDesdeTabla(${index})">🗑️</button>
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
        inputProductoReparacion.value = '';
        inputCantidad.value = '';
        inputPrecio.value = '';

        // Limpiar combobox sin destruirlo
        if (choicesProducto) {
            choicesProducto.clearInput();
        } else {
            selectProducto.value = '';
        }

        limpiarError(selectProducto);
        limpiarError(inputProductoReparacion);
        limpiarError(inputCantidad);
        limpiarError(inputPrecio);
    }

    // Registro de venta
    function registrarVenta() {
        if (articulosVenta.length === 0) {
            mostrarMensaje('Advertencia', 'Debe agregar al menos un artículo a la venta', 'warning');
            return;
        }

        // Obtener usuario de sessionStorage
        const usuarioData = JSON.parse(sessionStorage.getItem("usuario") || "{}");
        const ID_USUARIO = usuarioData.id || null;
        const NOMBRE_USUARIO = usuarioData.nombre || 'Invitado';

        // Si no hay cliente seleccionado, usar cliente por defecto (id=1)
        const idClienteFinal = clienteSeleccionado || '1';

        const ventaData = {
            fecha: fechaVenta,
            total: articulosVenta.reduce((sum, articulo) => sum + articulo.subtotal, 0),
            id_usuario: ID_USUARIO,
            id_cliente: idClienteFinal,
            productos: articulosVenta.filter(articulo => articulo.tipo === 'producto'),
            reparaciones: articulosVenta.filter(articulo => articulo.tipo === 'reparacion'),
            // Agregar información del usuario para la bitácora
            usuario_bitacora: {
                id: ID_USUARIO,
                nombre: NOMBRE_USUARIO
            }
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
        return ID_USUARIO;
    }

    function generarTicket(idVenta) {
        // Abrir ventana emergente minimalista
        const ventanaTicket = window.open('', 'ticket', 'width=350,height=500,left=100,top=100,toolbar=no,scrollbars=no,resizable=no');

        const total = articulosVenta.reduce((sum, articulo) => sum + articulo.subtotal, 0);
        const ahora = new Date();

        const fecha = ahora.toLocaleDateString();
        const hora = ahora.toLocaleTimeString();

        // Obtener nombre del cliente
        let nombreCliente = 'CONSUMIDOR FINAL';
        if (clienteSeleccionado && selectCliente.options[selectCliente.selectedIndex]) {
            nombreCliente = selectCliente.options[selectCliente.selectedIndex].textContent.split(' - ')[0];
        }

        ventanaTicket.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Ticket Venta #${idVenta}</title>
                <meta charset="UTF-8">
                <style>
                    /* Reset completo */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        background: white;
                        color: black;
                        line-height: 1.2;
                        width: 100%;
                        margin: 0;
                        padding: 15px;
                    }
                    
                    .ticket-container {
                        width: 300px;
                        margin: 0 auto;
                        padding: 10px;
                        background: white;
                    }
                    
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                    }
                    
                    .header h2 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .header p {
                        font-size: 11px;
                        margin: 2px 0;
                    }
                    
                    .cliente {
                        margin: 8px 0;
                        padding: 5px 0;
                        border-bottom: 1px dashed #ccc;
                    }
                    
                    .cliente p {
                        font-size: 12px;
                        margin: 2px 0;
                    }
                    
                    .items {
                        margin: 8px 0;
                    }
                    
                    .item {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 11px;
                    }
                    
                    .item-name {
                        flex: 1;
                    }
                    
                    .item-price {
                        margin-left: 10px;
                        text-align: right;
                        min-width: 60px;
                    }
                    
                    .total {
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 8px;
                        font-weight: bold;
                    }
                    
                    .total-line {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 12px;
                    }
                    
                    .nota-importante {
                        text-align: center;
                        margin: 10px 0;
                        padding: 8px;
                        background: #f8f9fa;
                        border: 1px dashed #ccc;
                        border-radius: 4px;
                        font-size: 10px;
                        font-style: italic;
                    }
                    
                    .mensaje {
                        text-align: center;
                        margin-top: 15px;
                        font-style: italic;
                        font-size: 11px;
                        border-top: 1px dashed #ccc;
                        padding-top: 8px;
                    }
                    
                    .instrucciones {
                        text-align: center;
                        margin-top: 10px;
                        font-size: 10px;
                        color: #666;
                        font-style: italic;
                    }
                    
                    /* Estilos para impresión */
                    @media print {
                        body {
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        
                        .ticket-container {
                            width: 80mm !important;
                            padding: 5mm !important;
                            margin: 0 !important;
                        }
                        
                        .instrucciones {
                            display: none !important;
                        }
                        
                        @page {
                            margin: 0 !important;
                            padding: 0 !important;
                            size: 80mm auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    <div class="header">
                        <h2>TALLER DE BICICLETAS ZELAYA</h2>
                        <p>Primera Avenida Sur, Barrio El Centro</p>
                        <p>San Martín #11, San Salvador</p>
                        <p>${fecha} - ${hora}</p>
                        <p><strong>VENTA #${idVenta}</strong></p>
                    </div>
                    
                    <div class="cliente">
                        <p><strong>CLIENTE:</strong> ${nombreCliente}</p>
                    </div>
                    
                    <div class="items">
                        ${articulosVenta.map(articulo => `
                            <div class="item">
                                <span class="item-name">${articulo.nombre} x${articulo.cantidad}</span>
                                <span class="item-price">$${articulo.subtotal.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="nota-importante">
                        <p><strong>NOTA:</strong> La mano de obra está incluida en el precio total</p>
                    </div>
                    
                    <div class="total">
                        <div class="total-line">
                            <span>TOTAL:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="mensaje">
                        <p>¡Gracias por su compra!</p>
                        <p>Vuelva pronto</p>
                    </div>
                    
                    <div class="instrucciones">
                        <p>Use Ctrl+P para imprimir • Cierre esta ventana cuando termine</p>
                    </div>
                </div>
                
                <script>
                    // Auto-imprimir después de un breve delay
                    setTimeout(function() {
                        window.print();
                    }, 500);
                    
                    // Cerrar ventana después de imprimir
                    window.onafterprint = function() {
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                    
                    // También permitir cerrar con ESC
                    document.addEventListener('keydown', function(event) {
                        if (event.key === 'Escape') {
                            window.close();
                        }
                    });
                </script>
            </body>
        </html>
    `);

        ventanaTicket.document.close();
    }

    function reiniciarVenta() {
        articulosVenta = [];
        clienteSeleccionado = null;

        // Desbloquear cliente
        if (choicesCliente) {
            choicesCliente.enable();
            choicesCliente.setChoiceByValue('');
        } else {
            selectCliente.disabled = false;
            selectCliente.classList.remove('bloqueado');
            selectCliente.value = '';
        }

        actualizarTabla();
        calcularTotal();
        limpiarCamposArticulo();
        cancelarEdicion();

        // Resetear combobox de producto
        resetearComboboxProducto();

        location.reload();
    }

    // Funciones para listar ventas
    function mostrarModalVentas() {
        document.getElementById('modalListarVentas').style.display = 'block';
        cargarClientesFiltro();
        cargarVentas();
    }

    function cerrarModalVentas() {
        document.getElementById('modalListarVentas').style.display = 'none';
    }

    function cerrarModalDetalle() {
        document.getElementById('modalDetalleVenta').style.display = 'none';
    }

    function cargarClientesFiltro() {
        const filtroCliente = document.getElementById('filtroCliente');

        // Limpiar opciones excepto la primera
        while (filtroCliente.options.length > 1) {
            filtroCliente.remove(1);
        }

        // Cargar clientes (reutilizar la función existente o hacer nueva petición)
        fetch('php/obtenerClientesVenta.php')
            .then(response => response.json())
            .then(data => {
                if (data.success && data.clientes) {
                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.id_cliente;
                        option.textContent = cliente.nombre;
                        filtroCliente.appendChild(option);
                    });
                }
            })
            .catch(error => {
                console.error('Error cargando clientes para filtro:', error);
                mostrarMensaje('Error', 'Error al cargar clientes para filtro: ' + error.message, 'error');
            });
    }

    function cargarVentas() {
        const fechaDesde = document.getElementById('filtroFechaDesde').value;
        const fechaHasta = document.getElementById('filtroFechaHasta').value;
        const idCliente = document.getElementById('filtroCliente').value;

        // Construir URL con parámetros
        let url = 'php/obtenerVentas.php?';
        const params = new URLSearchParams();

        if (fechaDesde) {
            // Si el input date da formato dd/mm/aaaa, convertirlo
            params.append('fecha_desde', fechaToISO(fechaDesde));
        }
        if (fechaHasta) {
            params.append('fecha_hasta', fechaToISO(fechaHasta));
        }
        if (idCliente) params.append('id_cliente', idCliente);

        url += params.toString();

        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log('Ventas cargadas:', data);
                if (data.success && data.ventas) {
                    ventasCargadas = data.ventas;
                    actualizarTablaVentas(data.ventas);
                } else {
                    mostrarMensaje('Error', data.message || 'No se pudieron cargar las ventas', 'error');
                }
            })
            .catch(error => {
                console.error('Error cargando ventas:', error);
                mostrarMensaje('Error', 'Error al cargar ventas: ' + error.message, 'error');
            });
    }

    function actualizarTablaVentas(ventas) {
        const tbody = document.getElementById('tbodyVentasLista');
        tbody.innerHTML = '';

        if (ventas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No se encontraron ventas</td></tr>';
            return;
        }

        ventas.forEach(venta => {
            const fila = document.createElement('tr');
            fila.className = 'fila-clickeable';
            fila.dataset.idVenta = venta.id_venta;

            fila.innerHTML = `
                <td>${venta.id_venta}</td>
                <td>${formatearFecha(venta.fecha)}</td>
                <td>${venta.cliente_nombre}</td>
                <td>${venta.total_formateado}</td>
                <td>${venta.usuario_nombre}</td>
            `;

            fila.addEventListener('click', () => mostrarDetalleVenta(venta.id_venta));
            tbody.appendChild(fila);
        });
    }

    function limpiarFiltros() {
        document.getElementById('filtroFechaDesde').value = '';
        document.getElementById('filtroFechaHasta').value = '';
        document.getElementById('filtroCliente').value = '';
        cargarVentas();
    }

    function mostrarDetalleVenta(idVenta) {
        ventaSeleccionada = idVenta;

        fetch(`php/obtenerDetalleVenta.php?id_venta=${idVenta}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.detalle) {
                    mostrarModalDetalleVenta(data.detalle);
                } else {
                    mostrarMensaje('Error', data.message || 'No se pudieron cargar los detalles', 'error');
                }
            })
            .catch(error => {
                console.error('Error cargando detalle:', error);
                mostrarMensaje('Error', 'Error al cargar detalles: ' + error.message, 'error');
            });
    }

    function mostrarModalDetalleVenta(detalle) {
        const venta = detalle.venta;

        // Actualizar información general
        document.getElementById('detalleVentaId').textContent = venta.id_venta;
        document.getElementById('detalleFecha').textContent = formatearFecha(venta.fecha);
        document.getElementById('detalleCliente').textContent = venta.cliente_nombre || 'Consumidor Final';
        document.getElementById('detalleUsuario').textContent = venta.usuario_nombre;
        document.getElementById('detalleTotal').textContent = '$' + parseFloat(venta.total).toFixed(2);

        // Actualizar tabla de productos
        const tbodyProductos = document.getElementById('tbodyDetalleProductos');
        tbodyProductos.innerHTML = '';

        if (detalle.productos.length === 0) {
            tbodyProductos.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay productos</td></tr>';
        } else {
            detalle.productos.forEach(producto => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${producto.nombre} (${producto.codigo})</td>
                    <td>${producto.cantidad}</td>
                    <td>$${parseFloat(producto.precio_unitario).toFixed(2)}</td>
                    <td>$${parseFloat(producto.subtotal).toFixed(2)}</td>
                `;
                tbodyProductos.appendChild(fila);
            });
        }

        // Actualizar tabla de servicios
        const tbodyServicios = document.getElementById('tbodyDetalleServicios');
        tbodyServicios.innerHTML = '';

        if (detalle.servicios.length === 0) {
            tbodyServicios.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay servicios/reparaciones</td></tr>';
        } else {
            detalle.servicios.forEach(servicio => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${servicio.descripcion}</td>
                    <td>${servicio.cantidad}</td>
                    <td>$${parseFloat(servicio.precio).toFixed(2)}</td>
                    <td>$${parseFloat(servicio.subtotal).toFixed(2)}</td>
                `;
                tbodyServicios.appendChild(fila);
            });
        }

        // Mostrar modal
        document.getElementById('modalDetalleVenta').style.display = 'block';
    }

    function reimprimirTicket() {
        if (!ventaSeleccionada) {
            mostrarMensaje('Advertencia', 'No hay venta seleccionada para reimprimir', 'warning');
            return;
        }

        // Abrir ventana emergente
        const ventanaTicket = window.open('', 'ticket', 'width=350,height=500,left=100,top=100,toolbar=no,scrollbars=no,resizable=no');

        const ahora = new Date();
        const fecha = ahora.toLocaleDateString();
        const hora = ahora.toLocaleTimeString();

        const total = parseFloat(document.getElementById('detalleTotal').textContent.replace('$', ''));

        ventanaTicket.document.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Ticket Venta #${ventaSeleccionada}</title>
                <meta charset="UTF-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        background: white;
                        color: black;
                        line-height: 1.2;
                        width: 100%;
                        margin: 0;
                        padding: 15px;
                    }
                    
                    .ticket-container {
                        width: 300px;
                        margin: 0 auto;
                        padding: 10px;
                        background: white;
                    }
                    
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 8px;
                        margin-bottom: 8px;
                    }
                    
                    .header h2 {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .header p {
                        font-size: 11px;
                        margin: 2px 0;
                    }
                    
                    .cliente {
                        margin: 8px 0;
                        padding: 5px 0;
                        border-bottom: 1px dashed #ccc;
                    }
                    
                    .cliente p {
                        font-size: 12px;
                        margin: 2px 0;
                    }
                    
                    .items {
                        margin: 8px 0;
                    }
                    
                    .item {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 11px;
                    }
                    
                    .item-name {
                        flex: 1;
                    }
                    
                    .item-price {
                        margin-left: 10px;
                        text-align: right;
                        min-width: 60px;
                    }
                    
                    .total {
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 8px;
                        font-weight: bold;
                    }
                    
                    .total-line {
                        display: flex;
                        justify-content: space-between;
                        margin: 3px 0;
                        font-size: 12px;
                    }
                    
                    .nota-importante {
                        text-align: center;
                        margin: 10px 0;
                        padding: 8px;
                        background: #f8f9fa;
                        border: 1px dashed #ccc;
                        border-radius: 4px;
                        font-size: 10px;
                        font-style: italic;
                    }
                    
                    .mensaje {
                        text-align: center;
                        margin-top: 15px;
                        font-style: italic;
                        font-size: 11px;
                        border-top: 1px dashed #ccc;
                        padding-top: 8px;
                    }
                    
                    .instrucciones {
                        text-align: center;
                        margin-top: 10px;
                        font-size: 10px;
                        color: #666;
                        font-style: italic;
                    }
                    
                    @media print {
                        body {
                            padding: 0 !important;
                            margin: 0 !important;
                        }
                        
                        .ticket-container {
                            width: 80mm !important;
                            padding: 5mm !important;
                            margin: 0 !important;
                        }
                        
                        .instrucciones {
                            display: none !important;
                        }
                        
                        @page {
                            margin: 0 !important;
                            padding: 0 !important;
                            size: 80mm auto;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="ticket-container">
                    <div class="header">
                        <h2>TALLER DE BICICLETAS ZELAYA</h2>
                        <p>Primera Avenida Sur, Barrio El Centro</p>
                        <p>San Martín #11, San Salvador</p>
                        <p>${fecha} - ${hora}</p>
                        <p><strong>VENTA #${ventaSeleccionada} (REIMPRESIÓN)</strong></p>
                    </div>
                    
                    <div class="cliente">
                        <p><strong>CLIENTE:</strong> ${document.getElementById('detalleCliente').textContent}</p>
                    </div>
                    
                    <div class="items">
                        ${obtenerItemsTicket()}
                    </div>
                    
                    <div class="nota-importante">
                        <p><strong>NOTA:</strong> La mano de obra está incluida en el precio total</p>
                    </div>
                    
                    <div class="total">
                        <div class="total-line">
                            <span>TOTAL:</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div class="mensaje">
                        <p>¡Gracias por su compra!</p>
                        <p>Vuelva pronto</p>
                    </div>
                    
                    <div class="instrucciones">
                        <p>Use Ctrl+P para imprimir • Cierre esta ventana cuando termine</p>
                    </div>
                </div>
                
                <script>
                    // Auto-imprimir
                    setTimeout(function() {
                        window.print();
                    }, 500);
                    
                    // Cerrar después de imprimir
                    window.onafterprint = function() {
                        setTimeout(function() {
                            window.close();
                        }, 1000);
                    };
                    
                    // Cerrar con ESC
                    document.addEventListener('keydown', function(event) {
                        if (event.key === 'Escape') {
                            window.close();
                        }
                    });
                </script>
            </body>
        </html>
    `);

        ventanaTicket.document.close();
    }

    function obtenerItemsTicket() {
        let itemsHTML = '';

        // Productos
        const filasProductos = document.querySelectorAll('#tbodyDetalleProductos tr');
        filasProductos.forEach(fila => {
            if (fila.cells.length === 4) {
                const nombre = fila.cells[0].textContent.split(' (')[0]; // Remover código
                const cantidad = fila.cells[1].textContent;
                const subtotal = fila.cells[3].textContent;
                itemsHTML += `<div class="item"><span>${nombre} x${cantidad}</span><span>${subtotal}</span></div>`;
            }
        });

        // Servicios
        const filasServicios = document.querySelectorAll('#tbodyDetalleServicios tr');
        filasServicios.forEach(fila => {
            if (fila.cells.length === 4) {
                const descripcion = fila.cells[0].textContent;
                const cantidad = fila.cells[1].textContent;
                const subtotal = fila.cells[3].textContent;
                itemsHTML += `<div class="item"><span>${descripcion} x${cantidad}</span><span>${subtotal}</span></div>`;
            }
        });

        return itemsHTML;
    }

    // Funciones globales para los botones (CORREGIDAS)
    window.editarArticuloDesdeTabla = function (index) {
        editarArticulo(index);
    };

    window.mostrarConfirmacionEliminarDesdeTabla = function (index) {
        mostrarConfirmacion(
            'Confirmar Eliminación',
            '¿Está seguro de eliminar este artículo de la venta?',
            function () {
                eliminarArticulo(index);
            }
        );
    };
});
// Agregar el event listener para el botón de enviar factura
document.getElementById('btnEnviarFactura').addEventListener('click', enviarFacturaElectronica);

// Funciones para enviar factura
function enviarFacturaElectronica() {
    if (!ventaSeleccionada) {
        mostrarMensaje('Advertencia', 'No hay venta seleccionada para enviar', 'warning');
        return;
    }

    const btnEnviar = document.getElementById('btnEnviarFactura');
    const btnOriginalText = btnEnviar.textContent;

    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando...';
    btnEnviar.classList.add('enviando');

    // Obtener el correo del cliente
    obtenerCorreoCliente(ventaSeleccionada)
        .then(data => {
            if (!data.success || !data.correo) {
                mostrarMensaje('Advertencia', data.message || 'El cliente no tiene un correo electrónico vinculado', 'warning');
                resetearBotonEnviar(btnEnviar, btnOriginalText);
                return;
            }

            // Enviar la factura por correo
            return enviarFacturaPorCorreo(ventaSeleccionada, data.correo);
        })
        .then(resultado => {
            if (resultado && resultado.success) {
                mostrarMensaje('Éxito', resultado.message || 'Factura enviada correctamente al correo del cliente', 'success');
            } else if (resultado) {
                mostrarMensaje('Error', resultado.message || 'Error al enviar la factura', 'error');
            }
        })
        .catch(error => {
            console.error('Error enviando factura:', error);
            mostrarMensaje('Error', 'Error al enviar la factura: ' + error.message, 'error');
        })
        .finally(() => {
            resetearBotonEnviar(btnEnviar, btnOriginalText);
        });
}

function obtenerCorreoCliente(idVenta) {
    return fetch(`php/obtenerCorreoCliente.php?id_venta=${idVenta}`)
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        });
}

function enviarFacturaPorCorreo(idVenta, correo) {
    return fetch('php/enviarFacturaElectronica.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id_venta: idVenta,
            correo: correo
        })
    })
        .then(response => {
            return response.text().then(text => {
                console.log('Respuesta del servidor:', text);

                try {
                    const data = JSON.parse(text);
                    return data;
                } catch (e) {
                    console.error('Error parseando JSON:', e);
                    throw new Error('Error en la respuesta del servidor');
                }
            });
        });
}

function resetearBotonEnviar(boton, textoOriginal) {
    boton.disabled = false;
    boton.textContent = textoOriginal;
    boton.classList.remove('enviando');
}

// Actualizar la función mostrarModalDetalleVenta para obtener el correo del cliente
function mostrarModalDetalleVenta(detalle) {
    const venta = detalle.venta;

    // Actualizar información general
    document.getElementById('detalleVentaId').textContent = venta.id_venta;
    document.getElementById('detalleFecha').textContent = venta.fecha;
    document.getElementById('detalleCliente').textContent = venta.cliente_nombre || 'Consumidor Final';
    document.getElementById('detalleUsuario').textContent = venta.usuario_nombre;
    document.getElementById('detalleTotal').textContent = '$' + parseFloat(venta.total).toFixed(2);

    // Obtener y almacenar el correo del cliente
    obtenerCorreoCliente(venta.id_venta)
        .then(correo => {
            correoClienteActual = correo;
        })
        .catch(error => {
            console.error('Error obteniendo correo:', error);
            correoClienteActual = '';
        });

    // Actualizar tabla de productos
    const tbodyProductos = document.getElementById('tbodyDetalleProductos');
    tbodyProductos.innerHTML = '';

    if (detalle.productos.length === 0) {
        tbodyProductos.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay productos</td></tr>';
    } else {
        detalle.productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.nombre} (${producto.codigo})</td>
                <td>${producto.cantidad}</td>
                <td>$${parseFloat(producto.precio_unitario).toFixed(2)}</td>
                <td>$${parseFloat(producto.subtotal).toFixed(2)}</td>
            `;
            tbodyProductos.appendChild(fila);
        });
    }

    // Actualizar tabla de servicios
    const tbodyServicios = document.getElementById('tbodyDetalleServicios');
    tbodyServicios.innerHTML = '';

    if (detalle.servicios.length === 0) {
        tbodyServicios.innerHTML = '<tr><td colspan="4" style="text-align: center;">No hay servicios/reparaciones</td></tr>';
    } else {
        detalle.servicios.forEach(servicio => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${servicio.descripcion}</td>
                <td>${servicio.cantidad}</td>
                <td>$${parseFloat(servicio.precio).toFixed(2)}</td>
                <td>$${parseFloat(servicio.subtotal).toFixed(2)}</td>
            `;
            tbodyServicios.appendChild(fila);
        });
    }

    // Mostrar modal
    document.getElementById('modalDetalleVenta').style.display = 'block';
}