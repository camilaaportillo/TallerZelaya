// jsClientesInactivos.js
document.addEventListener("DOMContentLoaded", () => {

  const tbody = document.getElementById("tbodyClientesInactivos");
  const inputBuscar = document.getElementById("inputBuscarInactivos");
  const btnLimpiar = document.getElementById("btnLimpiarInactivas");

  // Modales / mensajes
  const modalMensaje = document.getElementById("modalMensaje");
  const modalIcono = document.getElementById("modalIcono");
  const modalTitulo = document.getElementById("modalTitulo");
  const modalTexto = document.getElementById("modalTexto");
  const cerrarMensaje = document.getElementById("cerrarMensaje");

  const modalConfirmar = document.getElementById("modalConfirmar");
  const btnConfirmarHabilitar = document.getElementById("btnConfirmarHabilitar");

  if (!tbody) {
    console.error("tbodyClientesInactivos no encontrado. Verifica el id en el HTML.");
    return;
  }

  let clientesData = [];
  let seleccionadoId = null;

  // Cargar datos desde PHP
  function cargar() {
    fetch("http://localhost/TallerZelaya/php/obtenerClientesInactivos.php")
      .then(res => res.text()) // leer texto para debug si viene HTML
      .then(text => {
        try {
          const data = JSON.parse(text);
          clientesData = Array.isArray(data) ? data : [];
          renderTabla(clientesData);
        } catch (err) {
          console.error("Respuesta no JSON de obtenerClientesInactivos.php:", text);
          showModalMensaje("error", "Error servidor", "Respuesta inválida al cargar clientes. Revisa la consola (Network).");
        }
      })
      .catch(err => {
        console.error("Error cargando clientes inactivos:", err);
        showModalMensaje("error", "Error", "No se pudo conectar con el servidor.");
      });
  }

  function renderTabla(lista) {
    tbody.innerHTML = "";
    if (!lista || lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No hay clientes inactivos</td></tr>`;
      return;
    }

    lista.forEach(c => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre ?? "-"}</td>
        <td>${c.correo ?? "-"}</td>
        <td>${c.telefono ?? "-"}</td>
        <td>${(c.estado == 1 || c.estado === "1") ? "Activo" : "Inactivo"}</td>
        <td>
          <button class="btn-habilitar" data-id="${c.id_cliente}">Habilitar</button>
        </td>
      `;
      const btn = tr.querySelector(".btn-habilitar");
      btn.addEventListener("click", () => {
        seleccionadoId = btn.dataset.id;
        // mostrar modal de confirmación (tu modalConfirmar ya existe en el HTML)
        if (modalConfirmar) modalConfirmar.style.display = "block";
        else if (confirm("¿Seguro que deseas habilitar este cliente?")) habilitar(seleccionadoId);
      });
      tbody.appendChild(tr);
    });
  }

  // Habilitar (llama PHP)
  function habilitar(id) {
    fetch("http://localhost/TallerZelaya/php/habilitarCliente.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `id=${encodeURIComponent(id)}`
    })
    .then(res => res.text())
    .then(text => {
      try {
        const data = JSON.parse(text);
        if (data.status === "exito") {
          showModalMensaje("exito", "Éxito", data.mensaje);
          cargar();
        } else {
          showModalMensaje("error", "Error", data.mensaje || "No se pudo habilitar");
        }
      } catch (e) {
        console.error("Respuesta no JSON habilitarCliente:", text);
        showModalMensaje("error", "Error", "Respuesta inválida del servidor. Revisa la consola.");
      }
    })
    .catch(err => {
      console.error("Error habilitando cliente:", err);
      showModalMensaje("error", "Error", "No se pudo conectar con el servidor.");
    })
    .finally(() => {
      // cerrar modalConfirmar si está abierto
      if (modalConfirmar) modalConfirmar.style.display = "none";
      seleccionadoId = null;
    });
  }

  // confirmar botón
  if (btnConfirmarHabilitar) {
    btnConfirmarHabilitar.addEventListener("click", () => {
      if (!seleccionadoId) return;
      habilitar(seleccionadoId);
    });
  }

  // Buscar por nombre (solo nombre)
  if (inputBuscar && btnLimpiar) {
    inputBuscar.addEventListener("input", () => {
      const q = inputBuscar.value.toLowerCase().trim();
      if (q) {
        btnLimpiar.style.display = "inline";
        const filtrados = clientesData.filter(c => (c.nombre ?? "").toLowerCase().includes(q));
        renderTabla(filtrados);
      } else {
        btnLimpiar.style.display = "none";
        renderTabla(clientesData);
      }
    });

    btnLimpiar.addEventListener("click", () => {
      inputBuscar.value = "";
      btnLimpiar.style.display = "none";
      renderTabla(clientesData);
      inputBuscar.focus();
    });
  } else {
    console.warn("inputBuscarInactivos o btnLimpiarInactivas no encontrados (verifica ids).");
  }

  // Modal de mensajes (simple)
 function showModalMensaje(tipo, titulo, texto) {
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

    setTimeout(() => {
        modalMensaje.style.display = "none";
    }, 3000);
}
  if (cerrarMensaje) cerrarMensaje.addEventListener("click", () => { if (modalMensaje) modalMensaje.style.display = "none"; });

  // cerrar modalConfirmar si haces click fuera (opcional)
  window.addEventListener("click", (e) => {
    if (modalConfirmar && e.target === modalConfirmar) modalConfirmar.style.display = "none";
  });

  // iniciar
  cargar();

}); // end DOMContentLoaded
