let filaSeleccionada = null;
let idSeleccionado = null;

const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnActualizar = document.querySelector(".btn-actualizar");

// Inputs del formulario de clientes
const inputNombre = document.getElementById("inputNombre");
const inputApellido = document.getElementById("inputApellido");
const inputTelefono = document.getElementById("inputTelefono");
const inputCorreo = document.getElementById("inputCorreo");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");

let clientesData = [];
let datosOriginales = {}; // Para almacenar los datos originales al editar

// Modal de mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Validar que solo contenga letras, espacios y acentos
function validarSoloLetras(texto) {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(texto);
}

// Validar formato de correo electrónico
function validarCorreo(correo) {
    if (!correo) return true; // Si está vacío, es válido (opcional)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

// Función para verificar si hay cambios
function hayCambios() {
    const nombreActual = inputNombre.value.trim();
    const telefonoActual = inputTelefono.value.trim();
    const correoActual = inputCorreo.value.trim();

    return nombreActual !== datosOriginales.nombre ||
           telefonoActual !== datosOriginales.telefono ||
           correoActual !== datosOriginales.correo;
}

function validarCliente() {
    const nombre = inputNombre.value.trim();
    let telefono = inputTelefono.value.trim().replace(/\D/g, ""); // solo números
    const correo = inputCorreo.value.trim();

    // Validar nombre (solo letras)
    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }

    if (!validarSoloLetras(nombre)) {
        showModalMensaje("advertencia", "Nombre inválido", "El nombre solo puede contener letras y espacios.");
        inputNombre.focus();
        return false;
    }

    // Validar teléfono
    if (telefono && telefono.length !== 8) {
        showModalMensaje("advertencia", "Teléfono inválido", "El teléfono debe tener 8 dígitos.");
        inputTelefono.focus();
        return false;
    }

    // Validar correo
    if (correo && !validarCorreo(correo)) {
        showModalMensaje("advertencia", "Correo inválido", "El correo debe tener un formato válido (ejemplo@dominio.com).");
        inputCorreo.focus();
        return false;
    }

    // Verificar si hay cambios (solo en modo edición)
    if (idSeleccionado && !hayCambios()) {
        showModalMensaje("advertencia", "Sin cambios", "No se realizaron cambios en los datos del cliente.");
        return false;
    }

    // Formatear teléfono antes de guardar (1234-5678)
    if (telefono.length === 8) {
        telefono = telefono.replace(/(\d{4})(\d{4})/, "$1-$2");
    }

    return { nombre, telefono, correo };
}

// Validar y formatear teléfono
inputTelefono.addEventListener("input", () => {
    // Permitir solo números
    inputTelefono.value = inputTelefono.value.replace(/\D/g, "");

    // Limitar a 8 dígitos
    if (inputTelefono.value.length > 8) {
        inputTelefono.value = inputTelefono.value.slice(0, 8);
    }
});

// Validar que el nombre solo contenga letras
inputNombre.addEventListener("input", () => {
    // Remover caracteres que no sean letras, espacios o acentos
    inputNombre.value = inputNombre.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "");
});

// Formatear teléfono al salir del input
inputTelefono.addEventListener("blur", () => {
    let tel = inputTelefono.value.replace(/\D/g, "");
    if (tel.length === 8) {
        inputTelefono.value = tel.replace(/(\d{4})(\d{4})/, "$1-$2");
    }
});

// Cargar datos
document.addEventListener("DOMContentLoaded", cargarClientes);

function cargarClientes() {
    fetch("php/obtenerClientes.php")
        .then(res => res.json())
        .then(data => {
            clientesData = data;
            mostrarTabla(data);
        })
        .catch(err => console.error("Error cargando clientes:", err));
}

// Función para mostrar guión si el campo está vacío o nulo
function mostrarCampo(valor) {
    return (valor === null || valor === "" || valor === undefined) ? "-" : valor;
}

// Función para obtener el valor real (sin guión) para editar
function obtenerValorReal(valor) {
    return (valor === "-") ? "" : valor;
}

function mostrarTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(cliente => {
        const fila = document.createElement("tr");

        // Usar mostrarCampo para mostrar guiones en campos vacíos
        fila.innerHTML = `
            <td>${cliente.nombre}</td>
            <td>${mostrarCampo(cliente.correo)}</td>
            <td>${mostrarCampo(cliente.telefono)}</td>
            <td>
                <button class="btn-editar" data-id="${cliente.id_cliente}">
                    <img src="imgs/editar.png" alt="Editar">
                </button>
            </td>
        `;

        fila.querySelector(".btn-editar").addEventListener("click", (e) => {
            filaSeleccionada = e.target.closest("tr");
            idSeleccionado = e.target.closest("button").dataset.id;
            modal.style.display = "flex";
        });

        tablaBody.appendChild(fila);
    });
}

