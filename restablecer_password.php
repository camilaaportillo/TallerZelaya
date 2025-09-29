<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer Contraseña - Taller Zelaya</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/login.css">
    <style>
        .password-strength {
            margin-top: 5px;
            height: 5px;
            border-radius: 5px;
            transition: all 0.3s ease;
        }
        .strength-weak { background: #dc3545; width: 25%; }
        .strength-medium { background: #ffc107; width: 50%; }
        .strength-good { background: #28a745; width: 75%; }
        .strength-strong { background: #20c997; width: 100%; }
        .mensaje-exito { 
            background: #d4edda; 
            color: #155724; 
            border: 1px solid #c3e6cb; 
            padding: 12px; 
            border-radius: 5px; 
            margin: 15px 0; 
            text-align: center;
        }
        .mensaje-error { 
            background: #f8d7da; 
            color: #721c24; 
            border: 1px solid #f5c6cb; 
            padding: 12px; 
            border-radius: 5px; 
            margin: 15px 0; 
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="image-section">
            <h2>Restablecer Contraseña</h2>
            <p>Taller de Bicicletas Zelaya</p>
        </div>

        <div class="form-section">
            <div class="logo">
                <h1 id="titulo">Verificando enlace...</h1>
                <p id="subtitulo">Por favor espera</p>
            </div>

            <div id="formularioRestablecer" style="display: none;">
                <form id="formRestablecer">
                    <div class="form-group">
                        <label for="nuevaContrasena">Nueva Contraseña</label>
                        <input type="password" id="nuevaContrasena" name="nuevaContrasena" 
                               placeholder="Ingresa tu nueva contraseña" required>
                        <div class="password-strength" id="passwordStrength"></div>
                        <small>Mínimo 8 caracteres, con mayúsculas, minúsculas y números</small>
                    </div>

                    <div class="form-group">
                        <label for="confirmarContrasena">Confirmar Contraseña</label>
                        <input type="password" id="confirmarContrasena" name="confirmarContrasena" 
                               placeholder="Confirma tu nueva contraseña" required>
                    </div>
                    <!-- 👁️ UN SOLO CHECKBOX PARA AMBAS CONTRASEÑAS -->
            <!-- 👁️ CHECKBOX SIMPLE SIN ICONOS -->
                <div class="form-group">
                    <label class="simple-checkbox-toggle">
                        <input type="checkbox" class="toggle-password-checkbox" id="toggleBothPasswords">
                        <span class="checkmark"></span>
                        <span class="toggle-label">Ver contraseñas</span>
                    </label>
                </div>

                    <button type="submit" class="login-button">Cambiar Contraseña</button>
                </form>
            </div>

            <div id="mensajeResultado" style="display: none; margin-top: 20px;"></div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="login.html" class="forgot-password">Volver al inicio de sesión</a>
            </div>
        </div>
    </div>

    <script>
        class RestablecerPassword {
            constructor() {
                const urlParams = new URLSearchParams(window.location.search);
                this.token = urlParams.get('token');
                this.form = document.getElementById('formRestablecer');
                this.mensajeResultado = document.getElementById('mensajeResultado');
                this.titulo = document.getElementById('titulo');
                this.subtitulo = document.getElementById('subtitulo');
                this.formulario = document.getElementById('formularioRestablecer');
               
                this.toggleBothPasswordsCheckbox = document.getElementById('toggleBothPasswords');
                this.nuevaContrasenaInput = document.getElementById('nuevaContrasena');
                this.confirmarContrasenaInput = document.getElementById('confirmarContrasena');
                
                console.log('🔄 Inicializando restablecimiento...');
                console.log('🔐 Token:', this.token);
                
                this.inicializar();
            }

            async inicializar() {
                if (!this.token) {
                    this.mostrarError('Enlace inválido. Solicita un nuevo enlace de recuperación.');
                    return;
                }

                // Verificar token
                const valido = await this.verificarToken();
                if (valido) {
                    this.mostrarFormulario();
                }
            }

            async verificarToken() {
                try {
                    console.log('🔍 Verificando token...');
                    
                    const formData = new FormData();
                    formData.append('accion', 'verificar_token');
                    formData.append('token', this.token);

                    const response = await fetch('php/recuperar_password.php', {
                        method: 'POST',
                        body: formData
                    });

                    const resultado = await response.json();
                    console.log('✅ Respuesta verificación:', resultado);

                    if (resultado.exitoso) {
                        this.titulo.textContent = `Hola, ${resultado.usuario.nombre}`;
                        this.subtitulo.textContent = 'Crea tu nueva contraseña';
                        return true;
                    } else {
                        this.mostrarError(resultado.mensaje);
                        return false;
                    }
                } catch (error) {
                    console.error('💥 Error verificando token:', error);
                    this.mostrarError('Error de conexión. Intenta nuevamente.');
                    return false;
                }
            }

            mostrarFormulario() {
                console.log('📝 Mostrando formulario...');
                this.formulario.style.display = 'block';
                
                this.form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.cambiarPassword();
                });
                 // 👁️ EVENTO PARA EL CHECKBOX SIMPLE
            if (this.toggleBothPasswordsCheckbox) {
                this.toggleBothPasswordsCheckbox.addEventListener('change', () => {
                    this.toggleBothPasswords();
                });
            }

               // Indicador de fortaleza de contraseña
        this.nuevaContrasenaInput.addEventListener('input', (e) => {
            this.actualizarFortalezaPassword(e.target.value);
        });
    }
                 // 👁️ Función para mostrar/ocultar AMBAS contraseñas
                toggleBothPasswords() {
                const isChecked = this.toggleBothPasswordsCheckbox.checked;
                const type = isChecked ? 'text' : 'password';
                
                // Cambiar ambas contraseñas
                this.nuevaContrasenaInput.setAttribute('type', type);
                this.confirmarContrasenaInput.setAttribute('type', type);
                
                // Actualizar clase activa en el contenedor
                const container = this.toggleBothPasswordsCheckbox.parentElement;
                if (isChecked) {
                    container.classList.add('active');
                } else {
                    container.classList.remove('active');
                }
            }

            actualizarFortalezaPassword(password) {
                const strengthBar = document.getElementById('passwordStrength');
                let strength = 0;

                if (password.length >= 8) strength++;
                if (/[A-Z]/.test(password)) strength++;
                if (/[a-z]/.test(password)) strength++;
                if (/[0-9]/.test(password)) strength++;
                if (/[^A-Za-z0-9]/.test(password)) strength++;

                strengthBar.className = 'password-strength ';
                if (password.length === 0) {
                    strengthBar.style.width = '0';
                } else if (strength <= 2) {
                    strengthBar.classList.add('strength-weak');
                } else if (strength === 3) {
                    strengthBar.classList.add('strength-medium');
                } else if (strength === 4) {
                    strengthBar.classList.add('strength-good');
                } else {
                    strengthBar.classList.add('strength-strong');
                }
            }

            async cambiarPassword() {
                const nuevaPassword = document.getElementById('nuevaContrasena').value;
                const confirmarPassword = document.getElementById('confirmarContrasena').value;

                console.log('🔄 Cambiando contraseña...');

                // Validaciones
                if (nuevaPassword !== confirmarPassword) {
                    this.mostrarError('Las contraseñas no coinciden', 'error');
                    return;
                }

                if (nuevaPassword.length < 8) {
                    this.mostrarError('La contraseña debe tener al menos 8 caracteres', 'error');
                    return;
                }

                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(nuevaPassword)) {
                    this.mostrarError('La contraseña debe contener mayúsculas, minúsculas y números', 'error');
                    return;
                }

                const boton = this.form.querySelector('button');
                const textoOriginal = boton.innerHTML;
                boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';
                boton.disabled = true;

                try {
                    const formData = new FormData();
                    formData.append('accion', 'cambiar_password');
                    formData.append('token', this.token);
                    formData.append('nuevaPassword', nuevaPassword);

                    console.log('📤 Enviando solicitud de cambio...');

                    const response = await fetch('php/recuperar_password.php', {
                        method: 'POST',
                        body: formData
                    });

                    const resultado = await response.json();
                    console.log('✅ Respuesta cambio:', resultado);

                    if (resultado.exitoso) {
                        this.mostrarError(resultado.mensaje, 'exito');
                        this.form.style.display = 'none';
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 3000);
                    } else {
                        this.mostrarError(resultado.mensaje, 'error');
                    }
                } catch (error) {
                    console.error('💥 Error cambiando contraseña:', error);
                    this.mostrarError('Error de conexión', 'error');
                } finally {
                    boton.innerHTML = textoOriginal;
                    boton.disabled = false;
                }
            }

            mostrarError(mensaje, tipo = 'error') {
                this.mensajeResultado.innerHTML = mensaje;
                this.mensajeResultado.style.display = 'block';
                this.mensajeResultado.className = tipo === 'error' ? 'mensaje-error' : 'mensaje-exito';
            }
        }

        // Inicializar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 DOM cargado, iniciando...');
            new RestablecerPassword();
        });
    </script>
</body>
</html>