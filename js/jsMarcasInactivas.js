// jsMarcasInactivas.js

// Variables globales
let marcasInactivasData = [];
let marcaSeleccionada = null;

// Elementos del DOM
const tbodyMarcasInactivas = document.getElementById("tbodyMarcasInactivas");
const inputBuscarInactivas = document.getElementById("inputBuscarInactivas");
const btnLimpiarInactivas = document.getElementById("btnLimpiarInactivas");

const modalConfirmarHabilitar = document.getElementById("modalConfirmarHabilitar");
const btnConfirmarHabilitar = document.getElementById("btnConfirmarHabilitar");

const modalMensaje = document.getElementById("modalMensajeInactivas");
const modalIcono = document.getElementById("modalIconoInactivas");
const modalTitulo = document.getElementById("modalTituloInactivas");
const modalTexto = document.getElementById("modalTextoInactivas");
const cerrarMensaje = document.getElementById("cerrarMensajeInactivas");

// Función para cargar marcas inactivas desde PHP
document.addEventListener("DOMContentLoaded", () => {
    cargarMarcasInactivas();
});

function cargarMarcasInactivas() {
    fetch("http://localhost/TallerZelaya/php/obtenerMarcasInactivas.php")
        .then(res => res.json())
        .then(data => {
            marcasInactivasData = data;
            renderTablaInactivos(data);
        })
        .catch(err => console.error("Error cargando marcas inactivas:", err));
}

// Renderizar tabla
function renderTablaInactivos(datos) {
    tbodyMarcasInactivas.innerHTML = "";

    if (datos.length === 0) {
        tbodyMarcasInactivas.innerHTML = `<tr><td colspan="3">No hay marcas inactivas</td></tr>`;
        return;
    }

    datos.forEach(marca => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${marca.nombre}</td>
            <td>${marca.estado}</td>
            <td>
                <button class="btn-habilitar" onclick="mostrarConfirmarHabilitar(${marca.id_marca})">
                    Habilitar
                </button>
            </td>
        `;
        tbodyMarcasInactivas.appendChild(tr);
    });
}

// Mostrar modal de confirmación
function mostrarConfirmarHabilitar(id) {
    marcaSeleccionada = id;
    modalConfirmarHabilitar.style.display = "block";
}

// Confirmar habilitación
btnConfirmarHabilitar.addEventListener("click", () => {
    if (!marcaSeleccionada) return;

    fetch("http://localhost/TallerZelaya/php/habilitarMarca.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id=" + marcaSeleccionada
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cerrarModalConfirmarHabilitar();
            cargarMarcasInactivas();
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(err => console.error("Error habilitando marca:", err));
});

// Cerrar modal de confirmación
function cerrarModalConfirmarHabilitar() {
    modalConfirmarHabilitar.style.display = "none";
    marcaSeleccionada = null;
}

// Mostrar mensaje modal
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

    setTimeout(() => {
        modalMensaje.style.display = "none";
    }, 3000);
}

cerrarMensaje.addEventListener("click", () => {
    modalMensaje.style.display = "none";
});

// Buscar marcas
inputBuscarInactivas.addEventListener("input", () => {
    const texto = inputBuscarInactivas.value.toLowerCase().trim();
    if (texto) {
        btnLimpiarInactivas.style.display = "inline";
        const filtrados = marcasInactivasData.filter(m =>
            m.nombre.toLowerCase().includes(texto) ||
            m.estado.toLowerCase().includes(texto)
        );
        renderTablaInactivos(filtrados);
    } else {
        btnLimpiarInactivas.style.display = "none";
        renderTablaInactivos(marcasInactivasData);
    }
});

// Limpiar búsqueda
btnLimpiarInactivas.addEventListener("click", () => {
    inputBuscarInactivas.value = "";
    btnLimpiarInactivas.style.display = "none";
    renderTablaInactivos(marcasInactivasData);
    inputBuscarInactivas.focus();
});

// Funciones de navegación
function irInicio() {
    window.location.href = "index.html";
}
function toggleMenu() {
    document.getElementById("menuUsuario").classList.toggle("mostrar");
}
window.onclick = function(e) {
    if (!e.target.closest('.usuario')) {
        document.getElementById("menuUsuario").classList.remove("mostrar");
    }
};
