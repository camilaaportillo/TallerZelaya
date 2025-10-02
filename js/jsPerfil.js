const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&._-])[A-Za-z\d!@#$%^&._-]{8,}$/;

// Regex para validar que solo contenga letras y números
const usuarioRegex = /^[a-zA-Z0-9]+$/;

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

    // Configurar event listeners para la funcionalidad de contraseñas
    configurarEventListeners();

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
        inputNuevoUsuario.value = document.getElementById("usuarioPerfil").textContent;
        
        // Limpiar mensajes de error al abrir
        const errorElement = document.getElementById("errorNuevoUsuario");
        if (errorElement) {
            errorElement.textContent = '';
        }
        inputNuevoUsuario.style.borderColor = '';
    };

    // Cerrar modal
    function cerrarModalEditar() {
        modalEditar.style.display = "none";
    }

    btnCancelarUsuario.addEventListener("click", cerrarModalEditar);
    btnCerrarModal.addEventListener("click", cerrarModalEditar);

    // Validación en tiempo real para el campo de usuario
    inputNuevoUsuario.addEventListener("input", function() {
        validarUsuarioInput(this, usuarioRegex, "Solo se permiten letras y números (sin espacios ni caracteres especiales)");
    });

    // Prevenir que se ingresen caracteres no permitidos
    inputNuevoUsuario.addEventListener("keypress", function(e) {
        const char = String.fromCharCode(e.keyCode || e.which);
        if (!usuarioRegex.test(char)) {
            e.preventDefault();
            return false;
        }
    });

    // Guardar cambios de usuario
    btnGuardarUsuario.addEventListener("click", async () => {
        const nuevoAlias = inputNuevoUsuario.value.trim();
        
        // Validaciones
        if (!nuevoAlias) {
            showModalMensaje("error", "Error de Validación", " El alias no puede estar vacío.");
            inputNuevoUsuario.style.borderColor = 'red';
            return;
        }

        if (!usuarioRegex.test(nuevoAlias)) {
            showModalMensaje("error", "Error de Validación", " El alias solo puede contener letras y números (sin espacios ni caracteres especiales).");
            inputNuevoUsuario.style.borderColor = 'red';
            return;
        }

        if (nuevoAlias.length < 3) {
            showModalMensaje("error", "Error de Validación", " El alias debe tener al menos 3 caracteres.");
            inputNuevoUsuario.style.borderColor = 'red';
            return;
        }

        if (nuevoAlias.length > 20) {
            showModalMensaje("error", "Error de Validación", " El alias no puede tener más de 20 caracteres.");
            inputNuevoUsuario.style.borderColor = 'red';
            return;
        }

        const usuario = window.obtenerUsuarioLogueado();
        if (!usuario || !usuario.usuario) {
            showModalMensaje("error", "Error de Sesión", " No se encontró el usuario.");
            return;
        }

        // Si el nuevo alias es igual al actual
        if (nuevoAlias === usuario.usuario) {
            showModalMensaje("info", "Sin Cambios", " El nuevo alias es igual al actual. No se realizaron cambios.");
            cerrarModalEditar();
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
                cerrarModalEditar();
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

        // Validación con regex
        if (!passwordRegex.test(nuevaContrasena)) {
            showModalMensaje("error", "Error de Validación", 
                "La nueva contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (!@#$%^&._-).");
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
                    showModalMensaje("advertencia", "Seguridad", " Por seguridad, se cerrara sesión después de cambiar la contraseña.");
                }, 2000);

                setTimeout(() => {
                    window.cerrarSesion();
                }, 5000);
                
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }

        } catch (error) {
            console.error("Error cambiando contraseña:", error);
            showModalMensaje("error", "Error Interno", " Error al cambiar la contraseña.");
        }
    });
});

// Función para validar inputs de usuario (solo letras y números)
function validarUsuarioInput(inputElement, regex, mensajeError) {
    const valor = inputElement.value;
    
    // Crear o obtener elemento de error
    let errorElement = document.getElementById("errorNuevoUsuario");
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = "errorNuevoUsuario";
        errorElement.className = 'error-message';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        inputElement.parentNode.appendChild(errorElement);
    }
    
    if (valor === '') {
        inputElement.style.borderColor = '';
        errorElement.textContent = '';
    } else if (!regex.test(valor)) {
        inputElement.style.borderColor = 'red';
        errorElement.textContent = mensajeError;
    } else {
        inputElement.style.borderColor = 'green';
        errorElement.textContent = '';
    }
}

