document.addEventListener("DOMContentLoaded", () => {
    configurarEnterParaSiguienteInput();
    document.getElementById("btnActivos").addEventListener("click", () => {
        cargarUsuarios("Activo");
    });

    document.getElementById("btnInactivos").addEventListener("click", () => {
        cargarUsuarios("Inactivo");
    });

    let usuariosData = [];
    let estadoActual = "Activo";
    const tbody = document.querySelector(".tabla-contenedor tbody");
    const btnCancelar = document.getElementById("btnCancelar");
    const btnActivos = document.getElementById("btnActivos");
    const btnInactivos = document.getElementById("btnInactivos");
    const estadoTabla = document.getElementById("estadoTabla");

    // Función única para validaciones
    async function validarCampoExistente(tipo, valor, idExcluir = 0) {
        try {
            const response = await fetch(`php/usuarios.php?accion=validar&tipo=${tipo}&valor=${encodeURIComponent(valor)}&id_excluir=${idExcluir}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error validando ${tipo}:`, error);
            return { valido: false, mensaje: `Error al validar ${tipo}` };
        }
    }

    // Función para mostrar error en un campo
    function mostrarErrorCampo(campoId, mensaje) {
        const campo = document.getElementById(campoId);
        const errorSpan = document.getElementById(`error-${campoId}`);

        campo.classList.remove("input-success");
        campo.classList.add("input-error");
        errorSpan.textContent = mensaje;
    }

    // Función para limpiar error de un campo
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

    // MODIFICAR LA FUNCIÓN validarFormulario EXISTENTE
    async function validarFormularioCompleto() {
        const esEdicion = document.querySelector(".btn-actualizar").style.display === "inline-block";
        const idExcluir = esEdicion ? tbody.dataset.idSeleccionado : 0;

        // Validaciones básicas
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

        // Si las validaciones básicas fallan, no continuar
        if (!validNombre || !validCorreo || !validUsuario || !validPassword) {
            return false;
        }

        // Validar que el correo no exista
        const correo = document.getElementById("correo").value.trim();
        if (correo) {
            const validacionCorreo = await validarCampoExistente('correo', correo, idExcluir);
            if (!validacionCorreo.valido) {
                mostrarErrorCampo("correo", validacionCorreo.mensaje);
                return false;
            }
        }

        // Validar que el usuario no exista (solo en modo registro)
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
    // Función mejorada para manejar el evento Enter
    function configurarEnterParaSiguienteInput() {
        // Seleccionar todos los inputs y selects del formulario
        const inputs = document.querySelectorAll('.formulario input:not([readonly]):not([disabled]), .formulario select:not([disabled])');

        inputs.forEach((input, index) => {
            // Remover event listener previo para evitar duplicados
            input.removeEventListener('keydown', manejarEnter);
            input.addEventListener('keydown', manejarEnter);
        });

        function manejarEnter(e) {
            // Verificar si se presionó Enter (código 13)
            if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault(); // Prevenir comportamiento por defecto

                const inputsArray = Array.from(document.querySelectorAll('.formulario input:not([readonly]):not([disabled]), .formulario select:not([disabled])'));
                const currentIndex = inputsArray.indexOf(e.target);

                // Si es el último campo, enviar el formulario
                if (currentIndex === inputsArray.length - 1) {
                    // Determinar qué botón presionar según el modo
                    if (document.querySelector(".btn-actualizar").style.display === "inline-block") {
                        if (validarFormulario()) {
                            document.querySelector(".btn-actualizar").click();
                        }
                    } else {
                        if (validarFormulario()) {
                            document.querySelector(".btn-registrar").click();
                        }
                    }
                } else {
                    // Mover al siguiente campo
                    inputsArray[currentIndex + 1].focus();

                    // Disparar evento input para validación en tiempo real
                    inputsArray[currentIndex + 1].dispatchEvent(new Event('input'));
                }
            }
        }
    }

    // AGREGAR VALIDACIONES EN TIEMPO REAL (después de las validaciones existentes)
    document.getElementById("correo").addEventListener("blur", async () => {
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
    });

    document.getElementById("usuario").addEventListener("blur", async () => {
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
    });
    // Función para cargar usuarios
    function cargarUsuarios(estado = estadoActual) {
        console.log("🔄 Cargando usuarios con estado:", estado);
        estadoActual = estado;

        fetch(`php/listar_usuarios.php?estado=${estado}`)
            .then(res => {
                console.log("📊 Respuesta de listar_usuarios:", res.status);
                return res.json();
            })
            .then(data => {
                console.log("👥 Usuarios cargados:", data.length, "registros");
                usuariosData = data;
                tbody.innerHTML = ""; // limpiar tabla

                // Actualizar texto de estado
                estadoTabla.textContent = estado === "Activo" ? "Mostrando usuarios Activos" : "Mostrando usuarios Inactivos";
                console.log("📝 Estado actualizado:", estadoTabla.textContent);

                // Actualizar botones
                actualizarBotones(estado);
                console.log("🎛️ Botones actualizados");

                data.forEach(user => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${user.usuario}</td>
                    <td>${user.rol}</td>
                    <td>
                        <button class="btn-editar" data-id="${user.id_usuario}" style="background: #0026ff; color: white">Editar</button>
                    </td>
                `;
                    tbody.appendChild(tr);

                    // Evento editar
                    tr.querySelector(".btn-editar").addEventListener("click", () => {
                        // Rellenar formulario
                        document.getElementById("nombre").value = user.nombre;
                        document.getElementById("correo").value = user.correo;
                        document.getElementById("usuario").value = user.usuario;
                        document.getElementById("rol").value = user.id_rol;
                        document.getElementById("estado").value = user.estado;

                        // Ajustar visibilidad de campos y botones
                        document.getElementById("campo-usuario-contrasena").style.display = "none";
                        document.getElementById("password").style.display = "none";
                        document.getElementById("mensaje-usuario-contrasena").style.display = "block";
                        document.getElementById("campo-estado").style.display = "flex";

                        document.querySelector(".btn-registrar").style.display = "none";
                        document.querySelector(".btn-actualizar").style.display = "inline-block";
                        btnCancelar.style.display = "inline-block";

                        // Guardar id seleccionado - asegurarnos de que es un string
                        tbody.dataset.idSeleccionado = user.id_usuario.toString();
                        console.log("ID seleccionado:", tbody.dataset.idSeleccionado);
                        // 🔥 RECONFIGURAR ENTER PARA MODO EDICIÓN
                        setTimeout(() => {
                            configurarEnterParaSiguienteInput();
                        }, 100);
                    });
                });

                console.log("✅ Tabla cargada exitosamente");
            })
            .catch(err => {
                console.error("❌ Error cargando usuarios:", err);
                showModalMensaje("error", "Error", "No se pudieron cargar los usuarios: " + err.message);
            });
    }

    // Llamar al cargar la página
    cargarUsuarios();

    // Registrar usuario
    const btnRegistrar = document.querySelector(".btn-registrar");
    btnRegistrar.addEventListener("click", async () => {
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

        const datos = new FormData();
        datos.append("nombre", nombre);
        datos.append("correo", correo);
        datos.append("usuario", usuario);
        datos.append("password", password);
        datos.append("rol", rol);

        fetch("php/usuarios.php", {
            method: "POST",
            body: datos
        })
            .then(res => res.json())
            .then(data => {
                showModalMensaje("exito", "Éxito", data.mensaje);
                cargarUsuarios(); // 🔹 refresca la tabla automáticamente
                // Limpiar formulario
                document.getElementById("nombre").value = "";
                document.getElementById("correo").value = "";
                document.getElementById("usuario").value = "";
                document.getElementById("password").value = "";
                document.getElementById("rol").value = "";
            });
    });

    // Actualizar usuario
    const btnActualizar = document.querySelector(".btn-actualizar");
    btnActualizar.addEventListener("click", async () => {
        if (!await validarFormularioCompleto()) {
            console.log("❌ Validación de formulario falló");
            return;
        }

        const id = tbody.dataset.idSeleccionado;
        const nuevoEstado = document.getElementById("estado").value;

        console.log("🔍 Iniciando actualización...");
        console.log("ID:", id);
        console.log("Nuevo estado:", nuevoEstado);

        if (!id) {
            console.log("❌ No hay ID seleccionado");
            showModalMensaje("error", "Error", "No se ha seleccionado ningún usuario para editar.");
            return;
        }

        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const rol = document.getElementById("rol").value;
        const estado = nuevoEstado;

        const datos = new FormData();
        datos.append("id_usuario", id);
        datos.append("nombre", nombre);
        datos.append("correo", correo);
        datos.append("rol", rol);
        datos.append("estado", estado);

        console.log("📤 Enviando datos:", Object.fromEntries(datos));

        btnActualizar.disabled = true;
        btnActualizar.textContent = "Actualizando...";

        fetch("php/editar_usuarios.php", {
            method: "POST",
            body: datos
        })
            .then(res => {
                console.log("📨 Respuesta HTTP:", res.status, res.statusText);
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    return res.json();
                } else {
                    return res.text().then(text => {
                        console.error("❌ Respuesta no JSON:", text);
                        throw new Error("Respuesta no válida del servidor");
                    });
                }
            })
            .then(data => {
                console.log("📊 Respuesta del servidor:", data);

                if (data.status === "success") {
                    console.log("✅ Actualización exitosa");
                    showModalMensaje("exito", "Éxito", data.mensaje);

                    // Pequeña pausa para que se vea el mensaje antes de recargar
                    setTimeout(() => {
                        console.log("🔄 Recargando tabla con nuevo estado:", nuevoEstado);
                        cargarUsuarios(nuevoEstado);
                        resetFormulario();
                    }, 1500);

                } else {
                    console.log("❌ Error del servidor:", data.mensaje);
                    showModalMensaje("error", "Error", data.mensaje);
                }
            })
            .catch(error => {
                console.error("🔥 Error en la solicitud:", error);
                showModalMensaje("error", "Error", "Ocurrió un error: " + error.message);
            })
            .finally(() => {
                console.log("🏁 Proceso de actualización finalizado");
                btnActualizar.disabled = false;
                btnActualizar.textContent = "Actualizar Usuario";
            });
    });

    // Función para resetear el formulario
    function resetFormulario() {
        console.log("🔄 Reseteando formulario...");

        document.getElementById("campo-usuario-contrasena").style.display = "flex";
        document.getElementById("password").style.display = "flex";
        document.getElementById("mensaje-usuario-contrasena").style.display = "none";
        document.getElementById("campo-estado").style.display = "none";

        document.querySelector(".btn-registrar").style.display = "inline-block";
        document.querySelector(".btn-actualizar").style.display = "none";
        btnCancelar.style.display = "none";

        // Limpiar inputs
        document.getElementById("nombre").value = "";
        document.getElementById("correo").value = "";
        document.getElementById("usuario").value = "";
        document.getElementById("password").value = "";
        document.getElementById("rol").value = "";

        // Limpiar id seleccionado
        tbody.dataset.idSeleccionado = "";
        // 🔥 RECONFIGURAR EL COMPORTAMIENTO DE ENTER
        setTimeout(() => {
            configurarEnterParaSiguienteInput();
        }, 100);

        console.log("✅ Formulario reseteado");
    }

    // Cancelar edición
    btnCancelar.addEventListener("click", () => {
        console.log("🚫 Cancelando edición...");
        resetFormulario();
    });

    // Función para mostrar mensajes
    function showModalMensaje(tipo, titulo, texto) {
        console.log("🪟 Mostrando modal:", tipo, titulo, texto);

        const modalMensaje = document.getElementById("modalMensaje");
        const modalIcono = document.getElementById("modalIcono");
        const modalTitulo = document.getElementById("modalTitulo");
        const modalTexto = document.getElementById("modalTexto");

        if (!modalMensaje) {
            console.error("❌ No se encontró el modal con ID 'modalMensaje'");
            return;
        }

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
        console.log("✅ Modal mostrado");

        // Cerrar automático en 3 segundos
        setTimeout(() => {
            modalMensaje.style.display = "none";
            console.log("🚪 Modal cerrado automáticamente");
        }, 3000);

        // Cerrar manual
        const cerrarBtn = document.getElementById("cerrarMensaje");
        if (cerrarBtn) {
            cerrarBtn.onclick = () => {
                modalMensaje.style.display = "none";
                console.log("🚪 Modal cerrado manualmente");
            };
        }
    }

    // Función para actualizar el estado de los botones
    function actualizarBotones(estadoActual) {
        console.log("🎛️ Actualizando botones para estado:", estadoActual);

        if (estadoActual === "Activo") {
            btnActivos.classList.add("disabled");
            btnInactivos.classList.remove("disabled");
            console.log("✅ Botón Activos: disabled, Botón Inactivos: enabled");
        } else {
            btnInactivos.classList.add("disabled");
            btnActivos.classList.remove("disabled");
            console.log("✅ Botón Inactivos: disabled, Botón Activos: enabled");
        }
    }

    // Regex para validaciones
    const nombreRegex = /^[A-Za-z\s]{2,}$/;
    const correoRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usuarioRegex = /^[A-Za-z0-9_]{4,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._-])[A-Za-z\d!@#$%^&*._-]{8,}$/;

    // Función para validar un input
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
});