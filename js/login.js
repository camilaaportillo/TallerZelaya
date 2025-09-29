// js/login.js

class SistemaLogin {
    constructor() {
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
            setTimeout(() => this.cerrarModalRecuperar(), 4000);
        } else {
            this.mostrarMensajeModal(mensajeDiv, resultado.mensaje, 'error');
            
            // ❌ NO cerrar automáticamente en errores
            // El usuario necesita ver el mensaje de error
        }

    } catch (error) {
        console.error('💥 Error:', error);
        this.mostrarMensajeModal(mensajeDiv, '❌ Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        boton.innerHTML = textoOriginal;
        boton.disabled = false;
    }
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