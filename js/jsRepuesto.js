let filaSeleccionada = null;
let idSeleccionado = null;

const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const btnHabilitarModal = document.getElementById("btnHabilitarModal");
const btnDeshabilitarModal = document.getElementById("btnDeshabilitarModal");
const btnEliminar = document.getElementById("btnEliminarModal");

const tablaBody = document.querySelector(".tabla tbody");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnEditar = document.querySelector(".btn-actualizar");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");
let repuestosData = [];

// Modal mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Inputs
const inputNombre = document.getElementById("inputNombreProductos");
const inputDescripcion = document.getElementById("inputDescripcionProducto");
const inputStockMinimo = document.getElementById("inputStockMinimo");
const selectMarca = document.getElementById("selectMarca");
const selectMedida = document.getElementById("selectMedida");

// Errores
const errorNombre = document.getElementById("errorNombre");
const errorDescripcion = document.getElementById("errorTelefono");
const errorStock = document.getElementById("errorCorreo");

// Agregar después de las otras variables
const inputImagen = document.getElementById("inputImagen");
const errorImagen = document.getElementById("errorImagen");
let imagenActual = null; // Para manejar la imagen durante edición

// Obtener datos del usuario desde sessionStorage
const usuarioData = JSON.parse(sessionStorage.getItem("usuario") || "{}");
const ID_USUARIO = usuarioData.id || null;
const NOMBRE_USUARIO = usuarioData.nombre || 'Invitado';

// ========================= VALIDACIONES =========================
inputNombre.addEventListener("input", () => {
    errorNombre.textContent = inputNombre.value.trim() === "" ? "El nombre no puede estar vacío." : "";
});
inputDescripcion.addEventListener("input", () => {
    errorDescripcion.textContent = inputDescripcion.value.trim() === "" ? "La descripción no puede estar vacía." : "";
});
inputStockMinimo.addEventListener("input", () => {
    errorStock.textContent = (inputStockMinimo.value.trim() === "" || parseInt(inputStockMinimo.value) < 0) ?
        "El stock mínimo debe ser un número mayor o igual a 0." : "";
});

function validarRepuesto() {
    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const stock = inputStockMinimo.value.trim();
    const marca = selectMarca.value;
    const medida = selectMedida.value;
    const imagen = inputImagen.files[0];

    // Validaciones existentes...
    if (!nombre) {
        showModalMensaje("advertencia", "Falta nombre", "El nombre no puede estar vacío.");
        inputNombre.focus();
        return false;
    }
    if (!descripcion) {
        showModalMensaje("advertencia", "Falta descripción", "Debe ingresar una descripción.");
        inputDescripcion.focus();
        return false;
    }
    if (stock === "" || parseInt(stock) < 0) {
        showModalMensaje("advertencia", "Stock inválido", "Debe ingresar un stock mínimo válido.");
        inputStockMinimo.focus();
        return false;
    }
    if (!marca) {
        showModalMensaje("advertencia", "Falta marca", "Debe seleccionar una marca.");
        selectMarca.focus();
        return false;
    }
    if (!medida) {
        showModalMensaje("advertencia", "Falta medida", "Debe seleccionar una medida.");
        selectMedida.focus();
        return false;
    }

    // Validar imagen (opcional durante edición)
    if (!idSeleccionado && !imagen) {
        showModalMensaje("advertencia", "Falta imagen", "Debe seleccionar una imagen del producto.");
        inputImagen.focus();
        return false;
    }

    return {
        nombre,
        descripcion,
        stock,
        marca,
        medida,
        imagen
    };
}



document.addEventListener("DOMContentLoaded", () => {
    cargarMarcas();
    cargarMedidas();
    cargarRepuestos();
});

function cargarMarcas() {
    fetch("php/obtenerMarcas.php")
        .then(res => res.json())
        .then(data => {
            selectMarca.innerHTML = '<option value="" disabled selected>Seleccionar Marca</option>';
            data.forEach(m => {
                let option = document.createElement("option");
                option.value = m.id_marca;
                option.textContent = m.nombre;
                selectMarca.appendChild(option);
            });
        });
}

function cargarMedidas() {
    fetch("php/obtenerMedidas.php")
        .then(res => res.json())
        .then(data => {
            selectMedida.innerHTML = '<option value="" disabled selected>Seleccionar Medida</option>';
            data.forEach(m => {
                let option = document.createElement("option");
                option.value = m.id_medida;
                option.textContent = m.medida_bicicleta;
                selectMedida.appendChild(option);
            });
        });
}

function cargarRepuestos() {
    fetch("php/obtenerRepuestos.php")
        .then(res => res.json())
        .then(data => {
            repuestosData = data;
            renderTabla(data);
        });
}


