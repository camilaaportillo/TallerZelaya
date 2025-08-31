// Variables globales
let medidas = [];
let medidaEditando = null;
let modalMensaje = document.getElementById('modalMensaje');
let modalConfirmacion = document.getElementById('modalConfirmacion');
let medidaAEliminar = null;
let timeoutSugerencia = null;

// Cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    cargarMedidas();
    configurarEventListeners();
    restaurarEstadoEdicion();
    configurarValidacionesEnTiempoReal(); // Nueva función para validaciones
});

// Configurar event listeners
function configurarEventListeners() {
    // Buscador
    document.getElementById('inputBuscar').addEventListener('input', filtrarMedidas);
    document.querySelector('.buscador button').addEventListener('click', filtrarMedidas);
    
    // Modal de mensajes
    document.getElementById('btnAceptar').addEventListener('click', cerrarModalMensaje);
    
    // Modal de confirmación
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminacion);
    document.getElementById('btnCancelarEliminar').addEventListener('click', cerrarModalConfirmacion);
    
    // Event delegation para botones de editar/eliminar
    document.querySelector('tbody').addEventListener('click', function(e) {
        if (e.target.matches('.btn-editar')) {
            const id = e.target.getAttribute('data-id');
            prepararEdicion(parseInt(id));
        } else if (e.target.matches('.btn-eliminar')) {
            const id = e.target.getAttribute('data-id');
            const nombre = e.target.getAttribute('data-nombre');
            solicitarEliminacion(parseInt(id), nombre);
        }
    });
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target == modalMensaje) {
            cerrarModalMensaje();
        }
        if (event.target == modalConfirmacion) {
            cerrarModalConfirmacion();
        }
    });

    // Limpiar estado al cerrar/recargar la página
    window.addEventListener('beforeunload', function() {
        if (medidaEditando) {
            localStorage.setItem('medidaEditando', JSON.stringify(medidaEditando));
        } else {
            localStorage.removeItem('medidaEditando');
        }
    });
    // Validación en tiempo real para el campo de medida
    const campoMedida = document.getElementById('nombre');
    if (campoMedida) {
        // Mostrar sugerencia mientras se escribe
        campoMedida.addEventListener('input', function() {
            const valor = this.value;
            ocultarError('nombre');
            
            // Usar debounce para no sobrecargar con cada tecla
            clearTimeout(timeoutSugerencia);
            timeoutSugerencia = setTimeout(() => {
                if (valor.trim()) {
                    mostrarSugerenciaFormato(valor);
                } else {
                    ocultarSugerencia();
                }
            }, 300); // 300ms de delay
        });
        
        // Ocultar sugerencia al perder el foco
        campoMedida.addEventListener('blur', function() {
            setTimeout(() => {
                ocultarSugerencia();
            }, 200);
        });
        
        // Mostrar sugerencia al obtener el foco
        campoMedida.addEventListener('focus', function() {
            const valor = this.value;
            if (valor.trim()) {
                mostrarSugerenciaFormato(valor);
            }
        });
    }
}

// Configurar validaciones en tiempo real
function configurarValidacionesEnTiempoReal() {
    const campoMedida = document.getElementById('nombre');
    if (campoMedida) {
        // Validar al perder el foco
        campoMedida.addEventListener('blur', function() {
            const valor = this.value;
            if (valor.trim()) {
                const validacion = validarMedidaBicicleta(valor);
                if (!validacion.valido) {
                    mostrarError('nombre', validacion.mensaje);
                } else {
                    ocultarError('nombre');
                    mostrarSugerenciaFormato(valor);
                }
            }
        });
        
        // Limpiar error y sugerencia al escribir
        campoMedida.addEventListener('input', function() {
            ocultarError('nombre');
            ocultarSugerencia();
        });
    }
}