// Registrar cliente - CORREGIDO
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();

    const datos = validarCliente();
    if (!datos) return;

    // Verificar si ya existe un cliente con el mismo nombre (solo nombre)
    const clienteExistente = clientesData.find(cliente => 
        cliente.nombre.toLowerCase() === datos.nombre.toLowerCase()
    );

    if (clienteExistente) {
        showModalMensaje("advertencia", "Cliente duplicado", "Ya existe un cliente con ese nombre.");
        inputNombre.focus();
        return;
    }

    fetch("php/ingresarClientes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `nombre=${encodeURIComponent(datos.nombre)}&apellido=${encodeURIComponent(datos.apellido)}&telefono=${encodeURIComponent(datos.telefono)}&correo=${encodeURIComponent(datos.correo)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarClientes();
            inputNombre.value = "";
            inputTelefono.value = "";
            inputCorreo.value = "";
        } else if (data.status === "duplicado") {
            showModalMensaje("advertencia", "Duplicado", data.mensaje);
            inputNombre.focus();
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(() => {
        showModalMensaje("error", "Error", "No se pudo conectar con el servidor.");
    });
});

// Actualizar cliente - CORREGIDO
btnActualizar.addEventListener("click", () => {
    const datos = validarCliente();
    if (!datos) return;

    // Verificar si ya existe otro cliente con el mismo nombre (excluyendo el actual)
    const clienteExistente = clientesData.find(cliente => 
        cliente.id_cliente != idSeleccionado && 
        cliente.nombre.toLowerCase() === datos.nombre.toLowerCase()
    );

    if (clienteExistente) {
        showModalMensaje("advertencia", "Cliente duplicado", "Ya existe otro cliente con ese nombre.");
        inputNombre.focus();
        return;
    }

    fetch("php/editarClientes.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id_cliente=${idSeleccionado}&nombre=${encodeURIComponent(datos.nombre)}&telefono=${encodeURIComponent(datos.telefono)}&correo=${encodeURIComponent(datos.correo)}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarClientes();

            // Resetear formulario
            inputNombre.value = "";
            inputTelefono.value = "";
            inputCorreo.value = "";
            idSeleccionado = null;
            datosOriginales = {};

            btnRegistrar.style.display = "inline-block";
            btnActualizar.style.display = "none";
            btnCancelarEdicion.style.display = "none"; 
            document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(() => {
        showModalMensaje("error", "Error", "No se pudo editar el registro.");
    });
});

// Eliminar cliente
btnEliminarModal.addEventListener("click", () => {
    if (!idSeleccionado) {
        alert("No se ha seleccionado ningún cliente.");
        return;
    }
    abrirModalConfirmar();
    document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
        cerrarModalConfirmar();
        fetch("php/eliminarCliente.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id_cliente=${idSeleccionado}`
        })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarClientes();
            modal.style.display = "none";
            idSeleccionado = null;
            datosOriginales = {};
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(() => {
        showModalMensaje("error", "Error", "No se pudo dar de baja el cliente.");
    });
    });
});

// Modal Acciones
cerrarModal.addEventListener("click", () => modal.style.display = "none");

btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        const celdas = filaSeleccionada.querySelectorAll("td");
        
        // Usar obtenerValorReal para quitar el guión al editar
        const nombre = obtenerValorReal(celdas[0].innerText);
        const correo = obtenerValorReal(celdas[1].innerText);
        const telefono = obtenerValorReal(celdas[2].innerText);
        
        // Llenar los campos del formulario
        inputNombre.value = nombre;
        inputCorreo.value = correo;
        inputTelefono.value = telefono;
        
        // Guardar los datos originales para comparar cambios
        datosOriginales = {
            nombre: nombre,
            correo: correo,
            telefono: telefono
        };
        
        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        document.querySelector(".tabla-contenedor").classList.add("tabla-bloqueada");
        modal.style.display = "none";
    }
});

btnCancelarEdicion.addEventListener("click", () => {
    inputNombre.value = ""; 
    inputTelefono.value = ""; 
    inputCorreo.value = ""; 
    idSeleccionado = null;  
    datosOriginales = {};

    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none"; 
    document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
});

// Búsqueda
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline";
        const filtrados = clientesData.filter(c =>
            c.nombre.toLowerCase().includes(texto) ||
            (c.correo && c.correo.toLowerCase().includes(texto)) ||
            (c.telefono && c.telefono.toLowerCase().includes(texto))
        );
        mostrarTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none";
        mostrarTabla(clientesData);
    }
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    mostrarTabla(clientesData);
    inputBuscar.focus();
});

// Modal de mensajes
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
    
    // Auto cerrar después de 3 segundos para todos los tipos
    setTimeout(() => { modalMensaje.style.display = "none"; }, 3000);
}

cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");

// Confirmar eliminar
function abrirModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "block";
}
function cerrarModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

// Menú usuario
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
};