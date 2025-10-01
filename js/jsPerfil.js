const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Permitir cerrar el modal manualmente
cerrarMensaje.addEventListener("click", () => {
  modalMensaje.style.display = "none";
});


// js/jsPerfil.js
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar el usuario logueado desde sesion.js
    const usuario = window.obtenerUsuarioLogueado();

    if (!usuario) {
        showModalMensaje("error", "Error de Sesión", "⚠️ No se encontró la sesión del usuario.");
        setTimeout(() => window.location.href = "login.html", 2000);
        return;
    }

    // Mostrar datos en el perfil
    document.getElementById("nombrePerfil").textContent = usuario.nombre;
    document.getElementById("usuarioPerfil").textContent = usuario.usuario || "Sin usuario";
    document.getElementById("correoPerfil").textContent = usuario.correo || "Sin correo";
    

    // También actualizar header
    const nombreUsuarioHeader = document.getElementById("usuarioPerfil");
    if (nombreUsuarioHeader) {
        nombreUsuarioHeader.textContent = usuario.usuario;
    }

    // Mostrar body después de cargar datos
    document.body.style.visibility = "visible";

    // ---------------------------
    // MODAL EDITAR USUARIO
    // ---------------------------
    const modalEditar = document.getElementById("modalEditarUsuario");
    const inputNuevoUsuario = document.getElementById("nuevoUsuario");
    const btnGuardarUsuario = document.getElementById("btnGuardarUsuario");
    const btnCancelarUsuario = document.getElementById("btnCancelarUsuario");
    const btnCerrarModal = document.getElementById("cerrarModal");

    // Abrir modal
    window.editarPerfil = function () {
        modalEditar.style.display = "flex";
    };

    // Cerrar modal
    function cerrarModalEditar() {
        modalEditar.style.display = "none";
    }

    btnCancelarUsuario.addEventListener("click", cerrarModalEditar);
    btnCerrarModal.addEventListener("click", cerrarModalEditar);

    // Guardar cambios de usuario
    btnGuardarUsuario.addEventListener("click", async () => {
        const nuevoAlias = inputNuevoUsuario.value.trim();
        if (!nuevoAlias) {
            showModalMensaje("error", "Error de Validación", "⚠️ El alias no puede estar vacío.");
            return;
        }

        const usuario = window.obtenerUsuarioLogueado();
        if (!usuario || !usuario.usuario) {
            showModalMensaje("error", "Error de Sesión", "❌ No se encontró el usuario.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("usuario_actual", usuario.usuario);
            formData.append("usuario_nuevo", nuevoAlias);

            const resp = await fetch("php/editarPerfil.php", {
                method: "POST",
                body: formData
            });

            const data = await resp.json();

            if (data.status === "success") {
                showModalMensaje("exito", "Actualización Exitosa", data.mensaje);

                // Cerrar sesión tras un alias cambiado
                setTimeout(() => {
                    showModalMensaje("advertencia", "Advertencia", "⚠️ Se actualizará el alias. El sistema se cerrará automáticamente.");
                }, 1500);

                setTimeout(() => {
                    window.cerrarSesion();
                }, 4000);
            } else if (data.status === "info") {
                showModalMensaje("advertencia", "Sin Cambios", data.mensaje);
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }

        } catch (error) {
            console.error(error);
            showModalMensaje("error", "Error Interno", "❌ Error al actualizar el usuario.");
        }
    });
});

// ---------------------------
// FUNCIONES DE UTILIDAD
// ---------------------------

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

function irInicio() {
    window.location.href = "index.html";
}

function toggleMenu() {
    document.getElementById("menuUsuario").classList.toggle("mostrar");
}

// Cerrar sesión
function cerrarSesion() {
    sessionStorage.clear(); 
    window.location.href = "login.html";
}