// Restaurar estado de edición al cargar la página
function restaurarEstadoEdicion() {
    const medidaGuardada = localStorage.getItem('medidaEditando');
    if (medidaGuardada) {
        try {
            medidaEditando = JSON.parse(medidaGuardada);
            if (medidas.find(m => m.id_medida == medidaEditando.id_medida)) {
                document.getElementById('nombre').value = medidaEditando.medida_bicicleta;
                document.querySelector('.btn-registrar').style.display = 'none';
                document.querySelector('.btn-actualizar').style.display = 'block';
                document.getElementById('btnCancelar').style.display = 'block';
            } else {
                resetearFormulario();
                localStorage.removeItem('medidaEditando');
            }
        } catch (e) {
            console.error('Error al restaurar estado de edición:', e);
            resetearFormulario();
            localStorage.removeItem('medidaEditando');
        }
    } else {
        resetearFormulario();
    }
}

// Cargar medidas desde la API
function cargarMedidas() {
    fetch('php/medidas_crud.php')
        .then(response => response.json())
        .then(data => {
            medidas = data;
            renderizarTabla();
            restaurarEstadoEdicion();
        })
        .catch(error => {
            mostrarMensaje('Error', 'No se pudieron cargar las medidas', 'error');
        });
}

// Renderizar la tabla con las medidas
function renderizarTabla() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (medidas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; padding: 20px; color: #6c757d;">
                    No hay medidas registradas
                </td>
            </tr>
        `;
        return;
    }
    
    medidas.forEach(medida => {
        const tr = document.createElement('tr');
        tr.dataset.id = medida.id_medida;
        tr.dataset.nombre = medida.medida_bicicleta;
        
        tr.innerHTML = `
            <td>${medida.medida_bicicleta}</td>
            <td class="acciones">
                <button class="btn-editar" data-action="editar" data-id="${medida.id_medida}">Editar</button>
                <button class="btn-eliminar" data-action="eliminar" data-id="${medida.id_medida}" data-nombre="${medida.medida_bicicleta.replace(/"/g, '&quot;')}">Eliminar</button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}
// Filtrar medidas según el texto de búsqueda
function filtrarMedidas() {
    const texto = document.getElementById('inputBuscar').value.toLowerCase();
    const tbody = document.querySelector('tbody');
    const filas = tbody.querySelectorAll('tr');
    
    filas.forEach(fila => {
        if (fila.cells.length === 1) return;
        
        const textoFila = fila.cells[0].textContent.toLowerCase();
        fila.style.display = textoFila.includes(texto) ? '' : 'none';
    });
}

