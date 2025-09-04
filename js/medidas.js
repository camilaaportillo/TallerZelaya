// Variables globales
let medidas = [];
let medidaEditando = null;
let modalMensaje = document.getElementById('modalMensaje');
let modalConfirmacion = document.getElementById('modalConfirmacion');
let medidaAEliminar = null;
let timeoutSugerencia = null;
let vistaActualMedidas = "activas"; // "activas" o "inactivas"

const patronesMedidas = {
    pulgadas: /^(\d{1,2})(\.\d{1,3})?(")?$/, // Ej: 26", 27.5", 29.75"
    mixto: /^(\d{1,3})x(\d{1,3}(\.\d{1,3})?)(c)?$/ // Ej: 26x1.95, 700x25c, 29x2.25
};

// Cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function () {
    cargarMedidas();
    configurarEventListeners();
    restaurarEstadoEdicion();
    configurarValidacionesEnTiempoReal();
});
window.aplicarSugerenciaPulgadas = aplicarSugerenciaPulgadas;

// Configurar event listeners
function configurarEventListeners() {
    // Botones de cierre (X) para modales
    document.querySelectorAll('.cerrar-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            if (modalMensaje.style.display === 'flex') {
                cerrarModalMensaje();
            }
            if (modalConfirmacion.style.display === 'flex') {
                cerrarModalConfirmacion();
            }
        });
    });

    // Buscador
    document.getElementById('inputBuscarMedidas').addEventListener('input', filtrarMedidas);
    document.querySelector('.buscador button').addEventListener('click', filtrarMedidas);

    // Modal de mensajes
    document.getElementById('btnAceptar').addEventListener('click', cerrarModalMensaje);

    // Modal de confirmación
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminacion);
    document.getElementById('btnCancelarEliminar').addEventListener('click', cerrarModalConfirmacion);

    // Botones de vista
    document.getElementById('btnInactivasMedidas').addEventListener('click', mostrarMedidasInactivas);
    document.getElementById('btnVolverMedidas').addEventListener('click', mostrarMedidasActivas);

    // Event delegation para botones de editar/eliminar/activar
    document.querySelector('tbody').addEventListener('click', function (e) {
        if (e.target.matches('.btn-editar')) {
            const id = e.target.getAttribute('data-id');
            prepararEdicion(parseInt(id));
        } else if (e.target.matches('.btn-eliminar')) {
            const id = e.target.getAttribute('data-id');
            const nombre = e.target.getAttribute('data-nombre');
            solicitarEliminacion(parseInt(id), nombre);
        } else if (e.target.matches('.btn-activar-medida')) {
            const id = e.target.getAttribute('data-id');
            const nombre = e.target.getAttribute('data-nombre');
            activarMedida(parseInt(id), nombre);
        }
    });

    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function (event) {
        if (event.target == modalMensaje) {
            cerrarModalMensaje();
        }
        if (event.target == modalConfirmacion) {
            cerrarModalConfirmacion();
        }
    });

    // Limpiar estado al cerrar/recargar la página
    window.addEventListener('beforeunload', function () {
        if (medidaEditando) {
            localStorage.setItem('medidaEditando', JSON.stringify(medidaEditando));
        } else {
            localStorage.removeItem('medidaEditando');
        }
    });

    // Validación en tiempo real para el campo de medida
    const campoMedida = document.getElementById('nombre');
    if (campoMedida) {
        campoMedida.addEventListener('input', function () {
            const valor = this.value;
            ocultarError('nombre');

            clearTimeout(timeoutSugerencia);
            timeoutSugerencia = setTimeout(() => {
                if (valor.trim()) {
                    mostrarSugerenciaFormato(valor);
                } else {
                    ocultarSugerencia();
                }
            }, 300);
        });

        campoMedida.addEventListener('blur', function () {
            setTimeout(() => {
                ocultarSugerencia();
            }, 200);
        });

        campoMedida.addEventListener('focus', function () {
            const valor = this.value;
            if (valor.trim()) {
                mostrarSugerenciaFormato(valor);
            }
        });
    }
}

