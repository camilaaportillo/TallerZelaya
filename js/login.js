// js/login.js

class SistemaLogin {
    constructor() {
        this.correoRecuperacionActual = '';
        this.loginForm = document.getElementById('loginForm');
        this.correoInput = document.getElementById('correo');
        this.contrasenaInput = document.getElementById('contrasena');
        this.mensajeError = document.getElementById('mensajeError');

        // 👁️ CHECKBOX SIMPLE PARA LOGIN
        this.togglePasswordCheckbox = document.getElementById('togglePasswordLogin');
        // Elementos de recuperación
        this.modalRecuperar = document.getElementById('modalRecuperar');
        this.formRecuperar = document.getElementById('formRecuperar');
        this.correoRecuperarInput = document.getElementById('correoRecuperar');
        this.mensajeRecuperar = document.getElementById('mensajeRecuperar');


        this.inicializarEventos();
    }

    inicializarEventos() {
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validarLogin();
        });

        // Evento para "Olvidé la contraseña"
        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.mostrarModalRecuperar();
        });
        // Evento del formulario de recuperación
        this.formRecuperar.addEventListener('submit', (e) => {
            e.preventDefault();
            this.solicitarRecuperacion();
        });


        // 👁️ Evento para mostrar/ocultar contraseña en login (checkbox simple)
        if (this.togglePasswordCheckbox) {
            this.togglePasswordCheckbox.addEventListener('change', () => {
                this.togglePassword();
            });
        }

        // Limpiar mensaje de error al empezar a escribir
        [this.correoInput, this.contrasenaInput].forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajeError();
            });
        });

        // Cerrar modal al hacer clic en X o fuera
        this.inicializarEventosModal();
    }

    // 👁️ Función para mostrar/ocultar contraseña (versión simple)
    togglePassword() {
        const isChecked = this.togglePasswordCheckbox.checked;
        const type = isChecked ? 'text' : 'password';
        this.contrasenaInput.setAttribute('type', type);

        // Actualizar clase activa en el contenedor
        const container = this.togglePasswordCheckbox.parentElement;
        if (isChecked) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }

        // Limpiar mensaje de error al empezar a escribir
        [this.correoInput, this.contrasenaInput].forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajeError();
            });
        });
        // Cerrar modal al hacer clic en X o fuera
        this.inicializarEventosModal();
    }
    inicializarEventosModal() {
        // Cerrar modal con la X
        document.querySelector('#modalRecuperar .close').addEventListener('click', () => {
            this.cerrarModalRecuperar();
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target === this.modalRecuperar) {
                this.cerrarModalRecuperar();
            }
        });
    }
    mostrarModalRecuperar() {
        // Agregar clase al body para el efecto de desenfoque
        document.body.classList.add('modal-open');

        this.modalRecuperar.style.display = 'flex';
        this.formRecuperar.reset();
        this.mensajeRecuperar.style.display = 'none';

        // Enfocar el input después de una pequeña pausa para la animación
        setTimeout(() => {
            this.correoRecuperarInput.focus();
        }, 300);
    }

    cerrarModalRecuperar() {
        // Remover clase del body
        document.body.classList.remove('modal-open');

        this.modalRecuperar.style.display = 'none';
        this.mensajeRecuperar.style.display = 'none';
    }

    async validarLogin() {
        const correo = this.correoInput.value.trim();
        const contrasena = this.contrasenaInput.value.trim();

        // Validaciones básicas
        if (!this.validarCampos(correo, contrasena)) {
            return;
        }

        // Mostrar loading en el botón
        const botonLogin = this.loginForm.querySelector('.login-button');
        const textoOriginal = botonLogin.innerHTML;
        botonLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
        botonLogin.disabled = true;

        try {
            const formData = new FormData();
            formData.append('correo', correo);
            formData.append('contrasena', contrasena);

            const response = await fetch('php/login.php', {
                method: 'POST',
                body: formData
            });

            // Verificar si la respuesta es JSON válido
            const responseText = await response.text();
            let resultado;

            try {
                resultado = JSON.parse(responseText);
            } catch (e) {
                console.error('Respuesta del servidor:', responseText);
                throw new Error('El servidor devolvió una respuesta inválida');
            }

            if (resultado.exitoso) {
                this.loginExitoso(resultado);
            } else {
                this.mostrarError(resultado.mensaje);
            }
        } catch (error) {
            this.mostrarError('Error de conexión. Intente nuevamente.');
            console.error('Error en login:', error);
        } finally {
            // Restaurar botón
            botonLogin.innerHTML = textoOriginal;
            botonLogin.disabled = false;
        }
    }

    validarCampos(correo, contrasena) {
        if (!correo || !contrasena) {
            this.mostrarError('Por favor, complete todos los campos.');
            return false;
        }

        if (!this.validarEmail(correo)) {
            this.mostrarError('Por favor, ingrese un correo electrónico válido.');
            return false;
        }

        return true;
    }

    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    loginExitoso(resultado) {
        this.mostrarMensajeExito('¡Login exitoso! Redirigiendo...', 'exito');

        // Guardar información del usuario en sessionStorage
        if (resultado.usuario) {
            sessionStorage.setItem('usuario', JSON.stringify(resultado.usuario));
            sessionStorage.setItem('loggedin', 'true');
            sessionStorage.setItem('usuario_rol', resultado.usuario.rol);
        }

        // Redirigir al dashboard después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
    mostrarError(mensaje) {
        this.mensajeError.textContent = mensaje;
        this.mensajeError.style.display = 'block';
        this.mensajeError.className = 'mensaje-error';

        // Agregar clase de error a los inputs
        this.correoInput.classList.add('error');
        this.contrasenaInput.classList.add('error');
    }

    mostrarMensajeExito(mensaje, tipo) {
        this.mensajeError.textContent = mensaje;
        this.mensajeError.style.display = 'block';
        this.mensajeError.className = `mensaje-${tipo}`;
    }

    ocultarMensajeError() {
        this.mensajeError.style.display = 'none';
        this.mensajeError.textContent = '';

        // Remover clase de error de los inputs
        this.correoInput.classList.remove('error');
        this.contrasenaInput.classList.remove('error');
    }
    //recuperar contraseña
    async solicitarRecuperacion() {
        const correo = this.correoRecuperarInput.value.trim();
        const mensajeDiv = this.mensajeRecuperar;
        const boton = this.formRecuperar.querySelector('button');

        if (!this.validarEmail(correo)) {
            this.mostrarMensajeModal(mensajeDiv, '❌ Por favor, ingrese un correo electrónico válido', 'error');
            return;
        }
        // ✅ CORRECIÓN: GUARDAR EL CORREO ANTES DE CONTINUAR
        this.correoRecuperacionActual = correo; // ⬅️ ESTA LÍNEA FALTABA

        // Mostrar loading
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        boton.disabled = true;

        try {
            // USAR FormData
            const formData = new FormData();
            formData.append('accion', 'solicitar_recuperacion');
            formData.append('correo', correo);

            const response = await fetch('php/recuperar_password.php', {
                method: 'POST',
                body: formData
            });

            const responseText = await response.text();
            console.log('🔧 Respuesta del servidor:', responseText);

            let resultado;
            try {
                resultado = JSON.parse(responseText);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                throw new Error('El servidor devolvió una respuesta inválida');
            }

            if (resultado.exitoso) {
                this.mostrarMensajeModal(mensajeDiv, resultado.mensaje, 'exito');

                // ✅ SOLO CERRAR EN ÉXITO para mostrar modal de código
                if (resultado.mostrar_modal_codigo) {
                    setTimeout(() => {
                        this.cerrarModalRecuperar();
                        this.mostrarModalCodigo();
                    }, 2000);
                } else {
                    setTimeout(() => this.cerrarModalRecuperar(), 4000);
                }
            } else {
                // ✅ CORRECIÓN: NO CERRAR EL MODAL EN ERRORES
                // El usuario necesita ver el mensaje de error y poder intentar nuevamente
                this.mostrarMensajeModal(mensajeDiv, resultado.mensaje, 'error');

                // ❌ QUITAR cualquier setTimeout que cierre el modal automáticamente
                // El modal solo se cierra cuando:
                // 1. El usuario hace clic en la X
                // 2. El usuario hace clic fuera del modal
                // 3. O cuando hay éxito y se muestra el modal de código
            }

        } catch (error) {
            console.error('💥 Error:', error);
            this.mostrarMensajeModal(mensajeDiv, '❌ Error de conexión. Intenta nuevamente.', 'error');
            // ✅ TAMPOCO cerrar en errores de conexión
        } finally {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    }

    // ✅ NUEVO MÉTODO: Mostrar modal de código
    mostrarModalCodigo() {
        const modalHTML = `
    <div id="modalCodigo" class="modal" style="display: flex;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>📧 Verificación por Código</h3>
                <span class="close codigo-close">&times;</span>
            </div>
            <div class="modal-body">
                <p>Se ha enviado un código de 6 dígitos a: <strong>${this.correoRecuperacionActual}</strong></p>
                <p class="info-text">Ingresa el código para continuar con el restablecimiento:</p>
                
                <form id="formCodigo">
                    <div class="form-group">
                        <label for="codigoVerificacion">Código de Verificación</label>
                        <input type="text" id="codigoVerificacion" name="codigo" 
                               placeholder="000000" maxlength="6" pattern="[0-9]{6}" 
                               style="text-align: center; font-size: 18px; letter-spacing: 5px;"
                               required>
                        <small>El código expira en 5 minutos</small>
                    </div>

                    <button type="submit" class="btn-primary">
                        <i class="fas fa-check"></i> Verificar Código
                    </button>
                </form>

                <div style="text-align: center; margin-top: 15px;">
                    <p>¿No recibiste el código?</p>
                    <a href="#" class="reenviar-codigo" style="color: #667eea; text-decoration: none;">
                        <i class="fas fa-redo"></i> Reenviar código
                    </a>
                </div>

                <div id="mensajeCodigo" class="mensaje" style="display: none; margin-top: 15px;"></div>
            </div>
        </div>
    </div>
    `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.inicializarEventosModalCodigo();
    }

    // ✅ NUEVO MÉTODO: Inicializar eventos del modal de código
    inicializarEventosModalCodigo() {
        const modal = document.getElementById('modalCodigo');
        const form = document.getElementById('formCodigo');
        const closeBtn = modal.querySelector('.codigo-close');
        const reenviarBtn = modal.querySelector('.reenviar-codigo');
        const codigoInput = document.getElementById('codigoVerificacion');

        // Auto-tab entre dígitos
        codigoInput.addEventListener('input', (e) => {
            if (e.target.value.length === 6) {
                form.dispatchEvent(new Event('submit'));
            }
        });

        form.addEventListener('submit', (e) => this.verificarCodigo(e));
        reenviarBtn.addEventListener('click', (e) => this.reenviarCodigo(e));

        closeBtn.addEventListener('click', () => this.cerrarModalCodigo());
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.cerrarModalCodigo();
        });

        // Enfocar el input
        setTimeout(() => codigoInput.focus(), 300);
    }

    // ✅ NUEVO MÉTODO: Verificar código
    async verificarCodigo(e) {
        e.preventDefault();
        const codigo = document.getElementById('codigoVerificacion').value.trim();
        const mensajeDiv = document.getElementById('mensajeCodigo');
        const boton = document.querySelector('#formCodigo button');

        if (codigo.length !== 6 || !/^\d+$/.test(codigo)) {
            this.mostrarMensajeCodigo(mensajeDiv, '❌ El código debe tener exactamente 6 dígitos', 'error');
            return;
        }

        // Mostrar loading
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
        boton.disabled = true;

        try {
            const formData = new FormData();
            formData.append('accion', 'verificar_codigo');
            formData.append('correo', this.correoRecuperacionActual);
            formData.append('codigo', codigo);

            const response = await fetch('php/recuperar_password.php', {
                method: 'POST',
                body: formData
            });

            const resultado = await response.json();
            console.log('✅ Respuesta verificación código:', resultado);

            if (resultado.exitoso) {
                this.mostrarMensajeCodigo(mensajeDiv, '✅ Código verificado correctamente. Redirigiendo...', 'exito');

                // Redirigir a la página de restablecimiento con el token
                setTimeout(() => {
                    window.location.href = `restablecer_password.php?token=${resultado.token}`;
                }, 1500);
            } else {
                this.mostrarMensajeCodigo(mensajeDiv, resultado.mensaje, 'error');
            }

        } catch (error) {
            console.error('💥 Error verificando código:', error);
            this.mostrarMensajeCodigo(mensajeDiv, '❌ Error de conexión. Intenta nuevamente.', 'error');
        } finally {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }
    }

