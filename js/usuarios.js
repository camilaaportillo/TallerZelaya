document.addEventListener("DOMContentLoaded", () => {
    // Variables globales
    let usuariosData = [];
    let estadoActual = "Activo";
    let vistaActual = "completa"; // "completa" o "soloInactivos"

    const tbody = document.querySelector(".tabla-contenedor tbody");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnRegistrar = document.querySelector(".btn-registrar");
    const btnActualizar = document.querySelector(".btn-actualizar");
    const btnInactivos = document.getElementById("btnInactivos");
    const btnVolver = document.getElementById("btnVolver");
    const contenedorFormulario = document.getElementById("contenedorFormulario");
    const estadoTabla = document.getElementById("estadoTabla");

    // Regex para validaciones
    const nombreRegex = /^[A-Za-z\s]{2,}$/;
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usuarioRegex = /^[A-Za-z0-9_]{4,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&._-])[A-Za-z\d!@#$%^&._-]{8,}$/;

    // Inicialización
    configurarEnterParaSiguienteInput();
    configurarBuscadorUsuarios();
    agregarBotonLimpiarBusqueda();
    configurarEventListeners();
    mostrarVistaCompleta();

    // Configuración de event listeners
    function configurarEventListeners() {
        btnInactivos.addEventListener("click", mostrarVistaInactivos);
        btnVolver.addEventListener("click", mostrarVistaCompleta);
        btnCancelar.addEventListener("click", resetFormulario);
        btnRegistrar.addEventListener("click", registrarUsuario);
        btnActualizar.addEventListener("click", actualizarUsuario);

        // Validación en tiempo real
        document.getElementById("nombre").addEventListener("input", () => {
            validarInput(document.getElementById("nombre"), nombreRegex, "Solo letras y mínimo 2 caracteres");
        });
        document.getElementById("correo").addEventListener("input", () => {
            validarInput(document.getElementById("correo"), correoRegex, "Correo no válido");
        });
        document.getElementById("usuario").addEventListener("input", () => {
            validarInput(document.getElementById("usuario"), usuarioRegex, "Mínimo 4 caracteres, letras, números o _");
        });
        document.getElementById("password").addEventListener("input", () => {
            validarInput(document.getElementById("password"), passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
        });

        // Validación de campos únicos
        document.getElementById("correo").addEventListener("blur", validarCorreoUnico);
        document.getElementById("usuario").addEventListener("blur", validarUsuarioUnico);
    }

    // Configurar buscador
    function configurarBuscadorUsuarios() {
        const inputBuscar = document.getElementById('inputBuscarUsuarios');
        const btnBuscar = document.querySelector('.buscador button');

        if (inputBuscar) {
            inputBuscar.addEventListener('input', filtrarUsuarios);
        }

        if (btnBuscar) {
            btnBuscar.addEventListener('click', filtrarUsuarios);
        }
    }

    // Agregar botón de limpiar búsqueda
    function agregarBotonLimpiarBusqueda() {
        const buscador = document.querySelector('.buscador');
        if (!buscador) return;

        if (buscador.querySelector('.btn-limpiar')) return;

        const botonLimpiar = document.createElement('button');
        botonLimpiar.className = 'btn-limpiar';
        botonLimpiar.innerHTML = '✕';
        botonLimpiar.title = 'Limpiar búsqueda';
        botonLimpiar.style.display = 'none';

        botonLimpiar.addEventListener('click', () => {
            const inputBuscar = document.getElementById('inputBuscarUsuarios');
            inputBuscar.value = '';
            inputBuscar.focus();
            filtrarUsuarios();
            botonLimpiar.style.display = 'none';
        });

        buscador.appendChild(botonLimpiar);

        const inputBuscar = document.getElementById('inputBuscarUsuarios');
        inputBuscar.addEventListener('input', function () {
            botonLimpiar.style.display = this.value ? 'flex' : 'none';
        });
    }

    // Función para filtrar usuarios
    function filtrarUsuarios() {
        const texto = document.getElementById('inputBuscarUsuarios').value.toLowerCase();
        const tbody = document.querySelector('.tabla-contenedor tbody');
        const filas = tbody.querySelectorAll('tr');
        let resultadosEncontrados = 0;

        filas.forEach(fila => {
            if (fila.classList.contains('fila-mensaje')) {
                fila.remove();
                return;
            }

            if (fila.cells.length <= 1) return;

            const nombre = fila.cells[0].textContent.toLowerCase();
            const correo = fila.cells[1].textContent.toLowerCase();
            const usuario = fila.cells[2].textContent.toLowerCase();
            const rol = fila.cells[3].textContent.toLowerCase();

            const coincide = nombre.includes(texto) ||
                correo.includes(texto) ||
                usuario.includes(texto) ||
                rol.includes(texto);

            if (coincide) {
                fila.style.display = '';
                resultadosEncontrados++;
            } else {
                fila.style.display = 'none';
            }
        });

        if (resultadosEncontrados === 0 && texto) {
            mostrarMensajeNoResultados(texto);
        } else {
            ocultarMensajeNoResultados();
        }
    }
    // Función para mostrar confirmación personalizada
    function showConfirmacionPersonalizada(mensaje) {
        return new Promise((resolve) => {
            const modal = document.getElementById("modalConfirmacion");
            const mensajeElem = document.getElementById("confirmacionMensaje");
            const btnSi = document.getElementById("btnConfirmarSi");
            const btnNo = document.getElementById("btnConfirmarNo");

            // Configurar el mensaje
            mensajeElem.innerHTML = mensaje;

            // Mostrar el modal
            modal.style.display = "flex";

            // Configurar event listeners
            const handleSi = () => {
                cleanup();
                resolve(true);
            };

            const handleNo = () => {
                cleanup();
                resolve(false);
            };

            const handleEscape = (e) => {
                if (e.key === "Escape") {
                    cleanup();
                    resolve(false);
                }
            };

            // Limpiar event listeners
            const cleanup = () => {
                modal.style.display = "none";
                btnSi.removeEventListener("click", handleSi);
                btnNo.removeEventListener("click", handleNo);
                document.removeEventListener("keydown", handleEscape);
            };

            // Agregar event listeners
            btnSi.addEventListener("click", handleSi);
            btnNo.addEventListener("click", handleNo);
            document.addEventListener("keydown", handleEscape);

            // Enfocar el botón de cancelar por defecto
            btnNo.focus();
        });
    }
    // Función para mostrar mensaje de no resultados
    function mostrarMensajeNoResultados(textoBusqueda) {
        const tbody = document.querySelector('.tabla-contenedor tbody');
        const mensajeExistente = tbody.querySelector('.fila-mensaje');
        if (mensajeExistente) mensajeExistente.remove();

        const tr = document.createElement('tr');
        tr.className = 'fila-mensaje';
        tr.innerHTML = `
            <td colspan="5" class="mensaje-no-resultados">
                <div class="icono-busqueda">🔍</div>
                <div class="texto-mensaje">
                    <h3>No se encontraron resultados</h3>
                    <p>No hay usuarios que coincidan con "<strong>${textoBusqueda}</strong>"</p>
                    <small>Intenta con otros términos de búsqueda</small>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    }

    // Función para ocultar mensaje de no resultados
    function ocultarMensajeNoResultados() {
        const tbody = document.querySelector('.tabla-contenedor tbody');
        const mensajes = tbody.querySelectorAll('.fila-mensaje');
        mensajes.forEach(mensaje => mensaje.remove());
    }

    function cargarUsuarios(estado = estadoActual) {
        console.log("🔄 Cargando usuarios con estado:", estado);
        estadoActual = estado;

        // Actualizar el texto del estado según la vista
        if (vistaActual === "soloInactivos") {
            estadoTabla.textContent = "Mostrando Usuarios Inactivos";
        } else {
            estadoTabla.textContent = "Mostrando usuarios Activos";
        }

        fetch(`php/listar_usuarios.php?estado=${estado}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Error HTTP: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                console.log("📊 Datos recibidos:", data);
                usuariosData = data;
                tbody.innerHTML = "";

                if (!data || data.length === 0) {
                    tbody.innerHTML = `<tr class="fila-mensaje">
                    <td colspan="5" class="mensaje-no-datos">
                        <div class="icono-datos">📋</div>
                        <div class="texto-mensaje">
                            <h3>No hay usuarios ${estado.toLowerCase()}s</h3>
                            <p>No se encontraron usuarios en estado "${estado}"</p>
                        </div>
                    </td>
                </tr>`;
                    return;
                }

                data.forEach(user => {
                    const tr = document.createElement("tr");

                    // Diferente botón según la vista
                    const botonAccion = vistaActual === "soloInactivos"
                        ? `<button class="btn-activar" data-id="${user.id_usuario}">Habilitar</button>` : `<button class="btn-editar" data-id="${user.id_usuario}">Editar</button>`;

                    tr.innerHTML =
                        `<td>${user.nombre}</td>
                <td>${user.correo}</td>
                <td>${user.usuario}</td>
                <td>${user.rol}</td>
                <td>${botonAccion}</td>`;
                    tbody.appendChild(tr);

                    // Configurar el event listener según el tipo de botón
                    if (vistaActual === "soloInactivos") {
                        const botonActivar = tr.querySelector(".btn-activar");
                        botonActivar.addEventListener("click", () => {
                            activarUsuario(user.id_usuario, user.nombre);
                        });
                    } else {
                        const botonEditar = tr.querySelector(".btn-editar");
                        botonEditar.addEventListener("click", () => {
                            prepararEdicion(user);
                        });
                    }
                });

                console.log("✅ Tabla cargada exitosamente");

                // Aplicar filtro solo si estamos en vista completa y hay texto de búsqueda
                if (vistaActual === "completa") {
                    const textoBusqueda = document.getElementById('inputBuscarUsuarios').value;
                    if (textoBusqueda) {
                        setTimeout(filtrarUsuarios, 100);
                    }
                }
            })
            .catch(err => {
                console.error("❌ Error cargando usuarios:", err);
                showModalMensaje("error", "Error", "No se pudieron cargar los usuarios: " + err.message);

                // Mostrar mensaje de error en la tabla también
                tbody.innerHTML = `
            <tr class="fila-mensaje">
                <td colspan="5" class="mensaje-error">
                    <div class="icono-error">⚠</div>
                    <div class="texto-mensaje">
                        <h3>Error al cargar usuarios</h3>
                        <p>${err.message}</p>
                    </div>
                </td>
            </tr>`;
            });
    }

    // Función para activar usuario (cambiar estado de Inactivo a Activo)
    async function activarUsuario(id, nombre) {
        const confirmado = await showConfirmacionPersonalizada(
            `¿Estás seguro de que deseas activar al usuario <strong>"${nombre}"</strong>?`
        );

        // Si el usuario cancela, no hacer nada
        if (!confirmado) {
            return;
        }

        // Buscar el usuario completo en los datos cargados
        const usuario = usuariosData.find(user => user.id_usuario == id);

        if (!usuario) {
            showModalMensaje("error", "Error", "No se encontraron los datos completos del usuario.");
            return;
        }

        // Mostrar mensaje de carga
        showModalMensaje("info", "Activando", "Activando usuario, por favor espere...");

        // Preparar todos los datos requeridos por editar_usuarios.php
        const datos = new FormData();
        datos.append("id_usuario", id);
        datos.append("nombre", usuario.nombre);
        datos.append("correo", usuario.correo);
        datos.append("rol", usuario.id_rol);  // Asegúrate de usar id_rol, no rol
        datos.append("estado", "Activo"); // Cambiar estado a Activo

        // Agregar información del usuario para bitácora
        const usuarioSesion = JSON.parse(sessionStorage.getItem('usuario') || '{}');
        datos.append("usuario_bitacora_id", usuarioSesion.id || '');
        datos.append("usuario_bitacora_nombre", usuarioSesion.nombre || 'Sistema');

        fetch("php/editar_usuarios.php", {
            method: "POST",
            body: datos
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    showModalMensaje("exito", "Éxito", "Usuario activado correctamente");

                    // Recargar la lista de usuarios inactivos después de activar
                    setTimeout(() => {
                        cargarUsuarios("Inactivo");
                    }, 1500);

                } else {
                    throw new Error(data.mensaje || "Error desconocido del servidor");
                }
            })
            .catch(error => {
                console.error("❌ Error activando usuario:", error);
                showModalMensaje("error", "Error", "Ocurrió un error al activar el usuario: " + error.message);
            });
    }

    // Función para preparar edición
    function prepararEdicion(user) {
        document.getElementById("nombre").value = user.nombre;
        document.getElementById("correo").value = user.correo;
        document.getElementById("usuario").value = user.usuario;
        document.getElementById("rol").value = user.id_rol;
        document.getElementById("estado").value = user.estado;

        document.getElementById("campo-usuario-contrasena").style.display = "none";
        document.getElementById("password").style.display = "none";
        document.getElementById("mensaje-usuario-contrasena").style.display = "block";
        document.getElementById("campo-estado").style.display = "flex";
        document.getElementById("btnInactivos").style.display = "none";


        btnRegistrar.style.display = "none";
        btnActualizar.style.display = "inline-block";
        btnCancelar.style.display = "inline-block";

        tbody.dataset.idSeleccionado = user.id_usuario.toString();

        setTimeout(configurarEnterParaSiguienteInput, 100);
        document.querySelector(".tabla-contenedor").classList.add("tabla-bloqueada");
    }

    // Función para mostrar vista de inactivos
    function mostrarVistaInactivos() {
        vistaActual = "soloInactivos";
        contenedorFormulario.style.display = "none";
        btnInactivos.style.display = "none";
        btnVolver.style.display = "flex";

        // Ocultar buscador en vista de inactivos
        const buscador = document.querySelector('.buscador');
        if (buscador) buscador.style.display = 'none';

        // Actualizar título
        estadoTabla.textContent = "Usuarios Inactivos";

        // Centrar título cuando no hay buscador
        estadoTabla.style.margin = "0 auto";
        // Cargar solo usuarios inactivos
        cargarUsuarios("Inactivo");
    }

    // Función para mostrar vista completa
    function mostrarVistaCompleta() {
        vistaActual = "completa";
        contenedorFormulario.style.display = "block";
        btnInactivos.style.display = "block";
        btnVolver.style.display = "none"; // Ocultar botón volver

        // Mostrar buscador
        const buscador = document.querySelector('.buscador');
        if (buscador) buscador.style.display = 'flex';

        // Actualizar título
        estadoTabla.textContent = "Mostrando usuarios Activos";

        // Restaurar margen del título
        estadoTabla.style.margin = "0 auto";

        // Cargar solo usuarios activos
        cargarUsuarios("Activo");

        // Resetear formulario si estaba en modo edición
        if (btnActualizar.style.display === "inline-block") {
            resetFormulario();
        }
    }

    // Función para resetear formulario
    function resetFormulario() {
        if (vistaActual === "completa") {
            document.getElementById("campo-usuario-contrasena").style.display = "flex";
            document.getElementById("password").style.display = "flex";
            document.getElementById("mensaje-usuario-contrasena").style.display = "none";
            document.getElementById("campo-estado").style.display = "none";
            document.getElementById("btnInactivos").style.display = "flex";


            btnRegistrar.style.display = "inline-block";
            btnActualizar.style.display = "none";
            btnCancelar.style.display = "none";

            // Limpiar inputs
            document.getElementById("nombre").value = "";
            document.getElementById("correo").value = "";
            document.getElementById("usuario").value = "";
            document.getElementById("password").value = "";
            document.getElementById("rol").value = "";

            // Limpiar id seleccionado
            tbody.dataset.idSeleccionado = "";

            // Asegurarse de que el botón de actualizar esté restablecido
            btnActualizar.disabled = false;
            btnActualizar.textContent = "Actualizar Usuario";
        }
        document.querySelector(".tabla-contenedor").classList.remove("tabla-bloqueada");
    }

    // Función para registrar usuario
    async function registrarUsuario() {
        if (!await validarFormularioCompleto()) return;

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();
        const rol = document.getElementById("rol").value;

        if (!nombre || !correo || !usuario || !password || !rol) {
            showModalMensaje("advertencia", "Campos incompletos", "Por favor completa todos los campos.");
            return;
        }

        // ✅ VALIDACIÓN: Límite de administradores al crear
        if (rol === '1') {
            const limiteAdministradores = await verificarLimiteAdministradores();
            if (!limiteAdministradores.puedeCrear) {
                showModalMensaje("error", "Límite alcanzado", `No se pueden crear más de ${limiteAdministradores.maximo} administradores en el sistema`);
                return;
            }
        }

        const datos = new FormData();
        datos.append("nombre", nombre);
        datos.append("correo", correo);
        datos.append("usuario", usuario);
        datos.append("password", password);
        datos.append("rol", rol);

        // Agregar información del usuario para bitácora
        const usuarioSesion = JSON.parse(sessionStorage.getItem('usuario') || '{}');
        datos.append("usuario_bitacora_id", usuarioSesion.id || '');
        datos.append("usuario_bitacora_nombre", usuarioSesion.nombre || 'Sistema');

        fetch("php/usuarios.php", {
            method: "POST",
            body: datos
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    showModalMensaje("exito", "Éxito", data.mensaje);
                    cargarUsuarios();
                    resetFormulario();
                } else {
                    showModalMensaje("error", "Error", data.mensaje);
                }
            })
            .catch(error => {
                console.error("Error registrando usuario:", error);
                showModalMensaje("error", "Error", "Error al registrar usuario");
            });
    }

    // Función para actualizar usuario
    async function actualizarUsuario() {
        // Deshabilitar el botón inmediatamente
        btnActualizar.disabled = true;
        btnActualizar.textContent = "Actualizando...";

        try {
            // SOLO validar si estamos en vista completa (edición normal)
            if (vistaActual === "completa" && !await validarFormularioCompleto()) {
                throw new Error("Información no válida");
            }

            const id = tbody.dataset.idSeleccionado;
            const nuevoEstado = document.getElementById("estado").value;

            if (!id) {
                throw new Error("No se ha seleccionado ningún usuario para editar");
            }

            // ✅ VALIDACIÓN 1: No permitir desactivarse a sí mismo
            const usuarioSesion = JSON.parse(sessionStorage.getItem('usuario') || '{}');
            if (parseInt(id) === parseInt(usuarioSesion.id) && nuevoEstado === 'Inactivo') {
                throw new Error("No puedes desactivar tu propia cuenta");
            }

            const nombre = document.getElementById("nombre").value.trim();
            const correo = document.getElementById("correo").value.trim();
            const rol = document.getElementById("rol").value;
            const estado = nuevoEstado;

            // ✅ VALIDACIÓN 2: Verificar límite de administradores (solo si está cambiando a administrador activo)
            if (rol === '1' && estado === 'Activo') {
                const limiteAdministradores = await verificarLimiteAdministradores(id);
                if (!limiteAdministradores.puedeCrear) {
                    throw new Error(`No se pueden tener más de ${limiteAdministradores.maximo} administradores activos en el sistema`);
                }
            }

            const datos = new FormData();
            datos.append("id_usuario", id);
            datos.append("nombre", nombre);
            datos.append("correo", correo);
            datos.append("rol", rol);
            datos.append("estado", estado);

            const response = await fetch("php/editar_usuarios.php", {
                method: "POST",
                body: datos
            });

            // Verificar si la respuesta es JSON
            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                const text = await response.text();
                console.error("❌ Respuesta no JSON:", text);
                throw new Error("Respuesta no válida del servidor");
            }

            if (data.status === "success") {
                showModalMensaje("exito", "Éxito", data.mensaje);

                // Recargar la vista actual después de editar
                setTimeout(() => {
                    if (vistaActual === "soloInactivos") {
                        cargarUsuarios("Inactivo");
                    } else {
                        cargarUsuarios("Activo");
                    }

                    if (vistaActual === "completa") resetFormulario();
                }, 1500);

            } else {
                throw new Error(data.mensaje || "Error desconocido del servidor");
            }

        } catch (error) {
            console.error("🔥 Error en la actualización:", error);
            showModalMensaje("error", "Error", "Ocurrió un error: " + error.message);

        } finally {
            // Siempre restablecer el botón
            btnActualizar.disabled = false;
            btnActualizar.textContent = "Actualizar Usuario";
        }
    }

    // ✅ NUEVA FUNCIÓN: Verificar límite de administradores
    async function verificarLimiteAdministradores(idUsuarioExcluir = 0) {
        try {
            const response = await fetch(`php/usuarios.php?accion=contar_administradores&id_excluir=${idUsuarioExcluir}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verificando límite de administradores:', error);
            return { puedeCrear: true, maximo: 2 }; // Por defecto permitir si hay error
        }
    }

    // Función para validar formulario completo
    async function validarFormularioCompleto() {
        const esEdicion = btnActualizar.style.display === "inline-block";
        const idExcluir = esEdicion ? tbody.dataset.idSeleccionado : 0;

        const validNombre = validarInput(document.getElementById("nombre"), nombreRegex, "Solo letras y mínimo 2 caracteres");
        const validCorreo = validarInput(document.getElementById("correo"), correoRegex, "Correo no válido");

        let validUsuario = true;
        let validPassword = true;

        if (!esEdicion) {
            validUsuario = validarInput(document.getElementById("usuario"), usuarioRegex, "Mínimo 4 caracteres, letras, números o _");

            const password = document.getElementById("password").value.trim();
            if (password) {
                validPassword = validarInput(document.getElementById("password"), passwordRegex, "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial");
            }
        }

        if (!validNombre || !validCorreo || !validUsuario || !validPassword) {
            return false;
        }

        // Validar campos únicos
        const correo = document.getElementById("correo").value.trim();
        if (correo) {
            const validacionCorreo = await validarCampoExistente('correo', correo, idExcluir);
            if (!validacionCorreo.valido) {
                mostrarErrorCampo("correo", validacionCorreo.mensaje);
                return false;
            }
        }

        if (!esEdicion) {
            const usuario = document.getElementById("usuario").value.trim();
            if (usuario) {
                const validacionUsuario = await validarCampoExistente('usuario', usuario, idExcluir);
                if (!validacionUsuario.valido) {
                    mostrarErrorCampo("usuario", validacionUsuario.mensaje);
                    return false;
                }
            }
        }

        return true;
    }

    // Función para validar campo único (correo)
    async function validarCorreoUnico() {
        const correo = document.getElementById("correo").value.trim();
        const idExcluir = tbody.dataset.idSeleccionado || 0;

        if (correo && validarInput(document.getElementById("correo"), correoRegex, "Correo no válido")) {
            mostrarLoadingCampo("correo");
            const resultado = await validarCampoExistente('correo', correo, idExcluir);

            if (!resultado.valido) {
                mostrarErrorCampo("correo", resultado.mensaje);
            } else {
                mostrarCheckCampo("correo");
                limpiarErrorCampo("correo");
            }
        }
    }

    // Función para validar campo único (usuario)
    async function validarUsuarioUnico() {
        const usuario = document.getElementById("usuario").value.trim();
        const idExcluir = tbody.dataset.idSeleccionado || 0;

        if (usuario && validarInput(document.getElementById("usuario"), usuarioRegex, "Mínimo 4 caracteres, letras, números o _")) {
            mostrarLoadingCampo("usuario");
            const resultado = await validarCampoExistente('usuario', usuario, idExcluir);

            if (!resultado.valido) {
                mostrarErrorCampo("usuario", resultado.mensaje);
            } else {
                mostrarCheckCampo("usuario");
                limpiarErrorCampo("usuario");
            }
        }
    }

    // Función para validar campo existente en el servidor
    // Función para validar campo existente en el servidor
    async function validarCampoExistente(tipo, valor, idExcluir = 0) {
        try {
            const url = `php/usuarios.php?accion=validar&tipo=${tipo}&valor=${encodeURIComponent(valor)}&id_excluir=${idExcluir}`;
            console.log('🔍 DEBUG Validación - URL:', url);

            const response = await fetch(url);
            console.log('📊 DEBUG - Status:', response.status);
            console.log('📋 DEBUG - OK:', response.ok);

            const text = await response.text();
            console.log('📨 DEBUG - Respuesta cruda:', text);

            try {
                const data = JSON.parse(text);
                console.log('✅ DEBUG - JSON parseado:', data);
                return data;
            } catch (e) {
                console.error('❌ DEBUG - Error parseando JSON:', e);
                return { valido: false, mensaje: "Error en la respuesta del servidor" };
            }
        } catch (error) {
            console.error('💥 DEBUG - Error fetch:', error);
            return { valido: false, mensaje: `Error al validar ${tipo}` };
        }
    }

    // Función para validar input
    function validarInput(input, regex, mensajeError) {
        const valor = input.value.trim();
        const errorSpan = document.getElementById(`error-${input.id}`);

        if (!valor) {
            input.classList.remove("input-success");
            input.classList.add("input-error");
            errorSpan.textContent = "Este campo es obligatorio";
            return false;
        }

        if (!regex.test(valor)) {
            input.classList.remove("input-success");
            input.classList.add("input-error");
            errorSpan.textContent = mensajeError;
            return false;
        }

        input.classList.remove("input-error");
        input.classList.add("input-success");
        errorSpan.textContent = "";
        return true;
    }

    // Función para mostrar error en campo
    function mostrarErrorCampo(campoId, mensaje) {
        const campo = document.getElementById(campoId);
        const errorSpan = document.getElementById(`error-${campoId}`);

        campo.classList.remove("input-success");
        campo.classList.add("input-error");
        errorSpan.textContent = mensaje;
    }

    // Función para limpiar error de campo
    function limpiarErrorCampo(campoId) {
        const campo = document.getElementById(campoId);
        const errorSpan = document.getElementById(`error-${campoId}`);

        campo.classList.remove("input-error");
        campo.classList.remove("input-success");
        errorSpan.textContent = "";
    }

    // Función para mostrar loading en validación
    function mostrarLoadingCampo(campoId) {
        const errorSpan = document.getElementById(`error-${campoId}`);
        errorSpan.innerHTML = '<span style="color: #666;">Validando...</span>';
    }

    // Función para mostrar check de campo válido
    function mostrarCheckCampo(campoId) {
        const campo = document.getElementById(campoId);
        campo.classList.remove("input-error");
        campo.classList.add("input-success");
    }

    // Función para configurar tecla Enter
    function configurarEnterParaSiguienteInput() {
        const inputs = document.querySelectorAll('.formulario input:not([readonly]):not([disabled]), .formulario select:not([disabled])');

        inputs.forEach((input) => {
            input.removeEventListener('keydown', manejarEnter);
            input.addEventListener('keydown', manejarEnter);
        });

        function manejarEnter(e) {
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();

                const inputsArray = Array.from(document.querySelectorAll('.formulario input:not([readonly]):not([disabled]), .formulario select:not([disabled])'));
                const currentIndex = inputsArray.indexOf(e.target);

                if (currentIndex === inputsArray.length - 1) {
                    if (btnActualizar.style.display === "inline-block") {
                        if (validarFormulario()) {
                            btnActualizar.click();
                        }
                    } else {
                        if (validarFormulario()) {
                            btnRegistrar.click();
                        }
                    }
                } else {
                    inputsArray[currentIndex + 1].focus();
                    inputsArray[currentIndex + 1].dispatchEvent(new Event('input'));
                }
            }
        }
    }

    // Función para validar formulario (faltaba esta función)
    function validarFormulario() {
        // Validación básica para el formulario
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();

        if (!nombre || !correo) {
            showModalMensaje("advertencia", "Campos incompletos", "Por favor completa los campos obligatorios.");
            return false;
        }

        return true;
    }

    // Función para mostrar mensajes en modal
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

        const cerrarBtn = document.getElementById("cerrarMensaje");
        if (cerrarBtn) {
            cerrarBtn.onclick = () => {
                modalMensaje.style.display = "none";
            };
        }
    }

    // Funciones para el header
    function irInicio() {
        window.location.href = 'index.html';
    }

    function toggleMenu() {
        const menu = document.getElementById('menuUsuario');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    }
});

function irInicio() {
    window.location.href = "index.html";
}