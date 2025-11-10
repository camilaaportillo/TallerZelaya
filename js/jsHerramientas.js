let filaSeleccionada = null;
let idSeleccionado = null;
let herramientasData = [];
let imagenActual = null;

// Elementos del DOM
const modal = document.getElementById("modalAcciones");
const cerrarModal = document.getElementById("cerrarModal");
const btnEditarModal = document.getElementById("btnEditarModal");
const btnEliminarModal = document.getElementById("btnEliminarModal");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");

const tablaBody = document.getElementById("cuerpoTabla");
const btnRegistrar = document.querySelector(".btn-registrar");
const btnActualizar = document.querySelector(".btn-actualizar");

const inputBuscar = document.getElementById("inputBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");

// Modal mensajes
const modalMensaje = document.getElementById("modalMensaje");
const modalIcono = document.getElementById("modalIcono");
const modalTitulo = document.getElementById("modalTitulo");
const modalTexto = document.getElementById("modalTexto");
const cerrarMensaje = document.getElementById("cerrarMensaje");

// Inputs
const inputNombre = document.getElementById("inputNombreHerramienta");
const inputDescripcion = document.getElementById("inputDescripcion");
const inputStock = document.getElementById("inputStock");
const inputImagen = document.getElementById("inputImagen");
const selectMarca = document.getElementById("selectMarca");
const selectMedida = document.getElementById("selectMedida");

// Errores
const errorNombre = document.getElementById("errorNombre");
const errorDescripcion = document.getElementById("errorDescripcion");
const errorStock = document.getElementById("errorStock");
const errorImagen = document.getElementById("errorImagen");

// ========================= VALIDACIONES =========================
inputNombre.addEventListener("input", () => {
    errorNombre.textContent = inputNombre.value.trim() === "" ? "El nombre no puede estar vacío." : "";
});

inputDescripcion.addEventListener("input", () => {
    errorDescripcion.textContent = inputDescripcion.value.trim() === "" ? "La descripción no puede estar vacía." : "";
});

inputStock.addEventListener("input", () => {
    errorStock.textContent = (inputStock.value.trim() === "" || parseInt(inputStock.value) < 0) ?
        "El stock debe ser un número mayor o igual a 0." : "";
});

function validarHerramienta() {
    const nombre = inputNombre.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const stock = inputStock.value.trim();
    const marca = selectMarca.value;
    const medida = selectMedida.value;
    const imagen = inputImagen.files[0];

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
        showModalMensaje("advertencia", "Stock inválido", "Debe ingresar un stock válido.");
        inputStock.focus();
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
    if (!idSeleccionado && !imagen) {
        showModalMensaje("advertencia", "Falta imagen", "Debe seleccionar una imagen de la herramienta.");
        inputImagen.focus();
        return false;
    }

    return { nombre, descripcion, stock, marca, medida, imagen };
}

// ========================= INICIALIZACIÓN =========================
document.addEventListener("DOMContentLoaded", () => {
    cargarMarcas();
    cargarMedidas();
    cargarHerramientas();
    configurarEventos();
});

function configurarEventos() {
    // Vista previa de imagen
    inputImagen.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showModalMensaje("error", "Error", "Por favor seleccione un archivo de imagen válido.");
                inputImagen.value = '';
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                showModalMensaje("error", "Error", "La imagen no debe pesar más de 2MB.");
                inputImagen.value = '';
                return;
            }
            mostrarVistaPreviaNueva(file);
        }
    });
}

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

function cargarHerramientas() {
    console.log('🔧 Cargando herramientas...');
    
    fetch("php/obtenerHerramientas.php")
        .then(res => {
            console.log('📥 Estado de respuesta:', res.status);
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            return res.text(); // Primero obtener como texto para debug
        })
        .then(text => {
            console.log('📄 Respuesta cruda:', text);
            
            // Intentar parsear como JSON
            try {
                const data = JSON.parse(text);
                herramientasData = data;
                renderTabla(data);
                console.log('✅ Herramientas cargadas:', data.length);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                console.error('📄 Texto que causó el error:', text);
                throw new Error(`Error en formato JSON: ${parseError.message}`);
            }
        })
        .catch(err => {
            console.error('💥 Error cargando herramientas:', err);
            showModalMensaje("error", "Error", `No se pudieron cargar las herramientas: ${err.message}`);
        });
}

