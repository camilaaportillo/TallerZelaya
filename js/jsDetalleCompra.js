(async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  // Función irInicio
  window.irInicio = function () {
    window.location.href = "index.html";
  };

  modalMensaje.style.display = "none";

  if (!id) {
    showModalMensaje("advertencia", "Falta Compra", "No se proporcionó un ID de compra");
    return;
  }

  try {
    const res = await fetch(`php/obtenerDetalleCompra.php?id=${id}`);
    const data = await res.json();
    if (data.error) {
      showModalMensaje("error", "Error en petición", data.error);
      return;
    }

    const compra = data.compra;
    const items = data.detalles;
    console.log(compra);
    console.log(items);

    // Empresa
    document.getElementById("empresaNombre").textContent = compra.empresa;
    document.getElementById("empresaContacto").textContent = `${compra.empresa_correo} • ${compra.empresa_telefono}`;

    // Proveedor
    document.getElementById("proveedorNombre").textContent = compra.proveedor;
    document.getElementById("proveedorContacto").textContent = `${compra.proveedor_correo} • ${compra.proveedor_telefono}`;

    // Usuario
    document.getElementById("usuarioNombre").textContent = compra.usuario;
    document.getElementById("usuarioLogin").textContent = compra.usuario_login;

    // Factura
    document.getElementById("facturaId").textContent = "#" + compra.id_compra;
    document.getElementById("facturaFecha").textContent = compra.fecha;

    // Productos
    const tbody = document.querySelector("#tablaProductos tbody");
    tbody.innerHTML = "";
    let total = 0;
    items.forEach((it, i) => {
      const tr = document.createElement("tr");
      const sub = parseFloat(it.subTotal);
      total += sub;
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${it.repuesto} (${it.codigo})</td>
        <td>${it.cantidad}</td>
        <td>${parseFloat(it.precioUnitario).toFixed(2)}</td>
        <td>${sub.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
    });
    document.getElementById("totalFactura").textContent = total.toFixed(2);

    // Imagen
    const btnVer = document.getElementById("verImagen");
    const contImg = document.getElementById("contenedorImagen");
    const img = document.getElementById("facturaImg");
    const linkDesc = document.getElementById("descargarImagen");

    if (compra.facturaImagen) {
      btnVer.addEventListener("click", () => {
        contImg.style.display = "block";
        img.src = "facturas/" + compra.facturaImagen;
        linkDesc.style.display = "inline-block";
        linkDesc.href = "php/descargarFactura.php?id=" + id;
      });
    } else {
      btnVer.style.display = "none";
    }

  } catch (e) {
    console.error(e);
    showModalMensaje("error", "Error al cargar", "Error cargando detalle de la compra");
  }
})();


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
