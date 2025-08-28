document.addEventListener("DOMContentLoaded", () => {
    let usuariosData = [];
    const tbody = document.querySelector(".tabla-contenedor tbody");

    // Función para cargar usuarios
    function cargarUsuarios() {
        fetch("php/listar_usuarios.php")
            .then(res => res.json())
            .then(data => {
                usuariosData = data;
                tbody.innerHTML = ""; // limpiar tabla
                data.forEach(user => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${user.nombre}</td>
                        <td>${user.correo}</td>
                        <td>${user.usuario}</td>
                        <td>${user.rol}</td>
                        <td>
                            <button class="btn-editar" data-id="${user.id}" >Editar</button>
                            
                        </td>
                    `;
                    tbody.appendChild(tr);

                    // Agregar evento al botón de editar
                    tr.querySelector(".btn-editar").addEventListener("click", () => {
                        document.getElementById("nombre").value = user.nombre;
                        document.getElementById("correo").value = user.correo;
                        // Seleccionar rol automáticamente
                        const rolSelect = document.getElementById("rol");

                        if (user.id_rol == 1) {
                            rolSelect.value = "1"; // Administrador
                        } else if (user.id_rol == 2) {
                            rolSelect.value = "2"; // Empleado
                        } else {
                            rolSelect.value = ""; // fallback si no coincide
                        }

                        // Mostrar div de estado solo si existe el select
                        const estadoSelect = document.getElementById("estado");
                        estadoSelect.value = user.estado;

                        document.getElementById("campo-usuario-contrasena").style.display = "none";
                        document.getElementById("password").style.display = "none";
                        document.getElementById("mensaje-usuario-contrasena").style.display = "block";
                        document.getElementById("campo-estado").style.display = "flex";
                        document.querySelector(".btn-registrar").style.display = "none";
                        document.querySelector(".btn-actualizar").style.display = "inline-block";
                        // Guardar id seleccionado en algún lugar para actualizar luego
                        tbody.dataset.idSeleccionado = user.id_usuario;
                    });

                });
            });
    }

    // Llamar al cargar la página
    cargarUsuarios();

    // Registrar usuario
    const btnRegistrar = document.querySelector(".btn-registrar");
    btnRegistrar.addEventListener("click", () => {
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
    // actualizar

    const btnActualizar = document.querySelector(".btn-actualizar");
    btnActualizar.addEventListener("click", () => {
        const id = tbody.dataset.idSeleccionado;
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const rol = document.getElementById("rol").value;
        const estado = document.getElementById("estado").value;

        if (!nombre || !correo || !rol || !estado) {
            showModalMensaje("advertencia", "Campos incompletos", "Por favor completa todos los campos.");
            return;
        }

        const datos = new FormData();
        datos.append("id_usuario", id);
        datos.append("nombre", nombre);
        datos.append("correo", correo);
        datos.append("rol", rol);
        datos.append("estado", estado);
        console.log({ id, nombre, correo, rol, estado });

        fetch("php/editar_usuarios.php", {
            method: "POST",
            body: datos
        })
            .then(res => res.json())
            .then(data => {

                if (data.status === "success") {
                    showModalMensaje("exito", "Éxito", data.mensaje);

                    cargarUsuarios();

                    // 🔹 Resetear formulario a modo "crear"
                    document.getElementById("campo-usuario-contrasena").style.display = "flex";
                    document.getElementById("password").style.display = "flex";
                    document.getElementById("mensaje-usuario-contrasena").style.display = "none";
                    document.getElementById("campo-estado").style.display = "none";
                    document.querySelector(".btn-registrar").style.display = "inline-block";
                    document.querySelector(".btn-actualizar").style.display = "none";

                    // Limpiar inputs
                    document.getElementById("nombre").value = "";
                    document.getElementById("correo").value = "";
                    document.getElementById("usuario").value = "";
                    document.getElementById("password").value = "";
                    document.getElementById("rol").value = "";
                } else {
                    showModalMensaje("error", "Error", data.mensaje);
                }
            });
    });

    //mensajes
    function showModalMensaje(tipo, titulo, texto) {
        const modalMensaje = document.getElementById("modalMensaje");
        const modalIcono = document.getElementById("modalIcono");
        const modalTitulo = document.getElementById("modalTitulo");
        const modalTexto = document.getElementById("modalTexto");

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

        // Cerrar manual
        document.getElementById("cerrarMensaje").addEventListener("click", () => {
            modalMensaje.style.display = "none";
        });
    }

    //para buscar
    function renderTabla(data) {
        tbody.innerHTML = ""; // limpiar tabla
        data.forEach(user => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.correo}</td>
            <td>${user.usuario}</td>
            <td>${user.rol}</td>
            <td>
                <button class="btn-editar" data-id="${user.id_usuario}" style="background: #0026ff; color: white">Editar</button></td>`;
            tbody.appendChild(tr);

            // Evento editar
            tr.querySelector(".btn-editar").addEventListener("click", () => {
                document.getElementById("nombre").value = user.nombre;
                document.getElementById("correo").value = user.correo;
                document.getElementById("rol").value = user.id_rol;
                document.getElementById("estado").value = user.estado;
                document.getElementById("campo-usuario-contrasena").style.display = "none";
                document.getElementById("campo-estado").style.display = "block";
                document.querySelector(".btn-registrar").style.display = "none";
                document.querySelector(".btn-actualizar").style.display = "inline-block";
                tbody.dataset.idSeleccionado = user.id_usuario;
            });
        });
    }
});