// Función para configurar event listeners de contraseñas
function configurarEventListeners() {
    // Validación de inputs de contraseña
    document.getElementById("nuevaContrasena").addEventListener("input", function() {
        validarInput(this, passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
    });

    document.getElementById("confirmarContrasena").addEventListener("input", function() {
        validarInput(this, passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
        validarCoincidenciaContrasenas();
    });

    // Toggle para mostrar/ocultar contraseñas individuales
    document.getElementById("toggleActualContrasena").addEventListener("click", function() {
        togglePasswordVisibility('actualContrasena', this);
    });
    
    document.getElementById("toggleNuevaContrasena").addEventListener("click", function() {
        togglePasswordVisibility('nuevaContrasena', this);
    });
    
    document.getElementById("toggleConfirmarContrasena").addEventListener("click", function() {
        togglePasswordVisibility('confirmarContrasena', this);
    });
    
    // Toggle para mostrar/ocultar todas las contraseñas
    document.getElementById("toggleAllPasswords").addEventListener("change", function() {
        toggleAllPasswords(this.checked);
    });
}

// Función para validar inputs de contraseña
function validarInput(inputElement, regex, mensajeError) {
    const valor = inputElement.value;
    const errorElement = document.getElementById(`error${capitalizeFirstLetter(inputElement.id)}`);
    
    if (!errorElement) return;
    
    if (valor === '') {
        inputElement.style.borderColor = '';
        errorElement.textContent = '';
    } else if (!regex.test(valor)) {
        inputElement.style.borderColor = 'red';
        errorElement.textContent = mensajeError;
        errorElement.className = 'error-message';
    } else {
        inputElement.style.borderColor = 'green';
        errorElement.textContent = 'Contraseña válida';
        errorElement.className = 'success-message';
    }
}

// Función para validar que las contraseñas coincidan
function validarCoincidenciaContrasenas() {
    const nuevaContrasena = document.getElementById("nuevaContrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;
    const errorElement = document.getElementById("errorConfirmarContrasena");
    
    if (!errorElement) return;
    
    if (confirmarContrasena && nuevaContrasena !== confirmarContrasena) {
        document.getElementById("confirmarContrasena").style.borderColor = 'red';
        errorElement.textContent = 'Las contraseñas no coinciden';
        errorElement.className = 'error-message';
        return false;
    } else if (confirmarContrasena && nuevaContrasena === confirmarContrasena) {
        document.getElementById("confirmarContrasena").style.borderColor = 'green';
        errorElement.textContent = 'Las contraseñas coinciden';
        errorElement.className = 'success-message';
        return true;
    }
    return true;
}

// Función para mostrar/ocultar contraseña individual
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Función para mostrar/ocultar todas las contraseñas
function toggleAllPasswords(show) {
    const passwordInputs = [
        'actualContrasena',
        'nuevaContrasena', 
        'confirmarContrasena'
    ];
    
    passwordInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        const toggleButton = document.getElementById(`toggle${capitalizeFirstLetter(inputId)}`);
        
        if (input && toggleButton) {
            const icon = toggleButton.querySelector('i');
            
            if (show) {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    });
}

// Asegúrate de que estas funciones estén definidas
function cambiarContrasena() {
    document.getElementById("modalContrasena").style.display = "flex";
}

function cerrarModalContrasena() {
    document.getElementById("modalContrasena").style.display = "none";
    // Limpiar campos al cerrar
    document.getElementById("formContrasena").reset();
    
    // Limpiar mensajes de error
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.textContent = '';
    });
    
    // Resetear bordes
    document.querySelectorAll('#formContrasena input').forEach(input => {
        input.style.borderColor = '';
    });
    
    // Resetear toggle de mostrar contraseñas
    document.getElementById('toggleAllPasswords').checked = false;
    toggleAllPasswords(false);
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
    } else if (tipo === "info") {
        modalIcono.classList.add("icono-advertencia");
        modalIcono.innerHTML = "ℹ";
    }

    modalTitulo.innerText = titulo;
    modalTexto.innerText = texto;
    modalMensaje.style.display = "flex";

    // Auto cerrar después de 5 segundos para mensajes de éxito/advertencia/info
    if (tipo === "exito" || tipo === "advertencia" || tipo === "info") {
        setTimeout(() => { 
            modalMensaje.style.display = "none"; 
        }, 5000);
    }
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

// Función auxiliar para capitalizar la primera letra
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}