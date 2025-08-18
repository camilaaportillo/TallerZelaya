document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalAcciones");
    const cerrarModal = document.getElementById("cerrarModal");
    const btnEditarModal = document.getElementById("btnEditarModal");
    const btnEliminarModal = document.getElementById("btnEliminarModal");
    const btnRegistrar = document.querySelector(".btn-registrar");
    const inputs = document.querySelectorAll(".formulario input, .formulario select");

    // Abrir modal al dar click en editar
    document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            filaSeleccionada = e.target.closest("tr");
            modal.style.display = "flex";
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
        if (filaSeleccionada) {
            const celdas = filaSeleccionada.querySelectorAll("td");

            inputs[0].value = celdas[1].innerText; // Nombre repuesto
            inputs[1].value = celdas[2].innerText; // Descripción
            inputs[2].value = celdas[3].innerText; // Stock mínimo

            // Cambiar texto del botón
            btnRegistrar.textContent = "Editar repuesto";

            modal.style.display = "none";
        }
    });

    // Acción Eliminar (simple alert por ahora)
    btnEliminarModal.addEventListener("click", () => {
        if (filaSeleccionada) {
            filaSeleccionada.remove();
            modal.style.display = "none";
        }
    });
});

let filaSeleccionada = null;

    function irInicio() {
        alert("Volviendo a la pantalla de inicio...");
    }

    function toggleMenu() {
        document.getElementById("menuUsuario").classList.toggle("mostrar");
    }

    window.onclick = function (e) {
        if (!e.target.closest('.usuario')) {
            document.getElementById("menuUsuario").classList.remove("mostrar");
        }
    }
