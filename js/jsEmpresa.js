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
let empresasData = [];

const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Referencias directas a los 3 inputs
const inputNombre = document.querySelectorAll(".formulario input")[0];
const inputCorreo = document.querySelectorAll(".formulario input")[1];
const inputTelefono = document.querySelectorAll(".formulario input")[2];

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


function validarEmpresa() {
    const nombre = inputNombre.value.trim();
    const correo = inputCorreo.value.trim();
    const telefono = inputTelefono.value.trim();

    const regexCorreo = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const regexTelefono = /^\d{8}$/;

    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }
    if (!regexCorreo.test(correo)) {
        showModalMensaje("advertencia", "Correo inválido", "Usa solo minúsculas y formato válido (ej: usuario@dominio.com).");
        inputCorreo.focus();
        return false;
    }
    if (!regexTelefono.test(telefono)) {
        showModalMensaje("advertencia", "Teléfono inválido", "Debe contener exactamente 8 dígitos.");
        inputTelefono.focus();
        return false;
    }

    return { nombre, correo, telefono };
}


// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", cargarEmpresas);

function cargarEmpresas() {
    fetch("http://localhost/TallerZelaya/php/obtenerEmpresas.php")
        .then(res => res.json())
        .then(data => {
            empresasData = data;
            tablaBody.innerHTML = "";
            data.forEach(empresa => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${empresa.nombre}</td>
                    <td>${empresa.correo}</td>
                    <td>${empresa.telefono}</td>
                    <td>
                        <button class="btn-editar" data-id="${empresa.id_empresa}"><img src="imgs/editar.png" alt="Editar"></button>
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
        .catch(err => console.error("Error cargando empresas:", err));
}



btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault(); // asegura que no ocurra ninguna acción por defecto

    // Evita doble clic mientras se procesa
    if (btnRegistrar.dataset.busy === "1") return;

    const datos = validarEmpresa();
    if (!datos) return; // <-- si falla, NO se ejecuta el fetch

    btnRegistrar.dataset.busy = "1";

    fetch("http://localhost/TallerZelaya/php/ingresarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(datos) // serializa seguro
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarEmpresas();
                [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
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
    const correo = inputs[1].value;
    const telefono = inputs[2].value;

    fetch("http://localhost/TallerZelaya/php/editarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&nombre=${nombre}&correo=${correo}&telefono=${telefono}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                document.querySelector(".btn-registrar").style.display = "inline-block";
                document.querySelector(".btn-actualizar").style.display = "none";
                btnCancelarEdicion.style.display = "none";
                cargarEmpresas();
                [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
                inputNombre.focus();
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

// Acción Editar → Poner datos en el formulario
btnEditarModal.addEventListener("click", () => {

    if (filaSeleccionada && idSeleccionado) {
        // Cambiar botones
        document.querySelector(".btn-registrar").style.display = "none";
        document.querySelector(".btn-actualizar").style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        const celdas = filaSeleccionada.querySelectorAll("td");

        inputs[0].value = celdas[0].innerText; // Nombre empresa
        inputs[1].value = celdas[1].innerText; // Correo
        inputs[2].value = celdas[2].innerText; // Teléfono

        modal.style.display = "none";


    }
});

btnCancelarEdicion.addEventListener("click", () => {
    // Restaurar botones
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";

    // Limpiar inputs
    [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");

    // Resetear variables
    filaSeleccionada = null;
    idSeleccionado = null;

    inputNombre.focus();
});


const btnEliminar = document.getElementById("btnEliminarModal");

btnEliminar.addEventListener("click", () => {
    if (!idSeleccionado) {
        showModalMensaje("advertencia", "Falta nombre", "No se ha seleccionado ninguna empresa.");
        return;
    }

    // Confirmación antes de eliminar
    abrirModalConfirmar();
    document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
        cerrarModalConfirmar();
        fetch("http://localhost/TallerZelaya/php/eliminarEmpresa.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${idSeleccionado}`
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "exito") {
                    showModalMensaje("exito", "Éxito", data.mensaje);
                    cargarEmpresas(); // recarga la tabla
                    modal.style.display = "none"; // cerrar modal
                    idSeleccionado = null; // limpiar selección
                    [inputNombre, inputCorreo, inputTelefono].forEach(i => i.value = "");
                    inputNombre.focus();
                } else {
                    showModalMensaje("error", "Error", data.mensaje);
                }
            })
            .catch(err => {
                showModalMensaje("error", "Error", "No se pudo eliminar el registro.");
            });
    });
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
    datos.forEach(empresa => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
                    <td>${empresa.nombre}</td>
                    <td>${empresa.correo}</td>
                    <td>${empresa.telefono}</td>
                    <td>
                        <button class="btn-editar" data-id="${empresa.id_empresa}"><img src="imgs/editar.png" alt="Editar"></button>
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
}


// Filtrar en tiempo real
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();

    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline"; // mostrar X
        const filtrados = empresasData.filter(emp =>
            emp.nombre.toLowerCase().includes(texto) ||
            emp.correo.toLowerCase().includes(texto) ||
            emp.telefono.toLowerCase().includes(texto)
        );
        renderTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none"; // ocultar X
        renderTabla(empresasData);
    }
});

// Limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    renderTabla(empresasData);
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

const btnHabilitarRegistro = document.getElementById("btn-habilitar-registro");

// Al dar clic en "Habilitar registro"
btnHabilitarRegistro.addEventListener("click", () => {
    // Ocultar formulario y mostrar botón volver
    document.querySelector(".formulario").style.display = "none";
    document.querySelector(".buscador-derecha").style.sisplay = "none";
    btnHabilitarRegistro.style.display = "none";
    btnVolver.style.display = "inline-block";

    // Cargar proveedores inactivos
    fetch("http://localhost/TallerZelaya/php/obtenerEmpresasInactivas.php")
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
        tablaBody.innerHTML = `<tr><td colspan="4">No hay proveedores inactivos</td></tr>`;
        return;
    }

    datos.forEach(prov => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${prov.nombre}</td>
            <td>${prov.correo}</td>
            <td>${prov.telefono}</td>
            <td>
                <button class="btn-habilitar" data-id="${prov.id_empresa}">
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
    fetch("http://localhost/TallerZelaya/php/habilitarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${id}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);

                // Recargar lista de inactivos
                fetch("http://localhost/TallerZelaya/php/obtenerEmpresasInactivas.php")
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

btnVolver.addEventListener("click", () => {
    // Mostrar formulario y ocultar botón volver
    document.querySelector(".formulario").style.display = "flex";
    document.querySelector(".buscador-derecha").style.display = "flex";
    btnHabilitarRegistro.style.display = "inline-block";
    btnVolver.style.display = "none";

    // Cargar proveedores activos
    cargarEmpresas();
});