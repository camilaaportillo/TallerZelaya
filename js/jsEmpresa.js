let filaSeleccionada = null;
let idSeleccionado = null;


const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const inputs = document.querySelectorAll(".formulario input, .formulario select");

const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");


// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", cargarEmpresas);


function cargarEmpresas() {
    fetch("http://localhost/TallerZelaya/php/obtenerEmpresas.php")
        .then(res => res.json())
        .then(data => {
            tablaBody.innerHTML = ""; // Limpia tabla
            data.forEach(empresa => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${empresa.nombre}</td>
                    <td>${empresa.correo}</td>
                    <td>${empresa.telefono}</td>
                    <td>
                        <button class="btn-editar" data-id="${empresa.id_empresa}"><img src="imgs/editar.png" alt="Editar"></button>
                    </td>
                `;

                // Al dar clic en editar
                fila.querySelector(".btn-editar").addEventListener("click", (e) => {
                    filaSeleccionada = e.target.closest("tr");
                    idSeleccionado = e.target.closest("button").dataset.id; // ⚡ guardamos id

                    modal.style.display = "flex";
                });

                tablaBody.appendChild(fila);
            });
        })
        .catch(err => console.error("Error cargando empresas:", err));
}


// Registrar nueva empresa
btnRegistrar.addEventListener("click", () => {
    const nombre = document.querySelectorAll(".formulario input")[0].value;
    const correo = document.querySelectorAll(".formulario input")[1].value;
    const telefono = document.querySelectorAll(".formulario input")[2].value;

    alert("Datos a enviar:\n" + `Nombre: ${nombre}\nCorreo: ${correo}\nTeléfono: ${telefono}`);

    fetch("http://localhost/TallerZelaya/php/ingresarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${nombre}&correo=${correo}&telefono=${telefono}`
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            cargarEmpresas(); // refrescar tabla después de insertar
            document.querySelectorAll(".formulario input").forEach(input => input.value = ""); // Limpiar inputs
        });
});


const btnActualizar = document.querySelector(".btn-actualizar");

btnActualizar.addEventListener("click", () => {
    const nombre = inputs[0].value;
    const correo = inputs[1].value;
    const telefono = inputs[2].value;

    fetch("http://localhost/TallerZelaya/php/editarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&nombre=${nombre}&correo=${correo}&telefono=${telefono}`
    })
        .then(res => res.text())
        .then(data => {
            alert(data);
            cargarEmpresas();
            document.querySelectorAll(".formulario input").forEach(input => input.value = ""); // Limpiar inputs
            // Reset botones
            btnActualizar.style.display = "none";
            btnRegistrar.style.display = "inline-block";
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

    if (filaSeleccionada && idSeleccionado) {
        alert("Editando empresa con ID: " + idSeleccionado);
        // Cambiar botones
        document.querySelector(".btn-registrar").style.display = "none";
        document.querySelector(".btn-actualizar").style.display = "inline-block";

        const celdas = filaSeleccionada.querySelectorAll("td");

        inputs[0].value = celdas[0].innerText; // Nombre empresa
        inputs[1].value = celdas[1].innerText; // Correo
        inputs[2].value = celdas[2].innerText; // Teléfono

        modal.style.display = "none";
    }
});

const btnEliminar = document.getElementById("btnEliminarModal");

btnEliminar.addEventListener("click", () => {
    if (!idSeleccionado) {
        alert("No se ha seleccionado ninguna empresa.");
        return;
    }

    // Confirmación antes de eliminar
    if (!confirm("¿Estás seguro de que deseas eliminar esta empresa?")) return;

    fetch("http://localhost/TallerZelaya/php/eliminarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}`
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        cargarEmpresas(); // recarga la tabla
        modal.style.display = "none"; // cerrar modal
        idSeleccionado = null; // limpiar selección
    });
});




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