// ========================= RENDERIZAR TABLA =========================
function renderTabla(datos) {
    tablaBody.innerHTML = "";
    datos.forEach(herramienta => {
        const fila = document.createElement("tr");
        
        // Generar HTML para la imagen
        let imagenHTML = '';
        if (herramienta.imagen_path) {
            imagenHTML = `
                <img src="${herramienta.imagen_path}" 
                     alt="${herramienta.nombre}" 
                     class="imagen-herramienta"
                     onclick="ampliarImagen('${herramienta.imagen_path}', '${herramienta.nombre}')"
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
            <td>${herramienta.nombre}</td>
            <td>${herramienta.descripcion}</td>
            <td>${herramienta.stock_actual}</td>
            <td>${herramienta.marca}</td>
            <td>${herramienta.medida}</td>
            <td style="text-align: center; padding: 5px;">
                ${imagenHTML}
            </td>
            <td>
                <button class="btn-editar" data-id="${herramienta.id_herramienta}">
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

// ========================= FUNCIÓN AMPLIAR IMAGEN =========================
function ampliarImagen(rutaImagen, nombreHerramienta) {
    const modalImagen = document.getElementById('modalImagen');
    const imagenAmpliada = document.getElementById('imagenAmpliada');
    
    imagenAmpliada.src = rutaImagen;
    imagenAmpliada.alt = nombreHerramienta;
    modalImagen.style.display = 'flex';
}

// Event listeners para cerrar modal de imagen
document.addEventListener('DOMContentLoaded', function() {
    const modalImagen = document.getElementById('modalImagen');
    const cerrarModalImagen = document.querySelector('.cerrar-modal-imagen');
    
    if (cerrarModalImagen) {
        cerrarModalImagen.addEventListener('click', () => {
            modalImagen.style.display = 'none';
        });
    }
    
    if (modalImagen) {
        modalImagen.addEventListener('click', (e) => {
            if (e.target === modalImagen) {
                modalImagen.style.display = 'none';
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalImagen.style.display === 'flex') {
            modalImagen.style.display = 'none';
        }
    });
});

// ========================= REGISTRAR HERRAMIENTA =========================
btnRegistrar.addEventListener("click", (e) => {
    e.preventDefault();
    const datos = validarHerramienta();
    if (!datos) return;

    // Validar duplicado
    const duplicado = herramientasData.find(h => 
        h.nombre.toLowerCase() === datos.nombre.toLowerCase() &&
        h.id_marca == datos.marca &&
        h.id_medida == datos.medida
    );

    if (duplicado) {
        showModalMensaje("advertencia", "Duplicado", "Ya existe una herramienta con el mismo nombre, marca y medida.");
        return;
    }

    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('descripcion', datos.descripcion);
    formData.append('stock', datos.stock);
    formData.append('id_marca', datos.marca);
    formData.append('id_medida', datos.medida);
    
    if (datos.imagen) {
        formData.append('imagen', datos.imagen);
    }

    fetch("php/ingresarHerramienta.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarHerramientas();
            limpiarFormulario();
        } else {
            showModalMensaje("error", "Error", data.mensaje || "No se pudo insertar el registro.");
        }
    })
    .catch(err => {
        showModalMensaje("error", "Error", "Error al enviar los datos.");
    });
});

// ========================= EDITAR HERRAMIENTA =========================
btnEditarModal.addEventListener("click", () => {
    if (filaSeleccionada && idSeleccionado) {
        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelarEdicion.style.display = "inline-block";

        document.querySelector(".tabla-contenedor").classList.add("bloqueada");

        const celdas = filaSeleccionada.querySelectorAll("td");

        inputNombre.value = celdas[0].innerText;
        inputDescripcion.value = celdas[1].innerText;
        inputStock.value = celdas[2].innerText;

        // Establecer marca
        const marca = celdas[3].innerText;
        for (let option of selectMarca.options) {
            if (option.text === marca) {
                selectMarca.value = option.value;
                break;
            }
        }
        
        // Establecer medida
        const medida = celdas[4].innerText;
        for (let option of selectMedida.options) {
            if (option.text === medida) {
                selectMedida.value = option.value;
                break;
            }
        }

        // Cargar información de la imagen si existe
        const herramienta = herramientasData.find(h => h.id_herramienta == idSeleccionado);
        if (herramienta && herramienta.imagen_path) {
            mostrarVistaPreviaExistente(herramienta.imagen_path);
        }

        modal.style.display = "none";
    }
});

btnActualizar.addEventListener("click", () => {
    const datos = validarHerramienta();
    if (!datos) return;

    // Validar duplicado al editar
    const duplicado = herramientasData.find(h => 
        h.id_herramienta != idSeleccionado &&
        h.nombre.toLowerCase() === datos.nombre.toLowerCase() &&
        h.id_marca == datos.marca &&
        h.id_medida == datos.medida
    );

    if (duplicado) {
        showModalMensaje("advertencia", "Duplicado", "Ya existe otra herramienta con el mismo nombre, marca y medida.");
        return;
    }

    const formData = new FormData();
    formData.append('id', idSeleccionado);
    formData.append('nombre', datos.nombre);
    formData.append('descripcion', datos.descripcion);
    formData.append('stock', datos.stock);
    formData.append('id_marca', datos.marca);
    formData.append('id_medida', datos.medida);
    
    if (datos.imagen) {
        formData.append('imagen', datos.imagen);
    }
    if (imagenActual === 'eliminar') {
        formData.append('eliminar_imagen', '1');
    }

    fetch("php/editarHerramienta.php", {
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
            cargarHerramientas();
        } else {
            showModalMensaje("error", "Error", data.mensaje);
        }
    })
    .catch(err => {
        showModalMensaje("error", "Error", "No se pudo editar el registro.");
    });
});

// ========================= ELIMINAR HERRAMIENTA =========================
btnEliminarModal.addEventListener("click", () => {
    if (!idSeleccionado) {
        showModalMensaje("advertencia", "No hay selección", "No se ha seleccionado ninguna herramienta.");
        return;
    }
    abrirModalConfirmar();
});

document.getElementById("btnConfirmarEliminar").addEventListener("click", () => {
    cerrarModalConfirmar();
    if (!idSeleccionado) return;

    fetch("php/eliminarHerramienta.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `id=${idSeleccionado}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "exito") {
            showModalMensaje("exito", "Éxito", data.mensaje);
            cargarHerramientas();
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

// ========================= VISTA PREVIA IMAGEN =========================
function mostrarVistaPreviaNueva(file) {
    const vistaPreviaAnterior = document.querySelector('.vista-previa');
    if (vistaPreviaAnterior) {
        vistaPreviaAnterior.remove();
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const contenedor = document.createElement('div');
        contenedor.className = 'vista-previa';
        contenedor.innerHTML = `
            <p><strong>Vista previa:</strong></p>
            <img src="${e.target.result}" alt="Vista previa de la imagen">
            <br>
            <button type="button" class="btn-eliminar-imagen">Quitar imagen</button>
        `;

        inputImagen.parentNode.insertBefore(contenedor, inputImagen.nextSibling);

        contenedor.querySelector('.btn-eliminar-imagen').addEventListener('click', function() {
            inputImagen.value = '';
            contenedor.remove();
        });
    };
    reader.readAsDataURL(file);
}

function mostrarVistaPreviaExistente(rutaImagen) {
    const vistaPreviaAnterior = document.querySelector('.vista-previa');
    if (vistaPreviaAnterior) {
        vistaPreviaAnterior.remove();
    }

    const contenedor = document.createElement('div');
    contenedor.className = 'vista-previa';
    contenedor.innerHTML = `
        <p><strong>Imagen actual:</strong></p>
        <img src="${rutaImagen}" alt="Imagen actual de la herramienta" onerror="this.style.display='none'">
        <br>
        <button type="button" class="btn-eliminar-imagen">Eliminar imagen</button>
    `;

    inputImagen.parentNode.insertBefore(contenedor, inputImagen.nextSibling);

    contenedor.querySelector('.btn-eliminar-imagen').addEventListener('click', function() {
        imagenActual = 'eliminar';
        contenedor.remove();
    });
}

// ========================= BUSCAR =========================
inputBuscar.addEventListener("keyup", () => {
    const texto = inputBuscar.value.toLowerCase();
    const filtrados = herramientasData.filter(herramienta =>
        herramienta.nombre.toLowerCase().includes(texto) ||
        herramienta.descripcion.toLowerCase().includes(texto) ||
        herramienta.marca.toLowerCase().includes(texto) ||
        herramienta.medida.toLowerCase().includes(texto)
    );
    renderTabla(filtrados);
});

btnLimpiar.addEventListener("click", () => {
    inputBuscar.value = "";
    renderTabla(herramientasData);
});

// ========================= UTILIDADES =========================
function limpiarFormulario() {
    [inputNombre, inputDescripcion, inputStock].forEach(i => i.value = "");
    selectMarca.selectedIndex = 0;
    selectMedida.selectedIndex = 0;
    inputImagen.value = "";
    errorNombre.textContent = "";
    errorDescripcion.textContent = "";
    errorStock.textContent = "";
    errorImagen.textContent = "";
    filaSeleccionada = null;
    idSeleccionado = null;
    imagenActual = null;
    
    const vistaPrevia = document.querySelector('.vista-previa');
    if (vistaPrevia) {
        vistaPrevia.remove();
    }
}

btnCancelarEdicion.addEventListener("click", () => {
    btnRegistrar.style.display = "inline-block";
    btnActualizar.style.display = "none";
    btnCancelarEdicion.style.display = "none";
    limpiarFormulario();
    inputNombre.focus();
    document.querySelector(".tabla-contenedor").classList.remove("bloqueada");
});

// ========================= MODALES =========================
// ========================= MODALES =========================
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

cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");
cerrarModal.addEventListener("click", () => modal.style.display = "none");

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
    if (e.target === modalMensaje) {
        modalMensaje.style.display = "none";
    }
});

cerrarMensaje.addEventListener("click", () => modalMensaje.style.display = "none");
cerrarModal.addEventListener("click", () => modal.style.display = "none");

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
    if (e.target === modalMensaje) {
        modalMensaje.style.display = "none";
    }
});

// Modal confirmación
function abrirModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "block";
}

function cerrarModalConfirmar() {
    document.getElementById("modalConfirmar").style.display = "none";
}

// ========================= FUNCIONES GLOBALES =========================
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