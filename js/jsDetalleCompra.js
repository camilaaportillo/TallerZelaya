"use strict";
const tablaBody = document.querySelector(".tabla tbody");

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
        cargarDetalle(id);
    }
});

function cargarDetalle(idCompra) {
    fetch(`http://localhost/TallerZelaya/php/obtenerDetalleCompra.php?id=${idCompra}`)
        .then(res => res.json())
        .then(data => {
            mostrarTabla(data);
        })
        .catch(err => console.error("Error al cargar detalle:", err));
}

function mostrarTabla(datos) {
    // Limpia solo el tbody, no la tabla completa
    tablaBody.innerHTML = "";

    datos.forEach(item => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${item.producto}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio_unitario.toFixed(2)}</td>
            <td>$${(item.cantidad * item.precio_unitario).toFixed(2)}</td>
        `;
        tablaBody.appendChild(fila);
    });
}