// Función para confirmar eliminación
// Función para confirmar eliminación - VERSIÓN MEJORADA
function confirmarEliminacion() {
    if (!medidaAEliminar) {
        console.error('No hay medida seleccionada para eliminar');
        return;
    }

    // Mostrar mensaje de carga
    showModalMensaje('info', 'Procesando', 'Eliminando medida, por favor espere...', 0);

    // Llamar a la API para desactivar (no eliminar)
    fetch('php/medidas_crud.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id=${medidaAEliminar.id}`
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showModalMensaje('exito', 'Éxito', 'Medida desactivada correctamente');
                // Recargar las medidas activas
                cargarMedidas("Activo");

                // Si estábamos editando esta medida, resetear el formulario
                if (medidaEditando && medidaEditando.id_medida === medidaAEliminar.id) {
                    resetearFormulario();
                }
            } else {
                showModalMensaje('error', 'Error', 'No se pudo desactivar la medida: ' + (data.message || 'Error desconocido'));
            }
            cerrarModalConfirmacion();
        })
        .catch(error => {
            console.error('Error al desactivar la medida:', error);
            showModalMensaje('error', 'Error', 'Error al desactivar la medida: ' + error.message);
            cerrarModalConfirmacion();
        });
}

// Configurar validaciones en tiempo real
function configurarValidacionesEnTiempoReal() {
    const campoMedida = document.getElementById('nombre');
    if (campoMedida) {
        campoMedida.addEventListener('blur', function () {
            const valor = this.value;
            if (valor.trim()) {
                const validacion = validarMedidaBicicleta(valor);
                if (!validacion.valido) {
                    mostrarError('nombre', validacion.mensaje);
                } else {
                    ocultarError('nombre');
                }
            }
            // Ocultar sugerencia después de un delay mayor
            setTimeout(() => {
                ocultarSugerencia();
            }, 300); // Aumentar el delay a 300ms
        });

        campoMedida.addEventListener('input', function () {
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
function cargarMedidas(estado = "Activo") {
    fetch(`php/medidas_crud.php?estado=${estado}`)
        .then(response => response.json())
        .then(data => {
            medidas = data;
            renderizarTabla(estado);
            restaurarEstadoEdicion();
        })
        .catch(error => {
            showModalMensaje('error', 'Error', 'No se pudieron cargar las medidas');
        });
}

// Renderizar la tabla con las medidas
function renderizarTabla(estado = "Activo") {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    if (medidas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; padding: 20px; color: #6c757d;">
                    No hay medidas ${estado === "Activo" ? "activas" : "inactivas"}
                </td>
            </tr>
        `;
        return;
    }

    medidas.forEach(medida => {
        const tr = document.createElement('tr');
        tr.dataset.id = medida.id_medida;
        tr.dataset.nombre = medida.medida_bicicleta;

        // Botón diferente según el estado
        let botonAccion = '';
        if (estado === "Activo") {
            botonAccion = `
                <button class="btn-editar" data-action="editar" data-id="${medida.id_medida}">Editar</button>
                <button class="btn-eliminar" data-action="eliminar" data-id="${medida.id_medida}" data-nombre="${medida.medida_bicicleta.replace(/"/g, '&quot;')}">Desactivar</button>
            `;
        } else {
            botonAccion = `
                <button class="btn-activar-medida" data-action="activar" data-id="${medida.id_medida}" data-nombre="${medida.medida_bicicleta.replace(/"/g, '&quot;')}">Activar</button>
            `;
        }

        tr.innerHTML = `
    <td class="medida-centrada">${medida.medida_bicicleta}</td>
    <td class="acciones medida-centrada">
        ${botonAccion}
    </td>
        `;

        tbody.appendChild(tr);
    });
}

// Función para mostrar medidas inactivas
function mostrarMedidasInactivas() {
    vistaActualMedidas = "inactivas";
    document.querySelector('.formulario').style.display = 'none';
    document.getElementById('btnInactivasMedidas').style.display = 'none';
    document.getElementById('btnVolverMedidas').style.display = 'block';
    document.getElementById('estadoTablaMedidas').textContent = 'Medidas Inactivas';

    // Ocultar buscador
    document.querySelector('.buscador').style.display = 'none';

    // Cargar medidas inactivas
    cargarMedidas("Inactivo");
}

// Función para mostrar medidas activas
function mostrarMedidasActivas() {
    vistaActualMedidas = "activas";
    document.querySelector('.formulario').style.display = 'block';
    document.getElementById('btnInactivasMedidas').style.display = 'block';
    document.getElementById('btnVolverMedidas').style.display = 'none';
    document.getElementById('estadoTablaMedidas').textContent = 'Mostrando medidas Activas';

    // Mostrar buscador
    document.querySelector('.buscador').style.display = 'flex';

    // Cargar medidas activas
    cargarMedidas("Activo");

    // Resetear formulario si estaba en edición
    if (medidaEditando) {
        resetearFormulario();
    }
}

// Función para activar una medida
function activarMedida(id, nombre) {
    // Usar el modal de confirmación para activación
    medidaAEliminar = { id: id, nombre: nombre, action: 'activate' };

    // Obtener referencias a los elementos del modal de confirmación
    const modalTitulo = document.getElementById('modalConfirmacionTitulo');
    const textoConfirmacion = document.getElementById('textoConfirmacion');
    const modalIcono = document.getElementById('modalConfirmacionIcono'); // Cambiado a ID específico
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    const nuevoBtnConfirmar = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(nuevoBtnConfirmar, btnConfirmar);

    // Verificar que los elementos existen antes de modificarlos
    if (modalTitulo && textoConfirmacion && modalIcono && btnConfirmar) {
        // Configurar el modal de confirmación para activación
        modalTitulo.textContent = 'Confirmar Activación';
        textoConfirmacion.innerHTML = `¿Estás seguro de que deseas activar la medida <strong>"${nombre}"</strong>?`;
        modalIcono.textContent = '✓';
        modalIcono.style.background = '#28a745';

        btnConfirmar.textContent = 'Activar';
        btnConfirmar.style.background = '#28a745';

        // Mostrar el modal
        modalConfirmacion.style.display = 'flex';

        // Configurar el event listener para el botón de confirmar
        nuevoBtnConfirmar.onclick = function () {
            // Llamar a la API para activar la medida
            document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
            fetch('php/medidas_crud.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_medida: id,
                    estado: 'Activo'
                })
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error HTTP: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        showModalMensaje('exito', 'Éxito', 'Medida activada correctamente');
                        cargarMedidas("Inactivo");
                    } else {
                        showModalMensaje('error', 'Error', 'No se pudo activar la medida: ' + (data.message || 'Error desconocido'));
                    }
                    cerrarModalConfirmacion();
                })
                .catch(error => {
                    console.error('Error activando medida:', error);
                    showModalMensaje('error', 'Error', 'Error al activar la medida: ' + error.message);
                    cerrarModalConfirmacion();
                });
        };
    } else {
        console.error('Error: No se encontraron elementos del modal de confirmación');
        // Fallback: usar confirmación nativa
        if (confirm(`¿Estás seguro de que deseas activar la medida "${nombre}"?`)) {
            // Llamar a la API para activar la medida
            fetch('php/medidas_crud.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_medida: id,
                    estado: 'Activo'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        showModalMensaje('exito', 'Éxito', 'Medida activada correctamente');
                        cargarMedidas("Inactivo");
                    } else {
                        showModalMensaje('error', 'Error', 'No se pudo activar la medida: ' + data.message);
                    }
                })
                .catch(error => {
                    showModalMensaje('error', 'Error', 'Error al activar la medida');
                });
        }
    }
}
// Filtrar medidas según el texto de búsqueda
function filtrarMedidas() {
    const texto = document.getElementById('inputBuscarMedidas').value.toLowerCase();
    const tbody = document.querySelector('tbody');
    const filas = tbody.querySelectorAll('tr');

    filas.forEach(fila => {
        if (fila.cells.length === 1) return;

        const textoFila = fila.cells[0].textContent.toLowerCase();
        fila.style.display = textoFila.includes(texto) ? '' : 'none';
    });
}


// Función de validación mejorada
function validarMedidaBicicleta(valor, ignorarDuplicado = false) {
    const trimmedValor = valor.trim();

    // Validación básica
    if (!trimmedValor) {
        return { valido: false, mensaje: 'La medida es requerida' };
    }

    if (trimmedValor.length > 30) {
        return { valido: false, mensaje: 'La medida no puede exceder 30 caracteres' };
    }

    // Validar duplicados (solo si no estamos editando la misma medida Y no ignorarDuplicado es true)
    if (!ignorarDuplicado && (!medidaEditando || medidaEditando.medida_bicicleta.toLowerCase() !== trimmedValor.toLowerCase())) {
        if (medidaExiste(trimmedValor)) {
            return { valido: false, mensaje: 'Esta medida ya existe' };
        }
    }

    // Validar formato según los nuevos requisitos
    let formatoValido = false;
    let formatoDetectado = '';

    // Verificar formato de pulgadas
    if (patronesMedidas.pulgadas.test(trimmedValor)) {
        formatoValido = true;
        formatoDetectado = 'pulgadas';

        // Validar rango numérico para pulgadas (10-30)
        const match = trimmedValor.match(patronesMedidas.pulgadas);
        const numero = parseFloat(match[1] + (match[2] || '.0'));
        if (numero < 10 || numero > 30) {
            return {
                valido: false,
                mensaje: 'Las pulgadas deben estar entre 10" y 30"'
            };
        }
    }

    // Verificar formato mixto (si aún no es válido)
    if (!formatoValido && patronesMedidas.mixto.test(trimmedValor)) {
        formatoValido = true;
        formatoDetectado = 'mixto';

        // Validar rangos numéricos para medidas mixtas
        const match = trimmedValor.match(patronesMedidas.mixto);
        const primerNumero = parseInt(match[1]);
        const segundoNumero = parseFloat(match[2]);

        if (primerNumero < 10 || primerNumero > 999) {
            return {
                valido: false,
                mensaje: 'El primer número en medidas mixtas debe estar entre 10 y 999'
            };
        }

        if (segundoNumero < 1 || segundoNumero > 999) {
            return {
                valido: false,
                mensaje: 'El segundo número en medidas mixtas debe estar entre 1 y 999'
            };
        }
    }

    if (!formatoValido) {
        return {
            valido: false,
            mensaje: 'Formato de medida no válido. Solo se permiten: pulgadas (ej: 26", 27.5") o medidas mixtas (ej: 26x1.95, 700x25c)'
        };
    }

    return { valido: true, mensaje: '', formato: formatoDetectado };
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

    // Detectar si es un número simple que podría ser pulgadas
    if (/^\d{1,2}(\.\d{1,3})?$/.test(trimmedValor)) {
        const numero = parseFloat(trimmedValor);
        if (numero >= 10 && numero <= 30) {
            return `¿Quiso decir ${trimmedValor}"? (pulgadas)`;
        }
    }

    if (patronesMedidas.pulgadas.test(trimmedValor)) {
        return 'Pulgadas (ej: 26", 27.5")';
    }

    if (patronesMedidas.mixto.test(trimmedValor)) {
        return 'Medida mixta (ej: 26x1.95, 700x25c)';
    }

    if (trimmedValor.includes('"')) {
        return 'Formato de pulgadas detectado (complete el número)';
    }

    if (trimmedValor.includes('x')) {
        return 'Formato mixto detectado (complete los números)';
    }

    return 'Formato no válido. Use pulgadas (ej: 26") o medidas mixtas (ej: 26x1.95)';
}

