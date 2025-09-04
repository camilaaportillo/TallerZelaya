let filaSeleccionada = null;
let idSeleccionado = null;

const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const inputs = document.querySelectorAll(".formulario input, .formulario select");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const formInputs = document.querySelectorAll(".formulario input");
const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnEditar = document.querySelector(".btn-actualizar");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");
let proveedoresData = [];

const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Inputs con IDs directos
const inputNombre = document.getElementById("inputNombreProveedor");
const inputCorreo = document.getElementById("inputCorreoProveedor");
const inputTelefono = document.getElementById("inputTelefonoProveedor");

// Mensajes de error
const errorNombre = document.getElementById("errorNombre");
const errorCorreo = document.getElementById("errorCorreo");
const errorTelefono = document.getElementById("errorTelefono");

// Correo solo minúsculas
inputCorreo.addEventListener("input", () => {
    inputCorreo.value = inputCorreo.value.toLowerCase();
});

// Teléfono: solo dígitos y máximo 8
inputTelefono.setAttribute("inputmode", "numeric");
inputTelefono.setAttribute("maxlength", "8");
inputTelefono.addEventListener("input", () => {
    inputTelefono.value = inputTelefono.value.replace(/\D/g, "").slice(0, 8);
});

// Regex
const regexCorreo = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const regexTelefono = /^\d{8}$/;

// Validación en tiempo real
inputNombre.addEventListener("input", () => {
    if (inputNombre.value.trim() === "") {
        errorNombre.textContent = "El nombre no puede estar vacío o lleva numeros.";
    } else {
        errorNombre.textContent = "";
    }
});

inputCorreo.addEventListener("input", () => {
    inputCorreo.value = inputCorreo.value.toLowerCase();
    if (!regexCorreo.test(inputCorreo.value.trim())) {
        errorCorreo.textContent = "Formato de correo inválido.";
    } else {
        errorCorreo.textContent = "";
    }
});

inputTelefono.addEventListener("input", () => {
    inputTelefono.value = inputTelefono.value.replace(/\D/g, "").slice(0, 8);
    if (!regexTelefono.test(inputTelefono.value.trim())) {
        errorTelefono.textContent = "El teléfono debe tener 8 dígitos.";
    } else {
        errorTelefono.textContent = "";
    }
});


function validarEmpresa() {
    const nombre = inputNombre.value.trim();
    const telefono = inputTelefono.value.trim();
    const correo = inputCorreo.value.trim();
    const empresa = document.getElementById("selectEmpresa").value;

    const regexCorreo = /^[a-z0-9._]+@[a-z]+\.[a-z]{3,}$/;
    const regexTelefono = /^\d{8}$/;

    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }
    if (!regexTelefono.test(telefono)) {
        showModalMensaje("advertencia", "Teléfono inválido", "Debe contener exactamente 8 dígitos.");
        inputTelefono.focus();
        return false;
    }
    if (!regexCorreo.test(correo)) {
        showModalMensaje("advertencia", "Correo inválido", "Usa solo minúsculas y formato válido (ej: usuario@dominio.com).");
        inputCorreo.focus();
        return false;
    }
    if (document.getElementById("selectEmpresa").value === 0) {
        showModalMensaje("advertencia", "Falta empresa", "Debe seleccionar una empresa.");
        document.getElementById("selectEmpresa").focus();
        return false;
    }
    return { nombre, correo, telefono, empresa: document.getElementById("selectEmpresa").value };
}


document.addEventListener("DOMContentLoaded", () => {
    cargarEmpresasActivas();
    cargarProveedores();
});

// Cargar datos al iniciar
function cargarEmpresasActivas() {
    fetch("http://localhost/TallerZelaya/php/obtenerEmpresasActivas.php")
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("selectEmpresa");
            select.innerHTML = '<option value="" disabled selected>Seleccionar empresa</option>';
            data.forEach(emp => {
                let option = document.createElement("option");
                option.value = emp.id_empresa;
                option.textContent = emp.nombre;
                select.appendChild(option);
            });
        })
        .catch(err => console.error("Error cargando empresas:", err));
}