// Renderizar tabla
function renderTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(rep => {
        const fila = document.createElement("tr");

        // Generar HTML para la imagen
        let imagenHTML = '';
        if (rep.imagen_path) {
            imagenHTML = `
                <img src="${rep.imagen_path}" 
                     alt="${rep.nombre}" 
                     class="imagen-repuesto"
                     onclick="ampliarImagen('${rep.imagen_path}', '${rep.nombre}')"
                     title="Haz clic para ver imagen completa">
            `;
        } else {
            imagenHTML = `
                <div class="sin-imagen" title="Sin imagen">
                    📷<br>No disponible
                </div>
            `;
        }

        fila.innerHTML = `
            <td>${rep.codigo}</td>
            <td>${rep.nombre}</td>
            <td>${rep.descripcion}</td>
            <td>${rep.stock_minimo}</td>
            <td>${rep.marca}</td>
            <td>${rep.medida}</td>
            <td style="text-align: center; padding: 5px;">
                ${imagenHTML}
            </td>
            <td>
                <button class="btn-editar" data-id="${rep.id_repuesto}">
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
// Registrar
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    const datos = validarRepuesto();
    if (!datos) return;

    // Validar duplicado: nombre, marca Y medida deben ser iguales
    const duplicado = repuestosData.find(r =>
        r.nombre.toLowerCase() === datos.nombre.toLowerCase() &&
        r.id_marca == datos.marca &&
        r.id_medida == datos.medida
    );

    if (duplicado) {
        showModalMensaje("advertencia", "Duplicado",
            "Ya existe un repuesto con el mismo nombre, marca y medida.");
        return;
    }

    // Función para generar el código único de repuesto
    let nombrecodigo = document.getElementById("inputNombreProductos").value;
    let marcacodigo = document.getElementById("selectMarca").options[document.getElementById("selectMarca").selectedIndex].text;
    let medidacodigo = document.getElementById("selectMedida").options[document.getElementById("selectMedida").selectedIndex].text;

    // Tomar 3 letras del nombre y marca, y 2 de la medida
    let parteNombre = (nombrecodigo || "XXX").substring(0, 3).toUpperCase();
    let parteMarca = (marcacodigo || "XXX").substring(0, 3).toUpperCase();
    let parteMedida = (medidacodigo || "XX").substring(0, 2).toUpperCase();

    // Generar número aleatorio de 2 dígitos
    let aleatorio = Math.floor(10 + Math.random() * 90); // entre 10 y 99

    // Concatenar todo (3 + 3 + 2 + 2 = 10)
    let codigo = parteNombre + parteMarca + parteMedida + aleatorio;

    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('codigo', codigo);
    formData.append('nombre', datos.nombre);
    formData.append('descripcion', datos.descripcion);
    formData.append('stock', datos.stock);
    formData.append('id_marca', datos.marca);
    formData.append('id_medida', datos.medida);
    formData.append('id_usuario', ID_USUARIO);
    formData.append('nombre_usuario', NOMBRE_USUARIO);

    if (datos.imagen) {
        formData.append('imagen', datos.imagen);
    }

    fetch("php/ingresarRepuesto.php", {

        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarRepuestos();
                limpiarFormulario();
            } else {
                showModalMensaje("error", "Error", data.mensaje || "No se pudo insertar el registro.");
            }
        })
        .catch(err => {
            showModalMensaje("error", "Error", "Error al enviar los datos.");
        });
});

btnCancelarEdicion.addEventListener("click", () => {
    // Restaurar botones
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";

    // Limpiar inputs
    limpiarFormulario();

    // Resetear variables
    filaSeleccionada = null;
    idSeleccionado = null;

    inputNombre.focus();
    document.querySelector(".tabla-contenedor").classList.remove("bloqueada");
});


// ========================= BUSCAR =========================
inputBuscar.addEventListener("keyup", () => {
    const texto = inputBuscar.value.toLowerCase();
    const filtrados = repuestosData.filter(rep =>
        rep.codigo.toLowerCase().includes(texto) ||
        rep.nombre.toLowerCase().includes(texto) ||
        rep.marca.toLowerCase().includes(texto) ||
        rep.medida.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    renderTabla(repuestosData);
});

// ========================= MODALES =========================
function showModalMensaje(tipo, titulo, mensaje) {
    modalMensaje.style.display = "flex";
    modalTitulo.textContent = titulo;
    modalTexto.textContent = mensaje;
    modalIcono.className = "";
    if (tipo === "exito") modalIcono.classList.add("icono-exito");
    if (tipo === "error") modalIcono.classList.add("icono-error");
    if (tipo === "advertencia") modalIcono.classList.add("icono-advertencia");
}
cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");
cerrarModal.addEventListener("click", () => modal.style.display = "none");

// ========================= UTILS =========================
function limpiarFormulario() {
    [inputNombre, inputDescripcion, inputStockMinimo].forEach(i => i.value = "");
    selectMarca.selectedIndex = 0;
    selectMedida.selectedIndex = 0;
    inputImagen.value = ""; // Limpiar input de imagen
    errorNombre.textContent = "";
    errorDescripcion.textContent = "";
    errorStock.textContent = "";
    errorImagen.textContent = "";
    filaSeleccionada = null;
    idSeleccionado = null;
    imagenActual = null;

    // Remover vista previa si existe
    const vistaPrevia = document.querySelector('.vista-previa');
    if (vistaPrevia) {
        vistaPrevia.remove();
    }
}

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


btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        // Cambiar botones
        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        document.querySelector(".tabla-contenedor").classList.add("bloqueada");

        const celdas = filaSeleccionada.querySelectorAll("td");

        inputNombre.value = celdas[1].innerText;
        inputDescripcion.value = celdas[2].innerText;
        inputStockMinimo.value = celdas[3].innerText;

        // Establecer empresa en el select (buscando por nombre)
        const marca = celdas[4].innerText;
        const select = document.getElementById("selectMarca");
        for (let option of select.options) {
            if (option.text === marca) {
                select.value = option.value;
                break;
            }
        }
        const medida = celdas[5].innerText;
        const selectM = document.getElementById("selectMedida");
        for (let option of selectM.options) {
            if (option.text === medida) {
                selectM.value = option.value;
                break;
            }
        }

        // Cargar información de la imagen si existe
        const repuesto = repuestosData.find(r => r.id_repuesto == idSeleccionado);
        if (repuesto && repuesto.imagen_path) {
            // Si quieres mostrar la imagen en el formulario de edición, puedes agregarla aquí
            console.log("Imagen del repuesto:", repuesto.imagen_path);
        }

        modal.style.display = "none";
    }
});

// Función para mostrar vista previa de imagen existente
function mostrarVistaPreviaExistente(rutaImagen) {
    // Remover vista previa anterior si existe
    const vistaPreviaAnterior = document.querySelector('.vista-previa');
    if (vistaPreviaAnterior) {
        vistaPreviaAnterior.remove();
    }

    const contenedor = document.createElement('div');
    contenedor.className = 'vista-previa';
    contenedor.innerHTML = `
        <p><strong>Imagen actual:</strong></p>
        <img src="${rutaImagen}" alt="Imagen actual del producto" onerror="this.style.display='none'">
        <br>
        <button type="button" class="btn-eliminar-imagen">Eliminar imagen</button>
    `;

    // Insertar después del input de imagen
    inputImagen.parentNode.insertBefore(contenedor, inputImagen.nextSibling);

    // Evento para eliminar imagen
    contenedor.querySelector('.btn-eliminar-imagen').addEventListener('click', function () {
        imagenActual = 'eliminar';
        contenedor.remove();
    });
}

const btnActualizar = document.querySelector(".btn-actualizar");

btnActualizar.addEventListener("click", () => {
    const datos = validarRepuesto();
    if (!datos) return;

    // Validar duplicado al editar (excluyendo el registro actual)
    const duplicado = repuestosData.find(r =>
        r.id_repuesto != idSeleccionado && // Excluir el registro actual
        r.nombre.toLowerCase() === datos.nombre.toLowerCase() &&
        r.id_marca == datos.marca &&
        r.id_medida == datos.medida
    );

    if (duplicado) {
        showModalMensaje("advertencia", "Duplicado",
            "Ya existe otro repuesto con el mismo nombre, marca y medida.");
        return;
    }

    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('id', idSeleccionado);
    formData.append('nombre', datos.nombre);
    formData.append('descripcion', datos.descripcion);
    formData.append('stock', datos.stock);
    formData.append('id_marca', datos.marca);
    formData.append('id_medida', datos.medida);
    formData.append('id_usuario', ID_USUARIO);
    formData.append('nombre_usuario', NOMBRE_USUARIO);

    if (datos.imagen) {
        formData.append('imagen', datos.imagen);
    }
    if (imagenActual === 'eliminar') {
        formData.append('eliminar_imagen', '1');
    }

    fetch("php/editarProducto.php", {
        method: "POST",
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            modal.style.display = "none";
            btnActualizar.style.display = "none";
            btnRegistrar.style.display = "inline-block";
            btnCancelarEdicion.style.display = "none";
            limpiarFormulario();
            inputNombre.focus();
            document.querySelector(".tabla-contenedor").classList.remove("bloqueada");

            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarRepuestos();
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(err => {
            showModalMensaje("error", "Error", "No se pudo editar el registro.");
        });
});

btnEliminar.addEventListener("click", () => {
    if (!idSeleccionado) {
        showModalMensaje("advertencia", "No hay selección", "No se ha seleccionado ningún producto.");
        return;
    }
    abrirModalConfirmar();
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

const formInputs = document.querySelectorAll("input, select, textarea");

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

inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase();
    if (texto.trim() !== "") {
        btnLimpiar.style.display = "inline";
        const filtrados = repuestosData.filter(p =>
            p.nombre.toLowerCase().includes(texto) ||
            p.correo.toLowerCase().includes(texto) ||
            p.telefono.toLowerCase().includes(texto) ||
            p.empresa.toLowerCase().includes(texto)
        );
        renderTabla(filtrados);
    } else {
        btnLimpiar.style.display = "none";
        renderTabla(repuestosData);
    }
});

// Limpiar búsqueda
btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    btnLimpiar.style.display = "none";
    renderTabla(repuestosData);
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

// Función para abrir modal
function abrirModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "block";
}

// Función para cerrar modal
function cerrarModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    cerrarModalConfirmar();
    if (!idSeleccionado) return;

    fetch("php/eliminarRepuesto.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}&id_usuario=${ID_USUARIO}&nombre_usuario=${encodeURIComponent(NOMBRE_USUARIO)}`
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === "exito") {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarRepuestos();
                modal.style.display = "none";
                idSeleccionado = null;
            } else {
                showModalMensaje("error", "Error", data.mensaje);
            }
        })
        .catch(err => {
            showModalMensaje("error", "Error", "No se pudo eliminar el registro.");
        });
});

