let filaSeleccionada = null;
let idSeleccionado = null;

const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const btnHabilitarModal = document.getElementById("btnHabilitarModal");
const btnDeshabilitarModal = document.getElementById("btnDeshabilitarModal");

const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnEditar = document.querySelector(".btn-actualizar");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");
let repuestosData = [];

// Modal mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Inputs
const inputNombre = document.getElementById("inputNombreProductos");
const inputDescripcion = document.getElementById("inputDescripcionProducto");
const inputStockMinimo = document.getElementById("inputStockMinimo");
const selectMarca = document.getElementById("selectMarca");
const selectMedida = document.getElementById("selectMedida");

// Errores
const errorNombre = document.getElementById("errorNombre");
const errorDescripcion = document.getElementById("errorTelefono");
const errorStock = document.getElementById("errorCorreo");

// ========================= VALIDACIONES =========================
inputNombre.addEventListener("input", () => {
    errorNombre.textContent = inputNombre.value.trim() === "" ? "El nombre no puede estar vacío." : "";
});
inputDescripcion.addEventListener("input", () => {
    errorDescripcion.textContent = inputDescripcion.value.trim() === "" ? "La descripción no puede estar vacía." : "";
});
inputStockMinimo.addEventListener("input", () => {
    errorStock.textContent = (inputStockMinimo.value.trim() === "" || parseInt(inputStockMinimo.value) < 0) ?
        "El stock mínimo debe ser un número mayor o igual a 0." : "";
});

function validarRepuesto() {
    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const stock = inputStockMinimo.value.trim();
    const marca = selectMarca.value;
    const medida = selectMedida.value;

    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }
    if (!descripcion) {
        showModalMensaje("advertencia", "Falta descripción", "Debe ingresar una descripción.");
        inputDescripcion.focus();
        return false;
    }
    if (stock === "" || parseInt(stock) < 0) {
        showModalMensaje("advertencia", "Stock inválido", "Debe ingresar un stock mínimo válido.");
        inputStockMinimo.focus();
        return false;
    }
    if (!marca) {
        showModalMensaje("advertencia", "Falta marca", "Debe seleccionar una marca.");
        selectMarca.focus();
        return false;
    }
    if (!medida) {
        showModalMensaje("advertencia", "Falta medida", "Debe seleccionar una medida.");
        selectMedida.focus();
        return false;
    }
    return { nombre, descripcion, stock, marca, medida };
}



document.addEventListener("DOMContentLoaded", () => {
    cargarMarcas();
    cargarMedidas();
    cargarRepuestos();
});

function cargarMarcas() {
    fetch("http://localhost/TallerZelaya/php/obtenerMarcas.php")
        .then(res => res.json())
        .then(data => {
            selectMarca.innerHTML = '<option value="" disabled selected>Seleccionar Marca</option>';
            data.forEach(m => {
                let option = document.createElement("option");
                option.value = m.id_marca;
                option.textContent = m.nombre;
                selectMarca.appendChild(option);
            });
        });
}

function cargarMedidas() {
    fetch("http://localhost/TallerZelaya/php/obtenerMedidas.php")
        .then(res => res.json())
        .then(data => {
            selectMedida.innerHTML = '<option value="" disabled selected>Seleccionar Medida</option>';
            data.forEach(m => {
                let option = document.createElement("option");
                option.value = m.id_medida;
                option.textContent = m.medida_bicicleta;
                selectMedida.appendChild(option);
            });
        });
}

function cargarRepuestos() {
    fetch("http://localhost/TallerZelaya/php/obtenerRepuestos.php")
        .then(res => res.json())
        .then(data => {
            repuestosData = data;
            renderTabla(data);
        });
}


// Renderizar tabla
function renderTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(rep => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${rep.codigo}</td>
            <td>${rep.nombre}</td>
            <td>${rep.descripcion}</td>
            <td>${rep.stock_minimo}</td>
            <td>${rep.marca}</td>
            <td>${rep.medida}</td>
            <td>
                <button class="btn-editar" data-id="${rep.id_repuesto}">
                    <img src="imgs/editar.png" alt="Editar">
                </button>
            </td>
        `;
        fila.querySelector(".btn-editar").addEventListener("click", (e) => {
            filaSeleccionada = e.target.closest("tr");
            idSeleccionado = e.target.closest("button").dataset.id;
            modal.style.display = "flex";
        });
        tablaBody.appendChild(fila);
    });
}

// Registrar
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    const datos = validarRepuesto();
    if (!datos) return;

    const duplicado = repuestosData.find(r => r.nombre.toLowerCase() === datos.nombre.toLowerCase());
    if (duplicado) {
        showModalMensaje("advertencia", "Duplicado", "Este repuesto ya está registrado.");
        return;
    }

    // Función para generar el código único de repuesto

    let nombrecodigo = document.getElementById("inputNombreProductos").value;
    let marcacodigo = document.getElementById("selectMarca").options[document.getElementById("selectMarca").selectedIndex].text;
    let medidacodigo = document.getElementById("selectMedida").options[document.getElementById("selectMedida").selectedIndex].text;

    // Tomar 3 letras del nombre y marca, y 2 de la medida
    let parteNombre = (nombrecodigo || "XXX").substring(0, 3).toUpperCase();
    let parteMarca = (marcacodigo || "XXX").substring(0, 3).toUpperCase();
    let parteMedida = (medidacodigo || "XX").substring(0, 2).toUpperCase();

    // Generar número aleatorio de 2 dígitos
    let aleatorio = Math.floor(10 + Math.random() * 90); // entre 10 y 99

    // Concatenar todo (3 + 3 + 2 + 2 = 10)
    let codigo = parteNombre + parteMarca + parteMedida + aleatorio;



    fetch("http://localhost/TallerZelaya/php/ingresarRepuesto.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `codigo=${codigo}&nombre=${datos.nombre}&descripcion=${datos.descripcion}&stock=${datos.stock}&id_marca=${datos.marca}&id_medida=${datos.medida}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarRepuestos();
                limpiarFormulario();
            } else {
                showModalMensaje("error", "Error", data.mensaje || "No se pudo insertar el registro.");
            }
        });
});

