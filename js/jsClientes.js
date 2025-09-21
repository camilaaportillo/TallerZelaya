let filaSeleccionada = null;
let idSeleccionado = null;

const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnActualizar = document.querySelector(".btn-actualizar");

// Inputs del formulario de clientes
const inputNombre = document.getElementById("inputNombre");
const inputApellido = document.getElementById("inputApellido");
const inputTelefono = document.getElementById("inputTelefono");
const inputCorreo = document.getElementById("inputCorreo");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");

let clientesData = [];

// Modal de mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

function validarCliente() {
    const nombre = inputNombre.value.trim();
    const apellido = inputApellido.value.trim();
    const telefono = inputTelefono.value.trim();
    const correo = inputCorreo.value.trim();

    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }

    return { nombre, apellido, telefono, correo };
}

// Cargar datos
document.addEventListener("DOMContentLoaded", cargarClientes);

function cargarClientes() {
    fetch("http://localhost/TallerZelaya/php/obtenerClientes.php")
        .then(res => res.json())
        .then(data => {
            clientesData = data;
            mostrarTabla(data);
        })
        .catch(err => console.error("Error cargando clientes:", err));
}

function mostrarTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(cliente => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${cliente.apellido}</td>
            <td>${cliente.telefono ?? ""}</td>
            <td>${cliente.correo ?? ""}</td>
            <td>${cliente.estado}</td>
            <td>
                <button class="btn-editar" data-id="${cliente.id_cliente}">
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

// Registrar cliente
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();

    const datos = validarCliente();
    if (!datos) return;

    fetch("http://localhost/TallerZelaya/php/ingresarClientes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${encodeURIComponent(datos.nombre)}&apellido=${encodeURIComponent(datos.apellido)}&telefono=${encodeURIComponent(datos.telefono)}&correo=${encodeURIComponent(datos.correo)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarClientes();
            inputNombre.value = "";
            inputApellido.value = "";
            inputTelefono.value = "";
            inputCorreo.value = "";
        } else if (data.status === "duplicado") {
            showModalMensaje("advertencia", "Duplicado", data.mensaje);
            inputNombre.focus();
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(() => {
        showModalMensaje("error", "Error", "No se pudo conectar con el servidor.");
    });
});

// Actualizar cliente
btnActualizar.addEventListener("click", () => {
    const datos = validarCliente();
    if (!datos) return;

    fetch("http://localhost/TallerZelaya/php/editarClientes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&nombre=${encodeURIComponent(datos.nombre)}&apellido=${encodeURIComponent(datos.apellido)}&telefono=${encodeURIComponent(datos.telefono)}&correo=${encodeURIComponent(datos.correo)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarClientes();

            // Resetear formulario
            inputNombre.value = "";
            inputApellido.value = "";
            inputTelefono.value = "";
            inputCorreo.value = "";
            idSeleccionado = null;

            btnRegistrar.style.display = "inline-block";
            btnActualizar.style.display = "none";
            btnCancelarEdicion.style.display = "none"; 
            document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(() => {
        showModalMensaje("error", "Error", "No se pudo editar el registro.");
    });
});

// Eliminar cliente
btnEliminarModal.addEventListener("click", () => {
    if (!idSeleccionado) {
        alert("No se ha seleccionado ningún cliente.");
        return;
    }
    abrirModalConfirmar();
    document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
        cerrarModalConfirmar();
        fetch("http://localhost/TallerZelaya/php/eliminarCliente.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id_cliente=${idSeleccionado}`
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarClientes();
                modal.style.display = "none";
                idSeleccionado = null;
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(() => {
            showModalMensaje("error", "Error", "No se pudo dar de baja el cliente.");
        });
    });
});

// Modal Acciones
cerrarModal.addEventListener("click", () => modal.style.display = "none");

btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        const celdas = filaSeleccionada.querySelectorAll("td");
        inputNombre.value = celdas[0].innerText;
        inputApellido.value = celdas[1].innerText;
        inputTelefono.value = celdas[2].innerText;
        inputCorreo.value = celdas[3].innerText;

        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        document.querySelector(".tabla-contenedor").classList.add("tabla-bloqueada");
        modal.style.display = "none";
    }
});

btnCancelarEdicion.addEventListener("click", () => {
    inputNombre.value = ""; 
    inputApellido.value = ""; 
    inputTelefono.value = ""; 
    inputCorreo.value = ""; 
    idSeleccionado = null;  

    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none"; 
    document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
});

// Búsqueda
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline";
        const filtrados = clientesData.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            c.apellido.toLowerCase().includes(texto)
        );
        mostrarTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none";
        mostrarTabla(clientesData);
    }
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    mostrarTabla(clientesData);
    inputBuscar.focus();
});

// Modal de mensajes
function showModalMensaje(tipo, titulo, texto) {
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
    setTimeout(() => { modalMensaje.style.display = "none"; }, 3000);
}

cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");

// Confirmar eliminar
function abrirModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "block";
}
function cerrarModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

// Menú usuario
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
};