// Función para mostrar sugerencia de formato
function mostrarSugerenciaFormato(valor) {
    // No mostrar sugerencia si hay un error de duplicado visible
    const errorElement = document.getElementById('error-nombre');
    if (errorElement && errorElement.textContent.includes('ya existe')) {
        ocultarSugerencia();
        return;
    }
    
    ocultarSugerencia();

    const sugerencia = sugerirFormatoMedida(valor);
    const campo = document.getElementById('nombre');

    const elementoAyuda = document.createElement('div');
    elementoAyuda.id = 'ayuda-formato';
    elementoAyuda.className = 'sugerencia-formato';

    // Detectar si es un número simple para dar un estilo especial
    const esNumeroSimple = /^\d{1,2}(\.\d{1,3})?$/.test(valor.trim());

    if (esNumeroSimple) {
        elementoAyuda.innerHTML = `
            <span class="sugerencia-icono">💡</span>
            <span class="sugerencia-texto">${sugerencia}</span>
            <button class="btn-aplicar-sugerencia">Aplicar</button>
        `;
        elementoAyuda.classList.add('sugerencia-con-boton');
        
        // Agregar event listener CON UNA COPIA del valor actual
        setTimeout(() => {
            const btnAplicar = elementoAyuda.querySelector('.btn-aplicar-sugerencia');
            if (btnAplicar) {
                btnAplicar.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    aplicarSugerenciaPulgadas(valor.trim());
                    return false;
                });
            }
        }, 10);
    } else {
        elementoAyuda.innerHTML = `
            <span class="sugerencia-icono">💡</span>
            <span class="sugerencia-texto">${sugerencia}</span>
        `;
    }

    // Insertar después del campo
    campo.parentNode.appendChild(elementoAyuda);

    // Aplicar estilo según si el formato es válido (ignorando duplicados temporalmente)
    const validacionSinDuplicado = validarMedidaBicicleta(valor, true);
    if (validacionSinDuplicado.valido) {
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
// Función para aplicar la sugerencia de pulgadas
function aplicarSugerenciaPulgadas(valor) {
    const campo = document.getElementById('nombre');
    const nuevoValor = valor + '"';
    campo.value = nuevoValor;

    // Enfocar y posicionar cursor al final
    campo.focus();
    setTimeout(() => {
        campo.setSelectionRange(nuevoValor.length, nuevoValor.length);
    }, 0);

    // Ocultar sugerencia actual
    ocultarSugerencia();

    // Validar el nuevo valor pero IGNORANDO duplicados temporalmente
    const validacion = validarMedidaBicicleta(nuevoValor, true); // true = ignorar duplicados

    if (!validacion.valido && !validacion.mensaje.includes('ya existe')) {
        mostrarError('nombre', validacion.mensaje);
    } else {
        ocultarError('nombre');
    }

    // Disparar evento input para actualizar la interfaz
    const event = new Event('input', { bubbles: true });
    campo.dispatchEvent(event);

    // Volver a mostrar la sugerencia con el nuevo valor
    setTimeout(() => {
        mostrarSugerenciaFormato(nuevoValor);
    }, 50);
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
                showModalMensaje('exito', 'Éxito', 'Medida creada correctamente');
                document.getElementById('nombre').value = '';
                cargarMedidas();
                resetearFormulario();
                localStorage.removeItem('medidaEditando');
            } else {
                showModalMensaje('error', 'Error', data.message);
            }
        })
        .catch(error => {
            showModalMensaje('error', 'Error', 'Error al crear la medida');
        });
}