document.getElementById("btnCancelarEliminar").addEventListener("click", () => {
    cerrarModalConfirmar();
});

// Vista previa de imagen seleccionada
inputImagen.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showModalMensaje("error", "Error", "Por favor seleccione un archivo de imagen válido.");
            inputImagen.value = '';
            return;
        }

        // Validar tamaño (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showModalMensaje("error", "Error", "La imagen no debe pesar más de 2MB.");
            inputImagen.value = '';
            return;
        }

        mostrarVistaPreviaNueva(file);
    }
});

function mostrarVistaPreviaNueva(file) {
    // Remover vista previa anterior si existe
    const vistaPreviaAnterior = document.querySelector('.vista-previa');
    if (vistaPreviaAnterior) {
        vistaPreviaAnterior.remove();
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const contenedor = document.createElement('div');
        contenedor.className = 'vista-previa';
        contenedor.innerHTML = `
            <p><strong>Vista previa:</strong></p>
            <img src="${e.target.result}" alt="Vista previa de la imagen">
            <br>
            <button type="button" class="btn-eliminar-imagen">Quitar imagen</button>
        `;

        // Insertar después del input de imagen
        inputImagen.parentNode.insertBefore(contenedor, inputImagen.nextSibling);

        // Evento para eliminar imagen
        contenedor.querySelector('.btn-eliminar-imagen').addEventListener('click', function () {
            inputImagen.value = '';
            contenedor.remove();
        });
    };
    reader.readAsDataURL(file);
}

