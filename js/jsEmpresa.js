let filaSeleccionada = null;
let idSeleccionado = null;


const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const inputs = document.querySelectorAll(".formulario input, .formulario select");

const formInputs = document.querySelectorAll(".formulario input");
const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnEditar = document.querySelector(".btn-actualizar");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar"); 
let empresasData = []; 

const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Cargar datos al iniciar
document.addEventListener("DOMContentLoaded", cargarEmpresas);

function cargarEmpresas() {
    fetch("http://localhost/TallerZelaya/php/obtenerEmpresas.php")
        .then(res => res.json())
        .then(data => {
            empresasData = data;
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
                    idSeleccionado = e.target.closest("button").dataset.id;

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

    fetch("http://localhost/TallerZelaya/php/ingresarEmpresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${nombre}&correo=${correo}&telefono=${telefono}`
    })
        .then(res => res.text())
        .then(data => {
            showModalMensaje("exito", "Éxito", "La empresa se registró correctamente");
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
    window.location.href = "index.html";
}

function toggleMenu() {
    document.getElementById("menuUsuario").classList.toggle("mostrar");
}

window.onclick = function (e) {
    if (!e.target.closest('.usuario')) {
        document.getElementById("menuUsuario").classList.remove("mostrar");
    }
}

// Hacer focus en el primer input al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    if (formInputs.length > 0) {
        formInputs[0].focus();
    }
});

// Navegación con Enter
formInputs.forEach((input, index) => {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // evitar submit accidental

            // Si no es el último input → pasar al siguiente
            if (index < formInputs.length - 1) {
                formInputs[index + 1].focus();
            } else {
                // Si es el último input → enfocar botón correcto
                if (btnRegistrar.style.display !== "none") {
                    btnRegistrar.focus();
                } else if (btnEditar.style.display !== "none") {
                    btnEditar.focus();
                }
            }
        }
    });
});

//Relleno de tabla al buscar
function renderTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(empresa => {
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
                    idSeleccionado = e.target.closest("button").dataset.id;

                    modal.style.display = "flex";
                });

                tablaBody.appendChild(fila);
    });
}


// Filtrar en tiempo real
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();

    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline"; // mostrar X
        const filtrados = empresasData.filter(emp =>
            emp.nombre.toLowerCase().includes(texto) ||
            emp.correo.toLowerCase().includes(texto) ||
            emp.telefono.toLowerCase().includes(texto)
        );
        renderTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none"; // ocultar X
        renderTabla(empresasData);
    }
});

// Limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    renderTabla(empresasData);
    inputBuscar.focus();
});


function showModalMensaje(tipo, titulo, texto) {
    // Resetear icono
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

    // Cerrar automático en 3 segundos
    setTimeout(() => {
        modalMensaje.style.display = "none";
    }, 3000);
}

// Botón de cerrar
cerrarMensaje.addEventListener("click", () => {
    modalMensaje.style.display = "none";
});

// Cerrar si se hace click fuera
window.addEventListener("click", (e) => {
    if (e.target === modalMensaje) {
        modalMensaje.style.display = "none";
    }
});