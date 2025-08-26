document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.querySelector(".tabla-contenedor tbody");

    function cargarUsuarios() {
        fetch("php/listar_usuarios.php")
            .then(res => res.json())
            .then(data => {
                tbody.innerHTML = ""; // limpiar tabla
                data.forEach(user => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${user.nombre}</td>
                        <td>${user.correo}</td>
                        <td>${user.usuario}</td>
                        <td>${user.rol}</td>
                        <td>
                            <button class="btn-editar" data-id="${user.idUsuario}">Editar</button>
                            <button class="btn-eliminar" data-id="${user.idUsuario}">Eliminar</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            })
            .catch(err => console.error("Error cargando usuarios:", err));
    }

    // Llamar al cargar la página
    cargarUsuarios();

//registrar

    const btnRegistrar = document.querySelector(".btn-registrar");

    btnRegistrar.addEventListener("click", () => {
        const nombre = document.getElementById("nombre").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const usuario = document.getElementById("usuario").value.trim();
        const password = document.getElementById("password").value.trim();
        const rol = document.getElementById("rol").value;

        if (!nombre || !correo || !usuario || !password || !rol) {
            alert("Por favor completa todos los campos.");
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
.then(r => r.text())
.then(txt => {
    console.log("Respuesta cruda:", txt); // 👀 aquí verás el HTML o JSON real
    let data = JSON.parse(txt); // si es JSON válido, esto funciona
    console.log("JSON parseado:", data);
})
.catch(err => console.error("Error parseando:", err));
    });
});