// Función para ampliar imagen (igual que en inventario)
function ampliarImagen(rutaImagen, nombreRepuesto) {
    // Crear modal si no existe
    let modalImagen = document.getElementById('modalImagen');
    if (!modalImagen) {
        modalImagen = document.createElement('div');
        modalImagen.id = 'modalImagen';
        modalImagen.className = 'modal-imagen';
        modalImagen.innerHTML = `
            <button class="cerrar-modal-imagen">&times;</button>
            <img class="modal-imagen-contenido" id="imagenAmpliada">
        `;
        document.body.appendChild(modalImagen);

        // Event listeners para cerrar modal
        modalImagen.querySelector('.cerrar-modal-imagen').addEventListener('click', () => {
            modalImagen.style.display = 'none';
        });

        modalImagen.addEventListener('click', (e) => {
            if (e.target === modalImagen) {
                modalImagen.style.display = 'none';
            }
        });

        // Cerrar con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalImagen.style.display === 'flex') {
                modalImagen.style.display = 'none';
            }
        });
    }

    // Mostrar imagen
    const imagenAmpliada = document.getElementById('imagenAmpliada');
    imagenAmpliada.src = rutaImagen;
    imagenAmpliada.alt = nombreRepuesto;

    modalImagen.style.display = 'flex';
}

