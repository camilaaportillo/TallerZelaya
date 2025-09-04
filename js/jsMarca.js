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

const inputNombre = document.getElementById("inputNombre");
const inputEstado = document.getElementById("inputEstado");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");

let marcasData = [];

// Modal de mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

function validarMarca() {
    const nombre = inputNombre.value.trim();

    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }
    return { nombre };
}

// Cargar datos
document.addEventListener("DOMContentLoaded", cargarMarcas);

function cargarMarcas() {
    fetch("http://localhost/TallerZelaya/php/obtenerMarcas.php")
        .then(res => res.json())
        .then(data => {
            marcasData = data;
            mostrarDTabla(data);
        })
        .catch(err => console.error("Error cargando marcas:", err));
}

function mostrarDTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(marca => {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>${marca.nombre}</td>
            <td>${marca.estado}</td>
            <td>
                <button class="btn-editar" data-id="${marca.id_marca}">
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

// Registrar marca
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();

    const datos = validarMarca();
    if (!datos) return;

    fetch("http://localhost/TallerZelaya/php/ingresarMarca.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${datos.nombre}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarMarcas();
                inputNombre.value = "";
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(() => showModalMensaje("error", "Error", "No se pudo conectar con el servidor."));
});

// Actualizar marca
btnActualizar.addEventListener("click", () => {
    
    const nombre = inputNombre.value;
    

    fetch("http://localhost/TallerZelaya/php/editarMarca.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&nombre=${nombre}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarMarcas();
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(() => {
            showModalMensaje("error", "Error", "No se pudo editar el registro.");
        });
});

// Eliminar marca
btnEliminarModal.addEventListener("click", () => {
    if (!idSeleccionado) {
        alert("No se ha seleccionado ninguna marca.");
        return;
    }
    abrirModalConfirmar();
    document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
        cerrarModalConfirmar();
        fetch("http://localhost/TallerZelaya/php/eliminarMarca.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${idSeleccionado}`
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "exito") {
                    showModalMensaje("exito", "Éxito", data.mensaje);
                    cargarMarcas();
                    modal.style.display = "none";
                    idSeleccionado = null;
                } else {
                    showModalMensaje("error", "Error", data.mensaje);
                }
            })
            .catch(() => {
                showModalMensaje("error", "Error", "No se pudo deshabilitar el registro.");
            });
    });
});

// Modal Acciones
cerrarModal.addEventListener("click", () => modal.style.display = "none");

btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        const celdas = filaSeleccionada.querySelectorAll("td");
        inputNombre.value = celdas[0].innerText;

        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        document.getElementById("btnCancelarEdicion").style.display = "inline-block";
        

        modal.style.display = "none";
    }
    
});


btnCancelarEdicion.addEventListener("click", () => {
    inputNombre.value = ""; 
    idSeleccionado = null;  

    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none"; 
});


// Búsqueda en tabla
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline";
        const filtrados = marcasData.filter(m =>
            m.nombre.toLowerCase().includes(texto) ||
            m.estado.toLowerCase().includes(texto)
        );
        mostrarDTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none";
        mostrarDTabla(marcasData);
    }
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    mostrarDTabla(marcasData);
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