// ✅ MÉTODO MEJORADO: Reenviar código
async reenviarCodigo(e) {
    e.preventDefault();
    const mensajeDiv = document.getElementById('mensajeCodigo');
    const reenviarBtn = document.querySelector('.reenviar-codigo');

    // Mostrar loading
    const textoOriginal = reenviarBtn.innerHTML;
    reenviarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Reenviando...';
    reenviarBtn.style.pointerEvents = 'none';

    try {
        const formData = new FormData();
        formData.append('accion', 'reenviar_codigo');
        formData.append('correo', this.correoRecuperacionActual);

        const response = await fetch('php/recuperar_password.php', {
            method: 'POST',
            body: formData
        });

        // ✅ OBTENER TEXTO DE RESPUESTA
        const responseText = await response.text();
        console.log('🔧 Respuesta cruda:', responseText);

        let resultado;
        
        try {
            resultado = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError);
            throw new Error('El servidor devolvió una respuesta inválida: ' + responseText.substring(0, 100));
        }

        // ✅ VERIFICAR QUE RESULTADO NO SEA NULL
        if (!resultado) {
            throw new Error('El servidor devolvió una respuesta vacía');
        }

        console.log('✅ Respuesta parseada:', resultado);

        if (resultado.exitoso) {
            this.mostrarMensajeCodigo(mensajeDiv, resultado.mensaje, 'exito');
            
            // Ocultar mensaje después de 5 segundos
            setTimeout(() => {
                if (mensajeDiv.style.display !== 'none') {
                    mensajeDiv.style.display = 'none';
                }
            }, 5000);
        } else {
            this.mostrarMensajeCodigo(mensajeDiv, resultado.mensaje, 'error');
        }

    } catch (error) {
        console.error('💥 Error reenviando código:', error);
        this.mostrarMensajeCodigo(mensajeDiv, '❌ Error: ' + error.message, 'error');
    } finally {
        reenviarBtn.innerHTML = textoOriginal;
        reenviarBtn.style.pointerEvents = 'auto';
    }
}

    // ✅ NUEVO MÉTODO: Mostrar mensaje en modal de código
    mostrarMensajeCodigo(mensajeDiv, mensaje, tipo) {
        mensajeDiv.textContent = mensaje;
        mensajeDiv.style.display = 'block';
        mensajeDiv.className = `mensaje ${tipo}`;

        if (tipo === 'error') {
            mensajeDiv.style.background = '#f8d7da';
            mensajeDiv.style.color = '#721c24';
            mensajeDiv.style.border = '1px solid #f5c6cb';
        } else {
            mensajeDiv.style.background = '#d4edda';
            mensajeDiv.style.color = '#155724';
            mensajeDiv.style.border = '1px solid #c3e6cb';
        }
    }

    // ✅ NUEVO MÉTODO: Cerrar modal de código
    cerrarModalCodigo() {
        const modal = document.getElementById('modalCodigo');
        if (modal) {
            modal.remove();
        }
        this.correoRecuperacionActual = '';
    }

    // Función auxiliar para extraer mensajes de error de PHP
    extraerMensajeErrorPHP(html) {
        // Intentar extraer el mensaje de error entre tags
        const match = html.match(/<b>(.*?)<\/b>/);
        if (match) return match[1];

        // Si no encuentra tags, devolver las primeras 100 caracteres
        return html.substring(0, 100) + '...';
    }

    mostrarMensajeModal(mensajeDiv, mensaje, tipo) {
        mensajeDiv.textContent = mensaje;
        mensajeDiv.style.display = 'block';
        mensajeDiv.className = `mensaje ${tipo}`;

        // Estilos según el tipo
        if (tipo === 'error') {
            mensajeDiv.style.background = '#f8d7da';
            mensajeDiv.style.color = '#721c24';
            mensajeDiv.style.border = '1px solid #f5c6cb';
        } else {
            mensajeDiv.style.background = '#d4edda';
            mensajeDiv.style.color = '#155724';
            mensajeDiv.style.border = '1px solid #c3e6cb';
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SistemaLogin();
});

// Verificar si ya está logueado al cargar la página
function verificarSesion() {
    if (sessionStorage.getItem('loggedin') === 'true') {
        window.location.href = 'index.html';
    }
}


// Ejecutar verificación al cargar
verificarSesion();