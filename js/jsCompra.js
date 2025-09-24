// js/jsCompra.js
"use strict";

/* ========== Estado ========== */
let productosCompra = [];
let filaSeleccionada = null;
let contadorId = 1;

let choicesProducto = null;
let choicesProveedor = null;

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

/* Errores (small tags en HTML) */
const errorProducto = document.getElementById("errorProducto");
const errorCantidad = document.getElementById("errorCantidad");
const errorPrecio = document.getElementById("errorPrecio");
const errorProveedor = document.getElementById("errorProveedor");
const errorFecha = document.getElementById("errorFecha");

/* ========== Inicialización ========== */
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar Choices (buscador en los selects)
    choicesProducto = new Choices(selectProducto, {
        searchEnabled: true,
        shouldSort: false,
        placeholderValue: "Buscar producto...",
        itemSelectText: "",
        searchPlaceholderValue: "Escribe para buscar..."
    });

    choicesProveedor = new Choices(selectProveedor, {
        searchEnabled: true,
        shouldSort: false,
        placeholderValue: "Buscar proveedor...",
        itemSelectText: "",
        searchPlaceholderValue: "Escribe para buscar..."
    });

    // Cargar los combos desde PHP
    cargarProductos();
    cargarProveedores();

    // Validaciones en tiempo real
    setupRealtimeValidation();
});