btnCancelarEdicion.addEventListener("click", () => {
    // Restaurar botones
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";

    // Limpiar inputs
    limpiarFormulario();

    // Resetear variables
    filaSeleccionada = null;
    idSeleccionado = null;

    inputNombre.focus();
    document.querySelector(".tabla-contenedor").classList.remove("bloqueada");
});


// ========================= BUSCAR =========================
inputBuscar.addEventListener("keyup", () => {
    const texto = inputBuscar.value.toLowerCase();
    const filtrados = repuestosData.filter(rep =>
        rep.codigo.toLowerCase().includes(texto) ||
        rep.nombre.toLowerCase().includes(texto) ||
        rep.marca.toLowerCase().includes(texto) ||
        rep.medida.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    renderTabla(repuestosData);
});

// ========================= MODALES =========================
function showModalMensaje(tipo, titulo, mensaje) {
    modalMensaje.style.display = "flex";
    modalTitulo.textContent = titulo;
    modalTexto.textContent = mensaje;
    modalIcono.className = "";
    if (tipo === "exito") modalIcono.classList.add("icono-exito");
    if (tipo === "error") modalIcono.classList.add("icono-error");
    if (tipo === "advertencia") modalIcono.classList.add("icono-advertencia");
}
cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");
cerrarModal.addEventListener("click", () => modal.style.display = "none");

// ========================= UTILS =========================
function limpiarFormulario() {
    [inputNombre, inputDescripcion, inputStockMinimo].forEach(i => i.value = "");
    selectMarca.selectedIndex = 0;
    selectMedida.selectedIndex = 0;
    errorNombre.textContent = "";
    errorDescripcion.textContent = "";
    errorStock.textContent = "";
    filaSeleccionada = null;
    idSeleccionado = null;
}


// Cerrar modal
cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Click fuera del modal
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        // Cambiar botones
        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        document.querySelector(".tabla-contenedor").classList.add("bloqueada");

        const celdas = filaSeleccionada.querySelectorAll("td");

        inputNombre.value = celdas[1].innerText;
        inputDescripcion.value = celdas[2].innerText;
        inputStockMinimo.value = celdas[3].innerText;

        // Establecer empresa en el select (buscando por nombre)
        const marca = celdas[4].innerText;
        const select = document.getElementById("selectMarca");
        for (let option of select.options) {
            if (option.text === marca) {
                select.value = option.value;
                break;
            }
        }
        const medida = celdas[5].innerText;
        const selectM = document.getElementById("selectMedida");
        for (let option of selectM.options) {
            if (option.text === medida) {
                selectM.value = option.value;
                break;
            }

            modal.style.display = "none";
        }
    }
});

//-------------------------------------------------------------------------------------------


const btnActualizar = document.querySelector(".btn-actualizar");

