document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modalAcciones");
    const cerrarModal = document.getElementById("cerrarModal");
    const btnEditarModal = document.getElementById("btnEditarModal");
    const btnEliminarModal = document.getElementById("btnEliminarModal");
    const btnRegistrar = document.querySelector(".btn-registrar");
    const inputs = document.querySelectorAll(".formulario input, .formulario select");

    // ✅ VERIFICAR SI ESTAMOS EN UNA PÁGINA QUE TIENE EL MODAL
    if (!modal || !cerrarModal) {
        console.log("No estamos en una página con modal de acciones");
        return; // Salir si no estamos en la página correcta
    }

    // Abrir modal al dar click en editar
    document.querySelectorAll(".btn-editar").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            filaSeleccionada = e.target.closest("tr");
            modal.style.display = "flex";
        });
    });

    // ✅ VERIFICAR QUE cerrarModal EXISTE ANTES DE AGREGAR EVENTO
    if (cerrarModal) {
        cerrarModal.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    // Click fuera del modal
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });

    // ✅ VERIFICAR QUE LOS ELEMENTOS EXISTEN ANTES DE USARLOS
    if (btnEditarModal) {
        btnEditarModal.addEventListener("click", () => {
            if (filaSeleccionada) {
                const celdas = filaSeleccionada.querySelectorAll("td");

                inputs[0].value = celdas[1].innerText; // Nombre repuesto
                inputs[1].value = celdas[2].innerText; // Descripción
                inputs[2].value = celdas[3].innerText; // Stock mínimo

                // Cambiar texto del botón
                if (btnRegistrar) {
                    btnRegistrar.textContent = "Editar repuesto";
                }

                modal.style.display = "none";
            }
        });
    }

    if (btnEliminarModal) {
        btnEliminarModal.addEventListener("click", () => {
            if (filaSeleccionada) {
                filaSeleccionada.remove();
                modal.style.display = "none";
            }
        });
    }
});

let filaSeleccionada = null;

function irInicio() {
    window.location.href = "index.html";
}

function toggleMenu() {
    const menuUsuario = document.getElementById("menuUsuario");
    if (menuUsuario) {
        menuUsuario.classList.toggle("mostrar");
    }
}

window.onclick = function (e) {
    if (!e.target.closest('.usuario')) {
        const menuUsuario = document.getElementById("menuUsuario");
        if (menuUsuario) {
            menuUsuario.classList.remove("mostrar");
        }
    }
}