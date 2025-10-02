"use strict";

/* ========== Estado ========== */
let productosCompra = [];
let filaSeleccionada = null;
let contadorId = 1;

let choicesProducto = null;
let choicesProveedor = null;

// Recuperar usuario de sessionStorage
const usuarioData = JSON.parse(sessionStorage.getItem("usuario") || "{}");
const ID_USUARIO = usuarioData.id || null;

/* ========== Referencias DOM ========== */
const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnActualizar = document.querySelector(".btn-actualizar");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");


const selectProducto = document.getElementById("selectProducto");
const inputCantidad = document.getElementById("inputCantidad");
const inputPrecio = document.getElementById("inputPrecio");

const selectProveedor = document.getElementById("selectProveedor");
const inputFecha = document.getElementById("fecha");

const totalCompra = document.getElementById("totalCompra");

const cerrarMensaje = document.getElementById("cerrarMensaje");

/* Errores (small tags en HTML) */
const errorProducto = document.getElementById("errorProducto");
const errorCantidad = document.getElementById("errorCantidad");
const errorPrecio = document.getElementById("errorPrecio");
const errorProveedor = document.getElementById("errorProveedor");
const errorFecha = document.getElementById("errorFecha");

// ========================= MODALES =========================
function showModalMensaje(tipo, titulo, texto) {
    // Resetear icono
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

    // Cerrar automático en 3 segundos
    setTimeout(() => {
        modalMensaje.style.display = "none";
    }, 2000);
}
cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");

// Si el botón listar_compras existe, navega
const btnListar = document.getElementById("listar_compras");
if (btnListar) {
    btnListar.addEventListener("click", () => {
        window.location.href = "listar_compras.html";
    });
}

/* ========== Inicialización ========== */
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar Choices (buscador en los selects) si existen
    if (selectProducto) {
        choicesProducto = new Choices(selectProducto, {
            searchEnabled: true,
            shouldSort: false,
            placeholderValue: "Buscar producto...",
            itemSelectText: "",
            searchPlaceholderValue: "Escribe para buscar..."
        });
    }
    if (selectProveedor) {
        choicesProveedor = new Choices(selectProveedor, {
            searchEnabled: true,
            shouldSort: false,
            placeholderValue: "Buscar proveedor...",
            itemSelectText: "",
            searchPlaceholderValue: "Escribe para buscar..."
        });
    }

    // Cargar los combos desde PHP
    cargarProductos();
    cargarProveedores();

    // Validaciones en tiempo real
    setupRealtimeValidation();

    // Hacer focus en el primer input (mantengo tu comportamiento)
    const formInputs = document.querySelectorAll("input, select, textarea");
    if (formInputs.length > 0) formInputs[0].focus();
});

/* ========== Cargar datos para los combos ========== */
function cargarProductos() {
    fetch("http://localhost/TallerZelaya/php/obtenerRepuestos.php")
        .then(res => res.json())
        .then(data => {
            const opciones = data.map(p => {
                const medida = p.medida || p.medida_bicicleta || "";
                const marca = p.marca || p.nombre_marca || "";
                const partes = [p.nombre];
                if (medida) partes.push(medida);
                if (marca) partes.push(marca);
                const label = partes.join(" ");
                return {
                    value: String(p.id_repuesto),
                    label: label,
                    customProperties: {
                        precio: p.precio ?? null,
                        stock: p.stock_minimo ?? null
                    }
                };
            });

            if (choicesProducto) {
                choicesProducto.clearChoices();
                choicesProducto.setChoices(opciones, "value", "label", true);
            } else if (selectProducto) {
                selectProducto.innerHTML = '<option value="" disabled selected>Seleccionar Producto</option>';
                opciones.forEach(o => {
                    const opt = document.createElement("option");
                    opt.value = o.value;
                    opt.textContent = o.label;
                    selectProducto.appendChild(opt);
                });
            }
        })
        .catch(err => {
            console.error("Error al cargar productos:", err);
        });
}

function cargarProveedores() {
    fetch("http://localhost/TallerZelaya/php/obtenerProveedores.php")
        .then(res => res.json())
        .then(data => {
            const opciones = data.map(p => ({
                value: String(p.id_proveedor),
                label: p.nombre + (p.empresa ? ` (${p.empresa})` : "")
            }));

            if (choicesProveedor) {
                choicesProveedor.clearChoices();
                choicesProveedor.setChoices(opciones, "value", "label", true);
            } else if (selectProveedor) {
                selectProveedor.innerHTML = '<option value="" disabled selected>Seleccionar Proveedor</option>';
                opciones.forEach(o => {
                    const opt = document.createElement("option");
                    opt.value = o.value;
                    opt.textContent = o.label;
                    selectProveedor.appendChild(opt);
                });
            }
        })
        .catch(err => {
            console.error("Error al cargar proveedores:", err);
        });
}