// Preparar edición de medida
function prepararEdicion(id) {
    const medida = medidas.find(m => m.id_medida == id);

    if (!medida) {
        showModalMensaje('error', 'Error', 'No se encontró la medida seleccionada');
        return;
    }

    medidaEditando = medida;
    document.getElementById('nombre').value = medida.medida_bicicleta;
    document.querySelector('.btn-registrar').style.display = 'none';
    document.querySelector('.btn-actualizar').style.display = 'block';
    document.getElementById('btnCancelar').style.display = 'block';

    localStorage.setItem('medidaEditando', JSON.stringify(medidaEditando));
    document.querySelector(".tabla-contenedor").classList.add("tabla-bloqueada");
}

// Actualizar medida existente
function actualizarMedida() {
    if (!medidaEditando) {
        showModalMensaje('error', 'Error', 'No hay ninguna medida seleccionada para actualizar');
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
                showModalMensaje('exito', 'Éxito', 'Medida actualizada correctamente');
                cargarMedidas();
                resetearFormulario();
                localStorage.removeItem('medidaEditando');
            } else {
                showModalMensaje('error', 'Error', data.message);
            }
        })
        .catch(error => {
            showModalMensaje('error', 'Error', 'Error al actualizar la medida');
        });
}


// Solicitar eliminación de medida
function solicitarEliminacion(id, nombre) {
    // Usar el modal de confirmación existente
    medidaAEliminar = { id: id, nombre: nombre };

    // Obtener referencias a los elementos del modal
    const modalTitulo = document.getElementById('modalConfirmacionTitulo');
    const textoConfirmacion = document.getElementById('textoConfirmacion');
    const modalIcono = document.querySelector('#modalConfirmacion .modal-icono');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');

    // Verificar que los elementos existen antes de modificarlos
    if (modalTitulo && textoConfirmacion && modalIcono && btnConfirmar) {
        // Configurar el modal de confirmación
        modalTitulo.textContent = 'Confirmar Desactivación';
        textoConfirmacion.innerHTML = `¿Estás seguro de que deseas desactivar la medida <strong>"${nombre}"</strong>?`;
        modalIcono.textContent = '?';
        modalIcono.style.background = '#dc3545';

        btnConfirmar.textContent = 'Desactivar';
        btnConfirmar.style.background = '#a10404';

        // Mostrar el modal
        modalConfirmacion.style.display = 'flex';

        // Restaurar el event listener por defecto
        btnConfirmar.onclick = confirmarEliminacion;
    } else {
        console.error('Error: No se encontraron elementos del modal de confirmación');
        // Fallback: usar alerta nativa
        if (confirm(`¿Estás seguro de que deseas eliminar la medida "${nombre}"?`)) {
            confirmarEliminacion();
        }
    }
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
    document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");

}

