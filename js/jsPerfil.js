// js/jsPerfil.js
document.addEventListener("DOMContentLoaded", () => {
    // Recuperar el usuario logueado desde sesion.js
    const usuario = window.obtenerUsuarioLogueado();

    if (!usuario) {
        alert("No se encontró la sesión del usuario.");
        window.location.href = "login.html"; // Redirigir al login si no hay sesión
        return;
    }

    // Mostrar datos en el perfil
    document.getElementById("nombrePerfil").textContent  = usuario.nombre ;
    document.getElementById("usuarioPerfil").textContent  = usuario.usuario || "Sin usuario";
    document.getElementById("correoPerfil").textContent  = usuario.correo || "Sin correo";
    document.getElementById("estadoPerfil").textContent  = usuario.estado ?? "Activo";

    // También actualizar header
    const nombreUsuarioHeader = document.getElementById("usuarioPerfil");
    if (nombreUsuarioHeader) {
        nombreUsuarioHeader.textContent =  usuario.usuario;
    }

    // Mostrar body después de cargar datos
    document.body.style.visibility = "visible";
});

// Funciones para botones del header
function irInicio() {
    window.location.href = "index.html";
}


// Cerrar sesión
function cerrarSesion() {
    sessionStorage.clear(); // Borra todos los datos de sesión
    window.location.href = "login.html";
}