/* ========== Cargar datos para los combos ========== */
function cargarProductos() {
    fetch("http://localhost/TallerZelaya/php/obtenerRepuestos.php")
        .then(res => res.json())
        .then(data => {
            // Construir arreglo para Choices: value + label (Nombre | Medida | Marca)
            const opciones = data.map(p => {
                const medida = p.medida || p.medida_bicicleta || "";
                const marca = p.marca || p.nombre_marca || "";
                // etiqueta clara: nombre | medida | marca (si existen)
                const partes = [p.nombre];
                if (medida) partes.push(medida);
                if (marca) partes.push(marca);
                const label = partes.join(" ");
                return {
                    value: String(p.id_repuesto),
                    label: label,
                    // opcional: propiedades extras (ej: precio, stock) disponibles si las necesitas luego
                    customProperties: {
                        precio: p.precio ?? null,
                        stock: p.stock_minimo ?? null
                    }
                };
            });

            // Reemplazar choices (preserva el select subyacente)
            if (choicesProducto) {
                choicesProducto.clearChoices();
                choicesProducto.setChoices(opciones, "value", "label", true);
            } else {
                // fallback: si no existe choices (rarísimo), llenar directamente
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
            // mostrar mensaje no intrusivo
        });
}

function cargarProveedores() {
    fetch("http://localhost/TallerZelaya/php/obtenerProveedores.php")
        .then(res => res.json())
        .then(data => {
            const opciones = data.map(p => ({
                value: String(p.id_proveedor),
                label: p.empresa
            }));

            if (choicesProveedor) {
                choicesProveedor.clearChoices();
                choicesProveedor.setChoices(opciones, "value", "label", true);
            } else {
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
    // selects (Choices emite 'change' en el select subyacente)
    selectProducto.addEventListener("change", validarProducto);
    selectProveedor.addEventListener("change", validarProveedor);
    inputCantidad.addEventListener("input", validarCantidad);
    inputPrecio.addEventListener("input", validarPrecio);
    inputFecha.addEventListener("input", validarFecha);
}

/* validadores individuales (devuelven boolean) */
function validarProducto() {
    if (!selectProducto.value || selectProducto.value === "") {
        errorProducto.textContent = "Debe seleccionar un producto.";
        return false;
    }
    errorProducto.textContent = "";
    return true;
}
function validarCantidad() {
    const v = inputCantidad.value.trim();
    if (!/^[0-9]+$/.test(v) || parseInt(v) <= 0) {
        errorCantidad.textContent = "Ingrese una cantidad válida (número entero > 0).";
        return false;
    }
    errorCantidad.textContent = "";
    return true;
}
function validarPrecio() {
    const v = inputPrecio.value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(v) || parseFloat(v) <= 0) {
        errorPrecio.textContent = "Ingrese un precio válido (ej: 12.50).";
        return false;
    }
    errorPrecio.textContent = "";
    return true;
}
function validarProveedor() {
    // validar proveedor solo si aún no hay productos (lo hacemos en validarCompra)
    if (productosCompra.length === 0) {
        if (!selectProveedor.value || selectProveedor.value === "") {
            errorProveedor.textContent = "Debe seleccionar un proveedor.";
            return false;
        }
        errorProveedor.textContent = "";
    } else {
        errorProveedor.textContent = "";
    }
    return true;
}
function validarFecha() {
    if (productosCompra.length === 0) {
        if (!inputFecha.value || inputFecha.value === "") {
            errorFecha.textContent = "Debe seleccionar una fecha.";
            return false;
        }
        errorFecha.textContent = "";
    } else {
        errorFecha.textContent = "";
    }
    return true;
}

/* validar todo antes de agregar/actualizar */
function validarCompra() {
    const v1 = validarProducto();
    const v2 = validarCantidad();
    const v3 = validarPrecio();
    const v4 = validarProveedor();
    const v5 = validarFecha();

    if (!(v1 && v2 && v3 && v4 && v5)) return false;

    // si todo OK devolver objeto con datos útiles
    return {
        producto: selectProducto.value,
        nombreProducto: selectProducto.options[selectProducto.selectedIndex]?.text || "",
        cantidad: parseInt(inputCantidad.value.trim()),
        precio: parseFloat(inputPrecio.value.trim()),
        subtotal: parseInt(inputCantidad.value.trim()) * parseFloat(inputPrecio.value.trim()),
        proveedor: selectProveedor.value,
        fecha: inputFecha.value
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
        } else {
            selectProveedor.setAttribute("disabled", "true");
        }
        inputFecha.setAttribute("readonly", "true");
    }

    const nuevoProducto = {
        id: contadorId++,
        producto: datos.producto,
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
    tablaBody.innerHTML = "";

    productosCompra.forEach(prod => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prod.id}</td>
            <td>${prod.nombreProducto}</td>
            <td>${prod.cantidad}</td>
            <td>$${prod.precio.toFixed(2)}</td>
            <td>$${prod.subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-editar" data-id="${prod.id}">✏</button>
                <button class="btn-eliminar" data-id="${prod.id}">🗑</button>
            </td>
        `;

        // listeners
        fila.querySelector(".btn-editar").addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.dataset.id, 10);
            editarProducto(id);
        });

        fila.querySelector(".btn-eliminar").addEventListener("click", (e) => {
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

    // Seleccionar producto en Choices (intentar con el API; si no, fallback)
    if (choicesProducto && typeof choicesProducto.setChoiceByValue === "function") {
        choicesProducto.setChoiceByValue(String(prod.producto));
    } else {
        selectProducto.value = prod.producto;
        selectProducto.dispatchEvent(new Event("change"));
    }

    inputCantidad.value = prod.cantidad;
    inputPrecio.value = prod.precio;

    // estado edición
    filaSeleccionada = id;
    btnRegistrar.style.display = "none";
    btnActualizar.style.display = "inline-block";
    btnCancelarEdicion.style.display = "inline-block";
}

/* ========== Botón actualizar (confirmar edición) ========== */
btnActualizar.addEventListener("click", (e) => {
    e.preventDefault();
    if (filaSeleccionada === null) return;

    const datos = validarCompra();
    if (!datos) return;

    const prod = productosCompra.find(p => p.id === filaSeleccionada);
    if (prod) {
        prod.producto = datos.producto;
        prod.nombreProducto = datos.nombreProducto;
        prod.cantidad = datos.cantidad;
        prod.precio = datos.precio;
        prod.subtotal = datos.subtotal;
    }

    renderTabla();
    limpiarCampos();

    // reset estado editar
    filaSeleccionada = null;
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";
});

/* cancelar edición */
btnCancelarEdicion.addEventListener("click", (e) => {
    e.preventDefault();
    limpiarCampos();
    filaSeleccionada = null;
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";
});

/* ========== Eliminar producto ========== */
function abrirModalEliminar(id) {
    // abrir modal de confirmación (tu modalConfirmar ya existe en HTML)
    // guardamos el idSeleccionado temporalmente en una variable en ventana para usar al confirmar
    window._idAEliminar = id;
    document.getElementById("modalConfirmar").style.display = "block";
}

document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    document.getElementById("modalConfirmar").style.display = "none";
    const id = window._idAEliminar;
    if (!id) return;

    productosCompra = productosCompra.filter(p => p.id !== id);
    renderTabla();

    // si ya no hay productos, desbloquear proveedor y fecha
    if (productosCompra.length === 0) {
        if (choicesProveedor && typeof choicesProveedor.enable === "function") {
            choicesProveedor.enable();
        } else {
            selectProveedor.removeAttribute("disabled");
        }
        inputFecha.removeAttribute("readonly");
    }

    // limpiar variable temporaria
    window._idAEliminar = null;
});

document.getElementById("btnCancelarEliminar").addEventListener("click", () => {
    document.getElementById("modalConfirmar").style.display = "none";
});

/* ========== Calcular total ========== */
function calcularTotal() {
    const total = productosCompra.reduce((sum, p) => sum + p.subtotal, 0);
    totalCompra.textContent = `$${total.toFixed(2)}`;
}

/* ========== Utils ========== */
function limpiarCampos() {
    // limpiar selects/inputs
    if (choicesProducto && typeof choicesProducto.removeActiveItems === "function") {
        choicesProducto.removeActiveItems(); // limpia la selección sin borrar las opciones
    } else {
        selectProducto.selectedIndex = 0;
        selectProducto.dispatchEvent(new Event("change"));
    }

    inputCantidad.value = "";
    inputPrecio.value = "";

    // limpiar errores
    errorProducto.textContent = "";
    errorCantidad.textContent = "";
    errorPrecio.textContent = "";

    inputCantidad.focus();
}

// Cerrar modal
cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
});

function irInicio() {
    window.location.href = "index.html";
}

function toggleMenu() {
    document.getElementById("menuUsuario").classList.toggle("mostrar");
}

window.onclick = function (e) {
    if (!e.target.closest('.usuario')) {
        document.getElementById("menuUsuario").classList.remove("mostrar");
    }
}

const formInputs = document.querySelectorAll("input, select, textarea");

// Hacer focus en el primer input al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    if (formInputs.length > 0) {
        formInputs[0].focus();
    }
});

// Navegación con Enter
formInputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // evitar submit accidental

            // Si no es el último input → pasar al siguiente
            if (index < formInputs.length - 1) {
                formInputs[index + 1].focus();
            } else {
                // Si es el último input → enfocar botón correcto
                if (btnRegistrar.style.display !== "none") {
                    btnRegistrar.focus();
                } else if (btnEditar.style.display !== "none") {
                    btnEditar.focus();
                }
            }
        }
    });
});


/* ========== ENVIAR COMPRA COMPLETA ========== */
const btnEnviar = document.getElementById("btn-registro");

btnEnviar.addEventListener("click", () => {
    if (productosCompra.length === 0) {
        alert("Debe agregar al menos un producto antes de enviar la compra.");
        return;
    }

    const proveedor = selectProveedor.value;
    const fecha = inputFecha.value;

    // Armamos el payload
    const payload = {
        proveedor: proveedor,
        fecha: fecha,
        usuario: 1, // en producción lo obtienes de sesión PHP
        productos: productosCompra.map(p => ({
            id_repuesto: p.producto,
            cantidad: p.cantidad,
            precio: p.precio
        }))
    };
    fetch("http://localhost/TallerZelaya/php/compra.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            alert("Compra registrada correctamente ✅");

            // Reset de estado
            productosCompra = [];
            renderTabla();
            totalCompra.textContent = "$0.00";

            if (choicesProveedor && typeof choicesProveedor.enable === "function") {
                choicesProveedor.enable();
            } else {
                selectProveedor.removeAttribute("disabled");
            }
            inputFecha.removeAttribute("readonly");
            inputFecha.value = "";
        } else {
            alert("Error al registrar la compra ❌");
        }
    })
    .catch(err => {
        console.error("Error en fetch:", err);
        alert("Error de conexión con el servidor.");
    });
});
