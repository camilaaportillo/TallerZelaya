const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&._-])[A-Za-z\d!@#$%^&._-]{8,}$/;

// Función para validar inputs
function validarInput(inputElement, regex, mensajeError) {
    const valor = inputElement.value;
    const mensajeElement = inputElement.nextElementSibling; // Asumiendo que el mensaje está después del input
    
    // Verificar si existe un elemento para mostrar mensajes
    let mensajeErrorElement = inputElement.parentNode.querySelector('.error-message');
    
    // Si no existe, crear uno
    if (!mensajeErrorElement) {
        mensajeErrorElement = document.createElement('div');
        mensajeErrorElement.className = 'error-message';
        mensajeErrorElement.style.color = 'red';
        mensajeErrorElement.style.fontSize = '12px';
        mensajeErrorElement.style.marginTop = '5px';
        inputElement.parentNode.appendChild(mensajeErrorElement);
    }
    
    if (valor === '') {
        inputElement.style.borderColor = '';
        mensajeErrorElement.textContent = '';
    } else if (!regex.test(valor)) {
        inputElement.style.borderColor = 'red';
        mensajeErrorElement.textContent = mensajeError;
    } else {
        inputElement.style.borderColor = 'green';
        mensajeErrorElement.textContent = '';
    }
}

configurarEventListeners();

function configurarEventListeners() {
    document.getElementById("nuevaContrasena").addEventListener("input", () => {
        validarInput(document.getElementById("nuevaContrasena"), passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
    });

    document.getElementById("confirmarContrasena").addEventListener("input", () => {
        validarInput(document.getElementById("confirmarContrasena"), passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
    });
}
// Permitir cerrar el modal manualmente
cerrarMensaje.addEventListener("click", () => {
  modalMensaje.style.display = "none";
});


// js/jsPerfil.js
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar el usuario logueado desde sesion.js
    const usuario = window.obtenerUsuarioLogueado();
  
    if (!usuario) {
        showModalMensaje("error", "Error de Sesión", " No se encontró la sesión del usuario.");
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
            showModalMensaje("error", "Error de Validación", " El alias no puede estar vacío.");
            return;
        }

        const usuario = window.obtenerUsuarioLogueado();
        if (!usuario || !usuario.usuario) {
            showModalMensaje("error", "Error de Sesión", " No se encontró el usuario.");
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
                    showModalMensaje("advertencia", "Advertencia", " Se actualizará el alias. El sistema se cerrará automáticamente.");
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
            showModalMensaje("error", "Error Interno", " Error al actualizar el usuario.");
        }
    });

   // ---------------------------
    // MODAL CAMBIAR CONTRASEÑA
    // ---------------------------
    const modalContrasena = document.getElementById("modalContrasena");
    const btnGuardarContrasena = document.getElementById("btnGuardarContrasena");
    const formContrasena = document.getElementById("formContrasena");

    // Guardar nueva contraseña
   // En tu jsPerfil.js - versión normal
    btnGuardarContrasena.addEventListener("click", async () => {

    const actualContrasena = document.getElementById("actualContrasena").value.trim();
    const nuevaContrasena = document.getElementById("nuevaContrasena").value.trim();
    const confirmarContrasena = document.getElementById("confirmarContrasena").value.trim();
   

   

    // Validaciones básicas
    if (!actualContrasena || !nuevaContrasena || !confirmarContrasena) {
        showModalMensaje("error", "Error de Validación", " Todos los campos son obligatorios.");
        return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
        showModalMensaje("error", "Error de Validación", " Las nuevas contraseñas no coinciden.");
        return;
    }

    if (actualContrasena === nuevaContrasena) {
        showModalMensaje("error", "Error de Validación", " La nueva contraseña debe ser diferente a la actual.");
        return;
    }

    if (nuevaContrasena.length < 6) {
        showModalMensaje("error", "Error de Validación", " La nueva contraseña debe tener al menos 6 caracteres.");
        return;
    }

    try {
        const formData = new FormData();
        formData.append("actualContrasena", actualContrasena);
        formData.append("nuevaContrasena", nuevaContrasena);
        formData.append("confirmarContrasena", confirmarContrasena);

        const resp = await fetch("php/cambiarPassword.php", {
            method: "POST",
            body: formData
        });

        const data = await resp.json();

        if (data.status === "success") {
            showModalMensaje("exito", "Contraseña Actualizada", data.mensaje);
            cerrarModalContrasena();
            
            // Mostrar mensaje de seguridad
            setTimeout(() => {
                showModalMensaje("advertencia", "Seguridad", " Por seguridad, se recomienda cerrar sesión después de cambiar la contraseña.");
            }, 2000);

            setTimeout(() => {
                    window.cerrarSesion();
                }, 2000);
            
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }

    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        showModalMensaje("error", "Error Interno", " Error al cambiar la contraseña.");
    }
});
});

// Asegúrate de que estas funciones estén definidas
function cambiarContrasena() {
    document.getElementById("modalContrasena").style.display = "flex";
}

function cerrarModalContrasena() {
    document.getElementById("modalContrasena").style.display = "none";
    // Limpiar campos al cerrar
    document.getElementById("formContrasena").reset();
}
 

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