// Cargar proveedores activos
function cargarProveedores() {
    fetch("http://localhost/TallerZelaya/php/obtenerProveedores.php")
        .then(res => res.json())
        .then(data => {
            proveedoresData = data;
            const tbody = document.querySelector(".tabla tbody");
            tbody.innerHTML = "";
            data.forEach(prov => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${prov.nombre}</td>
                    <td>${prov.correo}</td>
                    <td>${prov.telefono}</td>
                    <td>${prov.empresa}</td>
                    <td>
                        <button class="btn-editar" data-id="${prov.id_proveedor}"><img src="imgs/editar.png"></button>
                    </td>
                `;

                // Al dar clic en editar
                fila.querySelector(".btn-editar").addEventListener("click", (e) => {
                    filaSeleccionada = e.target.closest("tr");
                    idSeleccionado = e.target.closest("button").dataset.id;

                    modal.style.display = "flex";
                });

                tablaBody.appendChild(fila);
            });
        })
        .catch(err => console.error("Error cargando proveedores:", err));
}


btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();

    const datos = validarEmpresa();
    if (!datos) return; 

    empresa = document.getElementById("selectEmpresa").value;

    if (empresa === "0" || !empresa) {
        showModalMensaje("advertencia", "Falta empresa", "Debe seleccionar una empresa.");
        return;
    }

    // 🔎 Validar duplicados en proveedoresData
    const duplicado = proveedoresData.find(emp =>
        emp.nombre.toLowerCase() === datos.nombre.toLowerCase() ||
        emp.correo.toLowerCase() === datos.correo.toLowerCase() ||
        emp.telefono === datos.telefono
    );

    if (duplicado) {
        if (duplicado.correo.toLowerCase() === datos.correo.toLowerCase()) {
            showModalMensaje("advertencia", "Correo duplicado", "Este correo ya está registrado.");
            inputCorreo.focus();
            return;
        }
        if (duplicado.telefono === datos.telefono) {
            showModalMensaje("advertencia", "Teléfono duplicado", "Este teléfono ya está registrado.");
            inputTelefono.focus();
            return;
        }
    }

    fetch("http://localhost/TallerZelaya/php/ingresarProveedor.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${datos.nombre}` +
            `&correo=${datos.correo}` +
            `&telefono=${datos.telefono}` +
            `&id_empresa=${datos.empresa}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarProveedores();
                [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
                document.getElementById("selectEmpresa").selectedIndex = 0;
                inputNombre.focus();
            } else {
                showModalMensaje("error", "Error", data.mensaje || "No se pudo insertar el registro.");
            }
        })
        .catch(() => {
            showModalMensaje("error", "Error", "No se pudo conectar con el servidor.");
        })
        .finally(() => {
            btnRegistrar.dataset.busy = "0";
        });
});


const btnActualizar = document.querySelector(".btn-actualizar");

btnActualizar.addEventListener("click", () => {
    const nombre = inputs[0].value;
    const correo = inputs[2].value;
    const telefono = inputs[1].value;
    const empresa = document.getElementById("selectEmpresa").value;


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

        inputNombre.value = celdas[0].innerText; // Nombre
        inputCorreo.value = celdas[1].innerText; // Correo
        inputTelefono.value = celdas[2].innerText; // Teléfono

        // Establecer empresa en el select (buscando por nombre)
        const nombreEmpresa = celdas[3].innerText;
        const select = document.getElementById("selectEmpresa");
        for (let option of select.options) {
            if (option.text === nombreEmpresa) {
                select.value = option.value;
                break;
            }
        }

        modal.style.display = "none";
    }
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

//Relleno de tabla al buscar
function renderTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(prov => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.correo}</td>
            <td>${prov.telefono}</td>
            <td>${prov.empresa}</td>
            <td>
                <button class="btn-editar" data-id="${prov.id_proveedor}">
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


btnCancelarEdicion.addEventListener("click", () => {
    // Restaurar botones
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";

    // Limpiar inputs
    [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
    document.getElementById("selectEmpresa").selectedIndex = 0;

    // Resetear variables
    filaSeleccionada = null;
    idSeleccionado = null;

    inputNombre.focus();
    document.querySelector(".tabla-contenedor").classList.remove("bloqueada");
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