// Expresiones regulares para validaciones
const patronesMedidas = {
    pulgadas: /^(\d{2})(\.5)?("| pulgadas)?$/,
    centimetros: /^(\d{2,3})(\s?cm| centímetros)?$/,
    tallas: /^(XS|S|M|L|XL|XXL|XXXL)$/i,
    numerico: /^\d{2,4}$/,
    mixto: /^(\d{2,3})x(\d{1,3}(\.\d{1,2})?)(c)?$/
};

// Función de validación mejorada
function validarMedidaBicicleta(valor) {
    const trimmedValor = valor.trim();
    if (!trimmedValor) {
        return { valido: false, mensaje: 'La medida es requerida' };
    }
    
    if (trimmedValor.length > 30) {
        return { valido: false, mensaje: 'La medida no puede exceder 30 caracteres' };
    }
    
    // Validar duplicados (solo si no estamos editando la misma medida)
    if (!medidaEditando || medidaEditando.medida_bicicleta.toLowerCase() !== trimmedValor.toLowerCase()) {
        if (medidaExiste(trimmedValor)) {
            return { valido: false, mensaje: 'Esta medida ya existe' };
        }
    }
    
    let coincideConPatron = false;
    
    for (const patron in patronesMedidas) {
        if (patronesMedidas[patron].test(trimmedValor)) {
            coincideConPatron = true;
            break;
        }
    }
    
    if (!coincideConPatron) {
        if (/^\d+$/.test(trimmedValor)) {
            const numero = parseInt(trimmedValor);
            if (numero < 10 || numero > 250) {
                return { 
                    valido: false, 
                    mensaje: 'Las medidas numéricas deben estar entre 10 y 250' 
                };
            }
            coincideConPatron = true;
        }
    }
    
    if (!coincideConPatron) {
        return { 
            valido: false, 
            mensaje: 'Formato de medida no válido. Use: 26", 54cm, S, M, L, 26x1.95, o 175' 
        };
    }
    
    return { valido: true, mensaje: '' };
}

// Función para verificar si una medida ya existe
function medidaExiste(nuevaMedida) {
    return medidas.some(medida => 
        medida.medida_bicicleta.toLowerCase() === nuevaMedida.toLowerCase().trim()
    );
}

// Función para sugerir formato de medida
function sugerirFormatoMedida(valor) {
    const trimmedValor = valor.trim();
    
    if (!trimmedValor) return 'Escriba una medida';
    
    if (trimmedValor.includes('"')) {
        return 'Pulgadas (ej: 26", 27.5")';
    }
    
    if (trimmedValor.match(/(cm|centímetro|centimetro)/i)) {
        return 'Centímetros (ej: 54cm, 56 cm)';
    }
    
    if (trimmedValor.includes('x')) {
        return 'Medida mixta (ej: 26x1.95, 700x25c)';
    }
    
    if (['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].includes(trimmedValor.toUpperCase())) {
        return 'Talla (ej: S, M, L, XL)';
    }
    
    if (!isNaN(trimmedValor) && trimmedValor !== '') {
        return 'Numérico (ej: 170, 175, 180)';
    }
    
    return 'Formato no reconocido';
}


// Función para mostrar sugerencia de formato
function mostrarSugerenciaFormato(valor) {
    ocultarSugerencia();
    
    const sugerencia = sugerirFormatoMedida(valor);
    const campo = document.getElementById('nombre');
    
    const elementoAyuda = document.createElement('div');
    elementoAyuda.id = 'ayuda-formato';
    elementoAyuda.className = 'sugerencia-formato';
    elementoAyuda.innerHTML = `
        <span class="sugerencia-icono">💡</span>
        <span class="sugerencia-texto">Formato detectado: ${sugerencia}</span>
    `;
    
    // Insertar después del campo
    campo.parentNode.appendChild(elementoAyuda);
    
    // Aplicar estilo según si el formato es válido
    const esValido = validarMedidaBicicleta(valor).valido;
    if (esValido) {
        elementoAyuda.classList.add('sugerencia-valida');
    } else {
        elementoAyuda.classList.add('sugerencia-invalida');
    }
}

// Función para ocultar sugerencia
function ocultarSugerencia() {
    const ayudaExistente = document.getElementById('ayuda-formato');
    if (ayudaExistente) {
        ayudaExistente.remove();
    }
}

// Crear nueva medida
function crearMedida() {
    const nombre = document.getElementById('nombre').value;
    const validacion = validarMedidaBicicleta(nombre);
    
    if (!validacion.valido) {
        mostrarError('nombre', validacion.mensaje);
        return;
    }
    
    ocultarError('nombre');
    
    fetch('php/medidas_crud.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            medida_bicicleta: nombre.trim()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Éxito', 'Medida creada correctamente', 'success');
            document.getElementById('nombre').value = '';
            cargarMedidas();
            resetearFormulario();
            localStorage.removeItem('medidaEditando');
        } else {
            mostrarMensaje('Error', data.message, 'error');
        }
    })
    .catch(error => {
        mostrarMensaje('Error', 'Error al crear la medida', 'error');
    });
}

// Preparar edición de medida
function prepararEdicion(id) {
    const medida = medidas.find(m => m.id_medida == id);
    
    if (!medida) {
        mostrarMensaje('Error', 'No se encontró la medida seleccionada', 'error');
        return;
    }
    
    medidaEditando = medida;
    document.getElementById('nombre').value = medida.medida_bicicleta;
    document.querySelector('.btn-registrar').style.display = 'none';
    document.querySelector('.btn-actualizar').style.display = 'block';
    document.getElementById('btnCancelar').style.display = 'block';
    
    localStorage.setItem('medidaEditando', JSON.stringify(medidaEditando));
}

