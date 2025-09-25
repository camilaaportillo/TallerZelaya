// js/login.js

class SistemaLogin {
    constructor() {
        this.loginForm = document.getElementById('loginForm');
        this.correoInput = document.getElementById('correo');
        this.contrasenaInput = document.getElementById('contrasena');
        this.mensajeError = document.getElementById('mensajeError');

        this.inicializarEventos();
    }

    inicializarEventos() {
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validarLogin();
        });

        // Limpiar mensaje de error al empezar a escribir
        [this.correoInput, this.contrasenaInput].forEach(input => {
            input.addEventListener('input', () => {
                this.ocultarMensajeError();
            });
        });
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