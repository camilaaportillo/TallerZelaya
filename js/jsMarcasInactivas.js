document.addEventListener("DOMContentLoaded", () => {
    cargarMarcasInactivas();
});

function cargarMarcasInactivas() {
    fetch("http://localhost/TallerZelaya/php/obtenerMarcasInactivas.php")
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector("table tbody");
            tbody.innerHTML = ""; // limpiar tabla

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3">No hay marcas inactivas</td></tr>`;
                return;
            }

            data.forEach(marca => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${marca.nombre}</td>
                    <td>${marca.estado}</td>
                    <td>
                        <button class="btn-habilitar" onclick="habilitarMarca(${marca.id_marca})">
                            Habilitar
                        </button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error cargando marcas inactivas:", err));
}

function habilitarMarca(id) {
    if (!confirm("¿Seguro que deseas habilitar esta marca?")) return;

    fetch("http://localhost/TallerZelaya/php/habilitarMarca.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "id=" + id
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "exito") {
            alert(result.mensaje);
            cargarMarcasInactivas(); // recargar tabla después de habilitar
        } else {
            alert(result.mensaje);
        }
    })
    .catch(err => console.error("Error habilitando marca:", err));
}