/* ========== Validaciones en tiempo real ========== */
function setupRealtimeValidation() {
    if (selectProducto) selectProducto.addEventListener("change", validarProducto);
    if (selectProveedor) selectProveedor.addEventListener("change", validarProveedor);
    if (inputCantidad) inputCantidad.addEventListener("input", validarCantidad);
    if (inputPrecio) inputPrecio.addEventListener("input", validarPrecio);
    if (inputFecha) inputFecha.addEventListener("input", validarFecha);
}

/* validadores individuales (devuelven boolean) */
function validarProducto() {
    if (!selectProducto || !selectProducto.value || selectProducto.value === "") {
        if (errorProducto) errorProducto.textContent = "Debe seleccionar un producto.";
        return false;
    }
    if (errorProducto) errorProducto.textContent = "";
    return true;
}
function validarCantidad() {
    const v = inputCantidad ? inputCantidad.value.trim() : "";
    if (!/^[0-9]+$/.test(v) || parseInt(v) <= 0) {
        if (errorCantidad) errorCantidad.textContent = "Ingrese una cantidad válida (ej: 10).";
        return false;
    }
    if (errorCantidad) errorCantidad.textContent = "";
    return true;
}

function validarPrecio() {
    const v = inputPrecio ? inputPrecio.value.trim() : "";
    if (!/^\d+(\.\d{1,2})?$/.test(v) || parseFloat(v) <= 0) {
        if (errorPrecio) errorPrecio.textContent = "Ingrese un precio válido (ej: 12.50).";
        return false;
    }
    if (errorPrecio) errorPrecio.textContent = "";
    return true;
}



function validarProveedor() {
    if (productosCompra.length === 0) {
        if (!selectProveedor || !selectProveedor.value || selectProveedor.value === "") {
            if (errorProveedor) errorProveedor.textContent = "Debe seleccionar un proveedor.";
            return false;
        }
    }
    if (errorProveedor) errorProveedor.textContent = "";
    return true;
}

function validarFecha() {
    if (!inputFecha || !inputFecha.value) {
        if (errorFecha) errorFecha.textContent = "Debe seleccionar una fecha.";
        return false;
    }

    const hoy = new Date();
    const seleccionada = new Date(inputFecha.value);

    // eliminar horas para comparación exacta
    hoy.setHours(0, 0, 0, 0);
    seleccionada.setHours(0, 0, 0, 0);

    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 8);

    if (seleccionada < hace7dias || seleccionada >= hoy) {
        if (errorFecha) errorFecha.textContent = "La fecha debe estar entre hoy y hace 7 días.";
        return false;
    }

    if (errorFecha) errorFecha.textContent = "";
    return true;
}


function validarCompra() {
    const v1 = validarProducto();
    const v2 = validarCantidad();
    const v3 = validarPrecio();
    const v4 = validarProveedor();
    const v5 = validarFecha();

    if (!(v1 && v2 && v3 && v4 && v5)) return false;

    // --- VALIDACIÓN: no permitir productos repetidos ---
    const prodId = selectProducto.value;
    if (productosCompra.some(p => p.id_repuesto == prodId && p.id !== filaSeleccionada)) {
        showModalMensaje("advertencia", "Producto repetido", "Este producto ya fue agregado a la compra");
        return false;
    }

    // devolver objeto con id_repuesto claro
    return {
        id_repuesto: selectProducto.value,
        nombreProducto: selectProducto.options[selectProducto.selectedIndex]?.text || "",
        cantidad: parseInt(inputCantidad.value.trim()),
        precio: parseFloat(inputPrecio.value.trim()),
        subtotal: parseInt(inputCantidad.value.trim()) * parseFloat(inputPrecio.value.trim()),
        proveedor: selectProveedor ? selectProveedor.value : null,
        fecha: inputFecha ? inputFecha.value : null
    };
}


/* ========== Agregar producto ========== */
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    const datos = validarCompra();
    if (!datos) return;

    // Si es el primer producto, bloquear proveedor y fecha (usando Choices para deshabilitar)
    if (productosCompra.length === 0) {
        if (choicesProveedor && typeof choicesProveedor.disable === "function") {
            choicesProveedor.disable();
        } else if (selectProveedor) {
            selectProveedor.setAttribute("disabled", "true");
        }
        if (inputFecha) inputFecha.setAttribute("readonly", "true");
    }

    const nuevoProducto = {
        id: contadorId++, // id único para la fila en la tabla
        id_repuesto: datos.id_repuesto, // id real del repuesto
        nombreProducto: datos.nombreProducto,
        cantidad: datos.cantidad,
        precio: datos.precio,
        subtotal: datos.subtotal
    };

    productosCompra.push(nuevoProducto);
    renderTabla();
    limpiarCampos();
});

