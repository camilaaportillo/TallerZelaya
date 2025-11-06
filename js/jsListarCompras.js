"use strict";

document.addEventListener("DOMContentLoaded", () => {
    cargarCompras();
});

// Función irInicio
window.irInicio = function () {
    window.location.href = "index.html";
};

function cargarCompras() {
    fetch("php/obtenerCompras.php")
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
    }, 2000);
}