// Función para mostrar mensajes en modal (versión mejorada)
function showModalMensaje(tipo, titulo, texto, tiempoAutoCerrar = 3000) {
    const modalMensaje = document.getElementById("modalMensaje");
    const modalIcono = document.getElementById("modalIcono");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalTexto = document.getElementById("modalTexto");

    if (!modalMensaje) return;

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
        modalIcono.classList.add("icono-info");
        modalIcono.innerHTML = "ⓘ";
    }

    modalTitulo.innerText = titulo;
    modalTexto.innerText = texto;
    modalMensaje.style.display = "flex";

    // Solo auto-cerrar si no es un mensaje de info (carga)
    if (tipo !== "info" && tiempoAutoCerrar > 0) {
        setTimeout(() => {
            modalMensaje.style.display = "none";
        }, tiempoAutoCerrar);
    }

    const btnAceptar = document.getElementById("btnAceptar");
    if (btnAceptar) {
        btnAceptar.onclick = () => {
            modalMensaje.style.display = "none";
        };
    }
}

// Cerrar modal de mensaje
function cerrarModalMensaje() {
    modalMensaje.style.display = 'none';
}

// Cerrar modal de confirmación
function cerrarModalConfirmacion() {
    if (modalConfirmacion) {
        modalConfirmacion.style.display = 'none';
    }
    medidaAEliminar = null;

    // Restaurar valores por defecto del modal de confirmación
    const modalTitulo = document.getElementById('modalConfirmacionTitulo');
    const textoConfirmacion = document.getElementById('textoConfirmacion');
    const modalIcono = document.querySelector('#modalConfirmacion .modal-icono');
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');

    if (modalTitulo && textoConfirmacion && modalIcono && btnConfirmar) {
        modalTitulo.textContent = 'Confirmar Desactivación';
        textoConfirmacion.textContent = '¿Estás seguro de que deseas desactivar esta medida?';
        modalIcono.textContent = '?';
        modalIcono.style.background = '#dc3545';
        btnConfirmar.textContent = 'Eliminar';
        btnConfirmar.style.background = '#a10404';
        btnConfirmar.onclick = confirmarEliminacion;
    }
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