// Actualizar medida existente
function actualizarMedida() {
    if (!medidaEditando) {
        mostrarMensaje('Error', 'No hay ninguna medida seleccionada para actualizar', 'error');
        return;
    }
    
    const nombre = document.getElementById('nombre').value;
    const validacion = validarMedidaBicicleta(nombre);
    
    if (!validacion.valido) {
        mostrarError('nombre', validacion.mensaje);
        return;
    }
    
    ocultarError('nombre');
    
    fetch('php/medidas_crud.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_medida: medidaEditando.id_medida,
            medida_bicicleta: nombre.trim()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Éxito', 'Medida actualizada correctamente', 'success');
            cargarMedidas();
            resetearFormulario();
            localStorage.removeItem('medidaEditando');
        } else {
            mostrarMensaje('Error', data.message, 'error');
        }
    })
    .catch(error => {
        mostrarMensaje('Error', 'Error al actualizar la medida', 'error');
    });
}

// Solicitar eliminación de medida
function solicitarEliminacion(id, nombre) {
    medidaAEliminar = id;
    document.getElementById('textoConfirmacion').textContent = `¿Estás seguro de que deseas eliminar la medida "${nombre}"?`;
    modalConfirmacion.style.display = 'flex';
}
// Confirmar eliminación de medida
function confirmarEliminacion() {
    if (!medidaAEliminar) return;
    
    fetch('php/medidas_crud.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${medidaAEliminar}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            mostrarMensaje('Éxito', 'Medida eliminada correctamente', 'success');
            cargarMedidas();
            if (medidaEditando && medidaEditando.id_medida == medidaAEliminar) {
                resetearFormulario();
                localStorage.removeItem('medidaEditando');
            }
        } else {
            mostrarMensaje('Error', data.message, 'error');
        }
    })
    .catch(error => {
        mostrarMensaje('Error', 'Error al eliminar la medida', 'error');
    });
    
    cerrarModalConfirmacion();
}

// Cancelar edición
function cancelarEdicion() {
    resetearFormulario();
    localStorage.removeItem('medidaEditando');
}

// Resetear formulario a estado inicial
function resetearFormulario() {
    document.getElementById('nombre').value = '';
    document.querySelector('.btn-registrar').style.display = 'block';
    document.querySelector('.btn-actualizar').style.display = 'none';
    document.getElementById('btnCancelar').style.display = 'none';
    medidaEditando = null;
    ocultarError('nombre');
    ocultarSugerencia();
}

// Mostrar mensaje en modal
function mostrarMensaje(titulo, texto, tipo) {
    document.getElementById('modalTitulo').textContent = titulo;
    document.getElementById('modalTexto').textContent = texto;
    
    const icono = document.getElementById('modalIcono');
    icono.textContent = tipo === 'success' ? '✓' : '✗';
    icono.style.background = tipo === 'success' ? '#28a745' : '#dc3545';
    
    document.getElementById('btnAceptar').style.display = 'block';
    document.getElementById('btnCancelarModal').style.display = 'none';
    
    modalMensaje.style.display = 'flex';
}

// Cerrar modal de mensaje
function cerrarModalMensaje() {
    modalMensaje.style.display = 'none';
}

// Cerrar modal de confirmación
function cerrarModalConfirmacion() {
    modalConfirmacion.style.display = 'none';
    medidaAEliminar = null;
}

// Mostrar error en un campo
function mostrarError(campo, mensaje) {
    document.getElementById(`error-${campo}`).textContent = mensaje;
    document.getElementById(campo).classList.add('input-error');
}

// Ocultar error de un campo
function ocultarError(campo) {
    document.getElementById(`error-${campo}`).textContent = '';
    document.getElementById(campo).classList.remove('input-error');
}

// Funciones para los botones del header
function irInicio() {
    window.location.href = 'index.html';
}

function toggleMenu() {
    const menu = document.getElementById('menuUsuario');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}