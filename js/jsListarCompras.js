"use strict";

document.addEventListener("DOMContentLoaded", () => {
    cargarCompras();
});

function cargarCompras() {
    fetch("http://localhost/TallerZelaya/php/obtenerCompras.php")
        .then(res => res.json())
        .then(data => {
            const tablaBody = document.querySelector("#tablaCompras tbody");
            tablaBody.innerHTML = ""; // Limpia solo el cuerpo, no los encabezados

            data.forEach(compra => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                    <td>${compra.id_compra}</td>
                    <td>${compra.empresa}</td>
                    <td>${compra.proveedor ?? "N/A"}</td>
                    <td>${compra.fecha}</td>
                    <td>$${Number(compra.total).toFixed(2)}</td>
                `;

                fila.addEventListener("click", () => {
                    window.location.href = `detalle_compra.html?id=${compra.id_compra}`;
                });

                tablaBody.appendChild(fila);
            });
        })
        .catch(err => console.error("Error al cargar compras:", err));
}
