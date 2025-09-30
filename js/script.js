// js/script.js - Seguro para cualquier página
document.addEventListener("DOMContentLoaded", () => {
    let filaSeleccionada = null;

    // Elementos del modal
    const modal = document.getElementById("modalAcciones");
    const cerrarModal = document.getElementById("cerrarModal");
    const btnEditarModal = document.getElementById("btnEditarModal");
    const btnEliminarModal = document.getElementById("btnEliminarModal");
    const btnRegistrar = document.querySelector(".btn-registrar");
    const inputs = document.querySelectorAll(".formulario input, .formulario select");

    // Abrir modal al dar click en botones editar
    const botonesEditar = document.querySelectorAll(".btn-editar");
    if (modal && botonesEditar.length > 0) {
        botonesEditar.forEach((btn) => {
            btn.addEventListener("click", (e) => {
                filaSeleccionada = e.target.closest("tr");
                modal.style.display = "flex";
            });
        });
    }

    // Cerrar modal
    if (modal && cerrarModal) {
        cerrarModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Click fuera del modal
    if (modal) {
        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Acción Editar modal
    if (btnEditarModal && filaSeleccionada && inputs.length >= 3 && btnRegistrar) {
        btnEditarModal.addEventListener("click", () => {
            const celdas = filaSeleccionada.querySelectorAll("td");
            if (celdas.length >= 4) {
                inputs[0].value = celdas[1].innerText; // Nombre
                inputs[1].value = celdas[2].innerText; // Descripción
                inputs[2].value = celdas[3].innerText; // Stock mínimo

                btnRegistrar.textContent = "Editar repuesto";
                modal.style.display = "none";
            }
        });
    }

    // Acción Eliminar modal
    if (btnEliminarModal && filaSeleccionada && modal) {
        btnEliminarModal.addEventListener("click", () => {
            filaSeleccionada.remove();
            modal.style.display = "none";
        });
    }

    // Función irInicio
    window.irInicio = function () {
        window.location.href = "index.html";
    };

    // Función toggleMenu
    window.toggleMenu = function () {
        const menu = document.getElementById("menuUsuario");
        if (menu) menu.classList.toggle("mostrar");
    };

    // Click fuera del menú usuario
    window.addEventListener("click", (e) => {
        const menu = document.getElementById("menuUsuario");
        if (menu && !e.target.closest('.usuario')) {
            menu.classList.remove("mostrar");
        }
    });
});