/* ========== Render tabla ========== */
function renderTabla() {
    if (!tablaBody) return;
    tablaBody.innerHTML = "";

    productosCompra.forEach(prod => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombreProducto}</td>
            <td>${prod.cantidad}</td>
            <td>$${parseFloat(prod.precio).toFixed(2)}</td>
            <td>$${parseFloat(prod.subtotal).toFixed(2)}</td>
            <td>
                <button class="btn-editar" data-id="${prod.id}">✏</button>
                <button class="btn-eliminar" data-id="${prod.id}">🗑</button>
            </td>
        `;

        // listeners
        const btnE = fila.querySelector(".btn-editar");
        const btnX = fila.querySelector(".btn-eliminar");
        if (btnE) btnE.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            editarProducto(id);
        });
        if (btnX) btnX.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            abrirModalEliminar(id);
        });

        tablaBody.appendChild(fila);
    });

    calcularTotal();
}

/* ========== Editar producto ========== */
function editarProducto(id) {
    const prod = productosCompra.find(p => p.id === id);
    if (!prod) return;

    // Seleccionar producto en Choices por id_repuesto
    if (choicesProducto && typeof choicesProducto.setChoiceByValue === "function") {
        choicesProducto.setChoiceByValue(String(prod.id_repuesto));
    } else if (selectProducto) {
        selectProducto.value = prod.id_repuesto;
        selectProducto.dispatchEvent(new Event("change"));
    }

    inputCantidad.value = prod.cantidad;
    inputPrecio.value = prod.precio;

    // estado edición
    filaSeleccionada = id;
    if (btnRegistrar) btnRegistrar.style.display = "none";
    if (btnActualizar) btnActualizar.style.display = "inline-block";
    if (btnCancelarEdicion) btnCancelarEdicion.style.display = "inline-block";
}

/* ========== Botón actualizar (confirmar edición) ========== */
if (btnActualizar) {
    btnActualizar.addEventListener("click", (e) => {
        e.preventDefault();
        if (filaSeleccionada === null) return;

        const datos = validarCompra();
        if (!datos) return;

        const prod = productosCompra.find(p => p.id === filaSeleccionada);
        if (prod) {
            prod.id_repuesto = datos.id_repuesto;
            prod.nombreProducto = datos.nombreProducto;
            prod.cantidad = datos.cantidad;
            prod.precio = datos.precio;
            prod.subtotal = datos.subtotal;
        }

        renderTabla();
        limpiarCampos();

        // reset estado editar
        filaSeleccionada = null;
        if (btnRegistrar) btnRegistrar.style.display = "inline-block";
        if (btnActualizar) btnActualizar.style.display = "none";
        if (btnCancelarEdicion) btnCancelarEdicion.style.display = "none";
    });
}

/* cancelar edición */
if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener("click", (e) => {
        e.preventDefault();
        limpiarCampos();
        filaSeleccionada = null;
        if (btnRegistrar) btnRegistrar.style.display = "inline-block";
        if (btnActualizar) btnActualizar.style.display = "none";
        if (btnCancelarEdicion) btnCancelarEdicion.style.display = "none";
    });
}

/* ========== Eliminar producto ========== */
function abrirModalEliminar(id) {
    window._idAEliminar = id;
    const modalConfirm = document.getElementById("modalConfirmar");
    if (modalConfirm) modalConfirm.style.display = "block";
}

const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");
if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener("click", () => {
        const modalConfirm = document.getElementById("modalConfirmar");
        if (modalConfirm) modalConfirm.style.display = "none";
        const id = window._idAEliminar;
        if (!id) return;

        productosCompra = productosCompra.filter(p => p.id !== id);
        contadorId--;
        renderTabla();

        // si ya no hay productos, desbloquear proveedor y fecha
        if (productosCompra.length === 0) {
            if (choicesProveedor && typeof choicesProveedor.enable === "function") {
                choicesProveedor.enable();
            } else if (selectProveedor) {
                selectProveedor.removeAttribute("disabled");
            }
            if (inputFecha) inputFecha.removeAttribute("readonly");
        }

        window._idAEliminar = null;
    });
}

const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
if (btnCancelarEliminar) {
    btnCancelarEliminar.addEventListener("click", () => {
        const modalConfirm = document.getElementById("modalConfirmar");
        if (modalConfirm) modalConfirm.style.display = "none";
    });
}

/* ========== Calcular total ========== */
function calcularTotal() {
    const total = productosCompra.reduce((sum, p) => sum + Number(p.subtotal || 0), 0);
    if (totalCompra) totalCompra.textContent = `$${total.toFixed(2)}`;
}

/* ========== Utils ========== */
function limpiarCampos() {
    if (choicesProducto && typeof choicesProducto.removeActiveItems === "function") {
        choicesProducto.removeActiveItems();
    } else if (selectProducto) {
        selectProducto.selectedIndex = 0;
        selectProducto.dispatchEvent(new Event("change"));
    }

    if (inputCantidad) inputCantidad.value = "";
    if (inputPrecio) inputPrecio.value = "";

    if (errorProducto) errorProducto.textContent = "";
    if (errorCantidad) errorCantidad.textContent = "";
    if (errorPrecio) errorPrecio.textContent = "";

    if (inputCantidad) inputCantidad.focus();
}

// Cerrar modal (si existe)
const cerrarModal = document.getElementById("cerrarModal");

cerrarModal.addEventListener("click", () => {
    const modal = document.getElementById("modalFactura");
    if (modal) modal.style.display = "none";
});
// Click fuera del modal
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modalFactura");
    if (e.target === modal) {
        if (modal) modal.style.display = "none";
    }
});

/* ========== ENVIAR COMPRA COMPLETA ========== */
const btnEnviar = document.getElementById("btn-registro");
if (btnEnviar) {
    btnEnviar.addEventListener("click", (e) => {
        e.preventDefault();
        contadorId = 1;
        if (productosCompra.length === 0) {
            showModalMensaje("advertencia", "Producto requerido", "Debe agregar al menos un producto antes de enviar la compra.");
            return;
        }

        const proveedor = selectProveedor ? selectProveedor.value : null;
        const fecha = inputFecha ? inputFecha.value : null;

        if (!proveedor || !fecha) {
            showModalMensaje("advertencia", "Datos invalidos", "Proveedor o fecha inválidos.");
            return;
        }
        // Preparar datos para enviar
        const productosParaEnviar = productosCompra.map(p => ({
            producto: Number(p.id_repuesto),
            cantidad: Number(p.cantidad),
            precio: Number(p.precio)
        }));


        // Armamos el FormData
        let formData = new FormData();
        formData.append("proveedor", proveedor);
        formData.append("fecha", fecha);
        formData.append("usuario", ID_USUARIO);
        formData.append("productos", JSON.stringify(productosParaEnviar));

        // agregar factura si se subió
        let factura = document.getElementById("fileFactura")?.files[0];
        if (factura) {
            formData.append("factura", factura);
        }
        // Enviar datos al servidor
        console.log("Enviando datos al servidor:", { proveedor, fecha, usuario: ID_USUARIO, productos: productosParaEnviar, factura });

        fetch("php/compra.php", {
            method: "POST",
            body: formData
        })
            .then(async res => {
                const text = await res.text();
                console.log("Respuesta cruda del servidor:", text);
                // intentar parsear JSON, si no es JSON mostrar crudo
                try {
                    const data = JSON.parse(text);
                    return data;
                } catch (err) {
                    console.error("Respuesta cruda del servidor:", text);
                    throw new Error("Respuesta inválida del servidor");
                }
            })
            .then(data => {
                if (data.status === "success") {
                    showModalMensaje("exito", "Éxito", "Compra registrada correctamente");

                    // Reset de estado
                    productosCompra = [];
                    renderTabla();
                    if (totalCompra) totalCompra.textContent = "$0.00";

                    if (choicesProveedor && typeof choicesProveedor.enable === "function") {
                        choicesProveedor.enable();
                    } else if (selectProveedor) {
                        selectProveedor.removeAttribute("disabled");
                    }
                    if (inputFecha) inputFecha.removeAttribute("readonly");
                    if (inputFecha) inputFecha.value = "";
                } else {
                    showModalMensaje("error", "Error", "Error al registrar la compra");
                }
            })
            .catch(err => {
                console.error("Error en fetch:", err);
                showModalMensaje("error", "Error", "Error de conexión con el servidor");
            });
    });
}

/* ========== Modal factura (selección & preview) ========== */
// Abrir modal
const btnSubir = document.getElementById("subirFactura");
if (btnSubir) {
    btnSubir.addEventListener("click", () => {
        const modal = document.getElementById("modalFactura");
        if (modal) modal.style.display = "flex";
    });
}

// Al hacer clic en el botón, abre el input
const btnSeleccionarFactura = document.getElementById("btnSeleccionarFactura");
if (btnSeleccionarFactura) {
    btnSeleccionarFactura.addEventListener("click", () => {
        const inputFile = document.getElementById("fileFactura");
        if (inputFile) inputFile.click();
    });
}

// Mostrar preview al seleccionar archivo
const inputFileFactura = document.getElementById("fileFactura");
if (inputFileFactura) {
    inputFileFactura.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const preview = document.getElementById("previewFactura");
                if (preview) preview.innerHTML =
                    `<img src="${e.target.result}" alt="Factura" style="max-width:100%; border-radius:8px;">`;
            };
            reader.readAsDataURL(file);
        }
    });
}