btnActualizar.addEventListener("click", () => {
    const nombre = inputs[0].value;
    const correo = inputs[2].value;
    const telefono = inputs[1].value;
    const empresa = document.getElementById("selectEmpresa").value;

    if (nombre.trim() === "") {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return;
    }
    if (!regexCorreo.test(correo.trim())) {
        showModalMensaje("advertencia", "Correo inválido", "correo inválido. Usa solo minúsculas y formato válido).");
        inputCorreo.focus();
        return;
    }
    if (!regexTelefono.test(telefono.trim())) {
        showModalMensaje("advertencia", "Teléfono inválido", "El teléfono debe contener exactamente 8 dígitos.");
        inputTelefono.focus();
        return;
    }
    if (!idSeleccionado) {
        showModalMensaje("advertencia", "Falta selección", "No se ha seleccionado ninguna empresa.");
        return;
    }

    if (empresa === "0" || !empresa) {
        showModalMensaje("advertencia", "Falta empresa", "Debe seleccionar una empresa.");
        return;
    }

    fetch("http://localhost/TallerZelaya/php/editarProveedor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&nombre=${nombre}&correo=${correo}&telefono=${telefono}&id_empresa=${empresa}`
    })
        .then(res => res.json())
        .then(data => {
            modal.style.display = "none";
            btnActualizar.style.display = "none";
            btnRegistrar.style.display = "inline-block";
            btnCancelarEdicion.style.display = "none";
            [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
            document.getElementById("selectEmpresa").selectedIndex = 0;
            inputNombre.focus();
            document.querySelector(".tabla-contenedor").classList.remove("bloqueada");

            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarProveedores();
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(err => {
            showModalMensaje("error", "Error", "No se pudo editar el registro.");
        });
});




const btnEliminar = document.getElementById("btnEliminarModal");

btnEliminar.addEventListener("click", () => {
    if (!idSeleccionado) {
        showModalMensaje("advertencia", "No hay selección", "No se ha seleccionado ningún proveedor.");
        return;
    }
    abrirModalConfirmar();
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



inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline";
        const filtrados = proveedoresData.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            p.correo.toLowerCase().includes(texto) ||
            p.telefono.toLowerCase().includes(texto) ||
            p.empresa.toLowerCase().includes(texto)
        );
        renderTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none";
        renderTabla(proveedoresData);
    }
});

// Limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    renderTabla(proveedoresData);
    inputBuscar.focus();
});


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
    }, 3000);
}

// Botón de cerrar
cerrarMensaje.addEventListener("click", () => {
    modalMensaje.style.display = "none";
});

// Cerrar si se hace click fuera
window.addEventListener("click", (e) => {
    if (e.target === modalMensaje) {
        modalMensaje.style.display = "none";
    }
});

// Función para abrir modal
function abrirModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "block";
}

// Función para cerrar modal
function cerrarModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    cerrarModalConfirmar();
    if (!idSeleccionado) return;

    fetch("http://localhost/TallerZelaya/php/eliminarProveedor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarProveedores(); // actualiza
                modal.style.display = "none";
                idSeleccionado = null;
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(err => {
            showModalMensaje("error", "Error", "No se pudo eliminar el registro.");
        });
});


const btnHabilitarRegistro = document.getElementById("btn-habilitar-registro");

// Al dar clic en "Habilitar registro"
btnHabilitarRegistro.addEventListener("click", () => {
    // Ocultar formulario
    document.querySelector(".formulario").style.display = "none";
    document.querySelector(".buscador-derecha").style.display = "none";
    // Cargar proveedores inactivos
    fetch("http://localhost/TallerZelaya/php/obtenerProveedoresInactivos.php")
        .then(res => res.json())
        .then(data => {
            renderTablaInactivos(data);
        })
        .catch(err => console.error("Error cargando inactivos:", err));
});

// Render tabla con proveedores inactivos
function renderTablaInactivos(datos) {
    tablaBody.innerHTML = "";
    if (datos.length === 0) {
        tablaBody.innerHTML = `<tr><td colspan="5">No hay proveedores inactivos</td></tr>`;
        return;
    }

    datos.forEach(prov => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.correo}</td>
            <td>${prov.telefono}</td>
            <td>${prov.empresa}</td>
            <td>
                <button class="btn-habilitar" data-id="${prov.id_proveedor}">
                    HABILITAR
                </button>
            </td>
        `;

        fila.querySelector(".btn-habilitar").addEventListener("click", (e) => {
            const id = e.target.closest("button").dataset.id;
            habilitarProveedor(id);
        });

        tablaBody.appendChild(fila);
    });
}

// Función para habilitar proveedor
function habilitarProveedor(id) {
    fetch("http://localhost/TallerZelaya/php/habilitarProveedor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);

                // Recargar lista de inactivos
                fetch("http://localhost/TallerZelaya/php/obtenerProveedoresInactivos.php")
                    .then(res => res.json())
                    .then(datos => renderTablaInactivos(datos));
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(() => {
            showModalMensaje("error", "Error", "No se pudo habilitar el registro.");
        });
}

const btnVolver = document.getElementById("btn-volver");

btnHabilitarRegistro.addEventListener("click", () => {
    // Ocultar formulario y mostrar botón volver
    document.querySelector(".formulario").style.display = "none";
    btnHabilitarRegistro.style.display = "none";
    btnVolver.style.display = "inline-block";

    // Cargar proveedores inactivos
    fetch("http://localhost/TallerZelaya/php/obtenerProveedoresInactivos.php")
        .then(res => res.json())
        .then(data => {
            renderTablaInactivos(data);
        })
        .catch(err => console.error("Error cargando inactivos:", err));
});

btnVolver.addEventListener("click", () => {
    // Mostrar formulario y ocultar botón volver
    document.querySelector(".formulario").style.display = "flex";
    btnHabilitarRegistro.style.display = "inline-block";
    btnVolver.style.display = "none";

    // Cargar proveedores activos
    cargarProveedores();
});
